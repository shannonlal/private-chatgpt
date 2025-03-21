import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ConversationDocument extends mongoose.Document {
  userId?: string;
  isDeleted: boolean;
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
}

const ConversationSchema = new mongoose.Schema<ConversationDocument>(
  {
    conversationId: {
      type: String,
      default: uuidv4,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      },
    ],
  },
  {
    timestamps: true,
    query: {
      byNotDeleted() {
        return this.where({ isDeleted: false });
      },
    },
  }
);

// Soft delete method
ConversationSchema.methods.softDelete = function () {
  this.isDeleted = true;
  return this.save();
};

// Method to add a message to the conversation
ConversationSchema.methods.addMessage = async function (messageId: mongoose.Types.ObjectId) {
  this.messages.push(messageId);
  return this.save();
};

// Method to get conversation messages
ConversationSchema.methods.getMessages = function () {
  return this.populate('messages');
};

// Prevent returning deleted conversations by default
ConversationSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationDocument>('Conversation', ConversationSchema);

export default Conversation;
