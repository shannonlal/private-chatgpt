export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatCompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  conversationHistory?: Message[];
}

export interface ChatCompletionResponse {
  assistantResponse: string;
}

export interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}
