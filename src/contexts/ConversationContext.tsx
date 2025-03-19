import React, { createContext, useState, Dispatch, SetStateAction, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message as _Message } from '../types/chat';

// Context type definition with all required state and methods
export interface ConversationContextType {
  systemPrompt: string;
  userPrompt: string;
  conversationHistory: _Message[];

  // Setters for prompts
  setSystemPrompt: Dispatch<SetStateAction<string>>;
  setUserPrompt: Dispatch<SetStateAction<string>>;

  // Methods to manage conversation
  addUserMessageToHistory: (content: string) => void;
  addAssistantMessageToHistory: (content: string) => void;
  clearConversationHistory: () => void;
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

  // Method to add a user message to conversation history
  const addUserMessageToHistory = (content: string) => {
    const newMessage: _Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
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
    };
    setConversationHistory(prevHistory => [...prevHistory, newMessage]);
  };

  // Method to clear conversation history
  const clearConversationHistory = () => {
    setConversationHistory([]);
  };

  // Context value to be provided
  const contextValue: ConversationContextType = {
    systemPrompt,
    userPrompt,
    conversationHistory,
    setSystemPrompt,
    setUserPrompt,
    addUserMessageToHistory,
    addAssistantMessageToHistory,
    clearConversationHistory,
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
