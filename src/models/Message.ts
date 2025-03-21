import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Message as MessageType } from '../types/chat';

export interface MessageDocument extends Omit<MessageType, 'id'>, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  messageId: string;
}

const MessageSchema = new mongoose.Schema<MessageDocument>(
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

// Method to find messages by conversation
MessageSchema.statics.findByConversation = function (conversationId: mongoose.Types.ObjectId) {
  return this.find({ conversation: conversationId }).sort({ timestamp: 1 });
};

// Method to create a new message and add it to a conversation
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

export const Message =
  mongoose.models.Message || mongoose.model<MessageDocument>('Message', MessageSchema);

export default Message;
