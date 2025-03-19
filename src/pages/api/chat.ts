import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  OpenAIErrorResponse,
  Message as _Message,
} from '../../types/chat';

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
    const { systemPrompt, userPrompt, conversationHistory }: ChatCompletionRequest = req.body;

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

    return res.status(200).json({ assistantResponse });
  } catch (error) {
    console.error('OpenAI API Error:', error);

    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({
        error: {
          message: error.message,
          type: 'openai_api_error',
          code: error.code,
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
