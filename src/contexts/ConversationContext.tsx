import React, {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message as _Message } from '../types/chat';
import axios from 'axios';

// Conversation summary type
export interface ConversationSummary {
  id: string;
  createdAt: number;
  conversationName: string;
  lastMessagePreview?: string;
}

// Context type definition with all required state and methods
export interface ConversationContextType {
  systemPrompt: string;
  userPrompt: string;
  conversationHistory: _Message[];
  currentConversationId: string | null;
  conversations: ConversationSummary[];

  // Setters for prompts and conversation management
  setSystemPrompt: Dispatch<SetStateAction<string>>;
  setUserPrompt: Dispatch<SetStateAction<string>>;

  // Methods to manage conversation
  addUserMessageToHistory: (content: string) => void;
  addAssistantMessageToHistory: (content: string) => void;
  addMessageToHistory: (message: _Message) => void;
  clearConversationHistory: () => void;

  // New conversation management methods
  selectConversation: (conversationId: string) => Promise<void>;
  createNewConversation: () => void;
  fetchConversationsList: () => Promise<void>;
  setCurrentConversation: (id: string) => void;
}

// Export Message type for use in tests
export type Message = _Message;

// Create the context with undefined initial value
const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

// Provider component
export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<_Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  // Method to fetch conversations list
  const fetchConversationsList = useCallback(async () => {
    try {
      const response = await axios.get('/api/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    }
  }, []);

  // Method to select a conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      // Fetch conversation messages
      const response = await axios.get(`/api/conversation/${conversationId}`);

      // Update conversation state
      setCurrentConversationId(conversationId);
      setConversationHistory(response.data.messages);

      // Set system prompt from first message if exists
      const systemMessage = response.data.messages.find((msg: _Message) => msg.role === 'system');
      if (systemMessage) {
        setSystemPrompt(systemMessage.content);
      }
    } catch (error) {
      console.error('Failed to load conversation', error);
    }
  }, []);

  // Method to create a new conversation
  const createNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setConversationHistory([]);
    setSystemPrompt('');
    setUserPrompt('');
  }, []);

  // Method to add a user message to conversation history
  const addUserMessageToHistory = (content: string) => {
    const newMessage: _Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      conversationId: currentConversationId || undefined,
    };
    setConversationHistory(prevHistory => [...prevHistory, newMessage]);
  };

  // Method to add an assistant message to conversation history
  const addAssistantMessageToHistory = (content: string) => {
    const newMessage: _Message = {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      conversationId: currentConversationId || undefined,
    };
    setConversationHistory(prevHistory => [...prevHistory, newMessage]);
  };

  // Generic method to add a message to conversation history
  const addMessageToHistory = (message: _Message) => {
    setConversationHistory(prevHistory => [
      ...prevHistory,
      {
        ...message,
        conversationId: currentConversationId || message.conversationId,
      },
    ]);
  };

  // Method to clear conversation history
  const clearConversationHistory = () => {
    setConversationHistory([]);
    setCurrentConversationId(null);
    setSystemPrompt('');
    setUserPrompt('');
  };

  const setCurrentConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  // Context value to be provided
  const contextValue: ConversationContextType = {
    systemPrompt,
    userPrompt,
    conversationHistory,
    currentConversationId,
    conversations,
    setSystemPrompt,
    setUserPrompt,
    addUserMessageToHistory,
    addAssistantMessageToHistory,
    addMessageToHistory,
    clearConversationHistory,
    selectConversation,
    createNewConversation,
    fetchConversationsList,
    setCurrentConversation,
  };

  return (
    <ConversationContext.Provider value={contextValue}>{children}</ConversationContext.Provider>
  );
};

// Custom hook to use conversation context
export const useConversation = (): ConversationContextType => {
  const context = React.useContext(ConversationContext);

  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }

  return context;
};
