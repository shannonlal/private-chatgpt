import React, { useState } from 'react';
import { TextArea } from '@/ui-kit/TextArea';
import { Button } from '@/ui-kit/Button';
import { IconSend } from '@/ui-kit/icons/IconSend';
import { useConversation } from '@/contexts/ConversationContext';
import { v4 as uuidv4 } from 'uuid';

const PromptInput: React.FC = () => {
  // State Management
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');

  // Use Conversation Context
  const {
    addMessageToHistory,
    setSystemPrompt: setContextSystemPrompt,
    setUserPrompt: setContextUserPrompt,
  } = useConversation();

  // Send Message Handler
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate input
    if (!userPrompt.trim()) return;

    // Add system prompt to context if exists
    if (systemPrompt.trim()) {
      addMessageToHistory({
        id: uuidv4(),
        role: 'system',
        content: systemPrompt.trim(),
        timestamp: new Date(),
      });
      setContextSystemPrompt(systemPrompt.trim());
    }

    // Add user message to history
    addMessageToHistory({
      id: uuidv4(),
      role: 'user',
      content: userPrompt.trim(),
      timestamp: new Date(),
    });

    // Update context user prompt
    setContextUserPrompt(userPrompt.trim());

    // Clear input fields
    setSystemPrompt('');
    setUserPrompt('');
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="flex flex-col space-y-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm
        transition-all duration-300 ease-in-out
        hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
    >
      {/* System Prompt Input */}
      <TextArea
        value={systemPrompt}
        onChange={e => setSystemPrompt(e.target.value)}
        placeholder="Enter system prompt (optional)"
        className="w-full transition-colors duration-300
          focus:border-primary focus:ring-1 focus:ring-primary
          hover:border-gray-300"
        rows={2}
      />

      {/* User Prompt Input */}
      <TextArea
        value={userPrompt}
        onChange={e => setUserPrompt(e.target.value)}
        placeholder="Enter your message"
        className="w-full transition-colors duration-300
          focus:border-primary focus:ring-1 focus:ring-primary
          hover:border-gray-300"
        rows={4}
        required
      />

      {/* Send Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={!userPrompt.trim()}
          className="flex items-center space-x-2
            transition-all duration-300 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span>Send</span>
          <IconSend className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </div>
    </form>
  );
};

export default PromptInput;
