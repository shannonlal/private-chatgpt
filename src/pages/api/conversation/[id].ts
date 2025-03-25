import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Conversation from '../../../models/Conversation';
import Message from '../../../models/Message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Find the conversation
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Fetch messages for this conversation
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ timestamp: 1 });

    // Return conversation details and messages
    res.status(200).json({
      conversationId: conversation._id.toString(),
      conversationName: conversation.conversationName || 'Unnamed Conversation',
      messages: messages.map(msg => ({
        id: msg._id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        conversationId: msg.conversationId.toString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      message: 'Failed to fetch conversation',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
