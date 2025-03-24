import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ConversationDocument extends mongoose.Document {
  userId?: string;
  isDeleted: boolean;
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
  conversationName?: string;
}

// Define static methods interface
interface ConversationModel extends mongoose.Model<ConversationDocument> {
  findByConversationId(conversationId: string): Promise<ConversationDocument | null>;
}

const ConversationSchema = new mongoose.Schema<ConversationDocument, ConversationModel>(
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
    conversationName: {
      type: String,
      required: false,
      default: null,
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

// Static method to find conversation by conversationId
ConversationSchema.statics.findByConversationId = function (conversationId: string) {
  return this.findOne({ conversationId });
};

// Prevent returning deleted conversations by default
ConversationSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationDocument, ConversationModel>('Conversation', ConversationSchema);

export default Conversation;
