import axios from 'axios';

// Base configuration for API calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Define interfaces for type safety
export interface ChatMessage {
  id?: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp?: Date;
}

export interface DocumentUploadResponse {
  success: boolean;
  documentId?: string;
  message?: string;
}

// API Service for handling chat and document-related operations
export const apiService = {
  // Send a chat message
  sendMessage: async (message: string): Promise<ChatMessage> => {
    try {
      const response = await axios.post<ChatMessage>(`${API_BASE_URL}/chat`, {
        content: message,
        sender: 'user'
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Upload a document
  uploadDocument: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post<DocumentUploadResponse>(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Fetch chat history
  getChatHistory: async (): Promise<ChatMessage[]> => {
    try {
      const response = await axios.get<ChatMessage[]>(`${API_BASE_URL}/chat/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};
