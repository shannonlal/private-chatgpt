import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Message as MessageType } from '../types/chat';

export interface MessageDocument extends Omit<MessageType, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  messageId: string;
}

// Define static methods interface
interface MessageModel extends mongoose.Model<MessageDocument> {
  createForConversation(
    conversationId: mongoose.Types.ObjectId,
    messageData: Partial<MessageDocument>
  ): Promise<MessageDocument>;
}

const MessageSchema = new mongoose.Schema<MessageDocument, MessageModel>(
  {
    messageId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      default: () => Date.now(),
      index: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for efficient querying
MessageSchema.index({ conversation: 1, timestamp: -1 });

// Static method to create a message for a specific conversation
MessageSchema.statics.createForConversation = async function (
  conversationId: mongoose.Types.ObjectId,
  messageData: Partial<MessageDocument>
) {
  const message = new this({
    ...messageData,
    conversation: conversationId,
  });
  return message.save();
};

// Method to find messages by conversation
MessageSchema.statics.findByConversation = function (conversationId: mongoose.Types.ObjectId) {
  return this.find({ conversation: conversationId }).sort({ timestamp: 1 });
};

export const Message =
  mongoose.models.Message ||
  mongoose.model<MessageDocument, MessageModel>('Message', MessageSchema);

export default Message;
