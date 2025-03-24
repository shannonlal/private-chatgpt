export interface Message {
  id?: string;
  conversationId?: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatCompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  conversationHistory?: Message[];
  conversationId?: string;
}

export interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    code?: string;
    param?: string;
  };
}

export interface ChatCompletionResponse {
  assistantResponse: string;
  conversationId: string;
  conversationName?: string;
}
