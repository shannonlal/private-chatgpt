import mongoose from 'mongoose';
import { Message as MessageType } from '../types/chat';

export interface MessageDocument extends Omit<MessageType, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
}

const MessageSchema = new mongoose.Schema<MessageDocument>(
  {
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

export const Message =
  mongoose.models.Message || mongoose.model<MessageDocument>('Message', MessageSchema);

export default Message;
