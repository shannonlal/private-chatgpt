import React, { createContext, useState, Dispatch, SetStateAction, ReactNode } from 'react';

// Message interface to define the structure of chat messages
export interface Message {
  id: string; // Unique identifier for each message
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
}

// Context type definition with all required state and methods
export interface ConversationContextType {
  systemPrompt: string;
  userPrompt: string;
  conversationHistory: Message[];

  // Setters for prompts
  setSystemPrompt: Dispatch<SetStateAction<string>>;
  setUserPrompt: Dispatch<SetStateAction<string>>;

  // Methods to manage conversation
  addMessageToHistory: (message: Message) => void;
  clearConversationHistory: () => void;
}

// Create the context with undefined initial value
const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

// Provider component
export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  // Method to add a message to conversation history
  const addMessageToHistory = (message: Message) => {
    setConversationHistory(prevHistory => [...prevHistory, message]);
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
    addMessageToHistory,
    clearConversationHistory
  };

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
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
