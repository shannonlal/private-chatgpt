import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../lib/mongodb';
import Conversation from '../../models/Conversation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Fetch conversations with their latest message preview
    const conversations = await Conversation.aggregate([
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'conversationId',
          pipeline: [{ $sort: { timestamp: -1 } }, { $limit: 1 }],
          as: 'latestMessage',
        },
      },
      {
        $project: {
          id: '$_id',
          createdAt: 1,
          lastMessagePreview: { $arrayElemAt: ['$latestMessage.content', 0] },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    // Transform MongoDB _id to string
    const formattedConversations = conversations.map(conv => ({
      id: conv.id.toString(),
      createdAt: conv.createdAt,
      lastMessagePreview: conv.lastMessagePreview || '',
    }));

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      message: 'Failed to fetch conversations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
