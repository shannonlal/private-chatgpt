import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  OpenAIErrorResponse,
  Message as _Message,
} from '../../types/chat';
import connectMongoDB from '../../lib/mongodb';
import Conversation from '../../models/Conversation';
import Message from '../../models/Message';

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in the environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatCompletionResponse | OpenAIErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        message: 'Method Not Allowed',
        type: 'method_not_allowed',
      },
    });
  }

  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Manually parse the body
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    const body = JSON.parse(buffer.toString());

    // Validate request body
    if (!body.systemPrompt || !body.userPrompt) {
      return res.status(400).json({
        error: {
          message: 'Missing required fields: systemPrompt or userPrompt',
          type: 'validation_error',
        },
      });
    }

    const { systemPrompt, userPrompt, conversationHistory, conversationId }: ChatCompletionRequest =
      body;

    // Find or create conversation
    let conversation = conversationId ? await Conversation.findOne({ conversationId }) : null;

    if (!conversation) {
      conversation = new Conversation({
        conversationId: uuidv4(),
        messages: [],
      });
      await conversation.save();
    }

    // Create and save system message
    const systemMessage = await Message.createForConversation(conversation._id, {
      role: 'system',
      content: systemPrompt,
      timestamp: Date.now(),
    });

    // Create and save user message
    const userMessage = await Message.createForConversation(conversation._id, {
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    });

    // Construct messages for OpenAI API
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || [])
        .filter(msg => msg.role !== 'system')
        .map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: userPrompt },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    // Extract assistant's response
    const assistantResponse = completion.choices[0]?.message?.content?.trim() ?? '';

    // Create and save assistant message
    const assistantMessage = await Message.createForConversation(conversation._id, {
      role: 'assistant',
      content: assistantResponse,
      timestamp: Date.now(),
    });

    // Update conversation with new messages
    conversation.messages.push(systemMessage._id, userMessage._id, assistantMessage._id);
    await conversation.save();

    return res.status(200).json({
      assistantResponse,
      conversationId: conversation.conversationId,
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (error instanceof SyntaxError) {
      return res.status(400).json({
        error: {
          message: 'Invalid JSON in request body',
          type: 'parsing_error',
        },
      });
    }

    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({
        error: {
          message: error.message,
          type: 'openai_api_error',
          code: error.code || undefined,
        },
      });
    }

    return res.status(500).json({
      error: {
        message: 'An unexpected error occurred',
        type: 'internal_server_error',
      },
    });
  }
}

// Disable body parsing to allow raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
