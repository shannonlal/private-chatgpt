import React, { createContext, useState, useContext, useCallback } from 'react';
import { apiService, ChatMessage, handleApiError } from '../services/api.service';

// Define the shape of the chat context
interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  fetchChatHistory: () => Promise<void>;
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType>({
  messages: [],
  isLoading: false,
  error: null,
  sendMessage: async () => Promise.resolve(),
  uploadDocument: async () => Promise.resolve(),
  fetchChatHistory: async () => Promise.resolve()
});

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send a chat message
  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMessage = await apiService.sendMessage(content);
      setMessages(prevMessages => [...prevMessages, newMessage]);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Upload a document
  const uploadDocument = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.uploadDocument(file);
      if (response.success) {
        // Optionally add a message about successful upload
        const uploadMessage: ChatMessage = {
          content: `Document uploaded successfully. Document ID: ${response.documentId}`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, uploadMessage]);
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch chat history
  const fetchChatHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await apiService.getChatHistory();
      setMessages(history);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Provide context value
  const contextValue: ChatContextType = {
    messages,
    isLoading,
    error,
    sendMessage,
    uploadDocument,
    fetchChatHistory
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use the chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
