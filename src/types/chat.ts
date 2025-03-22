import { Types } from 'mongoose';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  id?: string;
  conversationId?: string;
}

export interface ChatCompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  conversationHistory?: Message[];
  conversationId?: string;
}

export interface ChatCompletionResponse {
  assistantResponse: string;
  conversationId: string;
}

export interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

// Mongoose-specific types for reference in models
export type MongoId = Types.ObjectId;
