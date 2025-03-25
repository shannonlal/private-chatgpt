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
    } else if (req.method === 'PUT') {
      // Update conversation name
      const { conversationName } = req.body;

      // Validate conversation name
      if (!conversationName || conversationName.trim().length === 0) {
        return res.status(400).json({ message: 'Conversation name cannot be empty' });
      }

      if (conversationName.length > 50) {
        return res.status(400).json({ message: 'Conversation name must be 50 characters or less' });
      }

      try {
        // Convert string ID to ObjectId
        const conversationObjectId = new ObjectId(id);

        // Update the conversation name
        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationObjectId,
          { conversationName: conversationName.trim() },
          { new: true }
        );

        if (!updatedConversation) {
          return res.status(404).json({ message: 'Conversation not found' });
        }

        return res.status(200).json({
          message: 'Conversation name updated successfully',
          conversation: {
            id: updatedConversation.conversationId,
            conversationName: updatedConversation.conversationName,
          },
        });
      } catch (error) {
        console.error('Error updating conversation name:', error);
        return res.status(500).json({
          message: 'Failed to update conversation name',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
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
