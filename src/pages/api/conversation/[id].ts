import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Conversation from '../../../models/Conversation';
import Message from '../../../models/Message';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }

  try {
    if (req.method === 'GET') {
      // Fetch conversation messages
      const conversationObjectId = new ObjectId(id);

      // Find the conversation first to ensure it exists
      const conversation = await Conversation.findById(conversationObjectId);
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      // Fetch messages for this conversation
      const messages = await Message.find({ conversation: conversationObjectId }).sort({
        timestamp: 1,
      });

      // Transform messages to match the expected format
      const formattedMessages = messages.map(msg => ({
        id: msg.messageId,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        conversationId: id,
      }));

      res.status(200).json({ messages: formattedMessages });
    } else if (req.method === 'DELETE') {
      // Convert string ID to ObjectId
      const conversationObjectId = new ObjectId(id);

      // Delete all messages associated with the conversation
      await Message.deleteMany({ conversation: conversationObjectId });

      // Delete the conversation
      const deleteResult = await Conversation.deleteOne({ _id: conversationObjectId });

      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      return res
        .status(200)
        .json({ message: 'Conversation and associated messages deleted successfully' });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error processing conversation request:', error);
    res.status(500).json({
      message: 'Failed to process conversation request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
