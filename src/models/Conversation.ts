import mongoose from 'mongoose';

export interface ConversationDocument extends mongoose.Document {
  userId?: string;
  isDeleted: boolean;
  messages: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new mongoose.Schema<ConversationDocument>(
  {
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

// Prevent returning deleted conversations by default
ConversationSchema.pre('find', function () {
  this.where({ isDeleted: false });
});

export const Conversation =
  mongoose.models.Conversation ||
  mongoose.model<ConversationDocument>('Conversation', ConversationSchema);

export default Conversation;
