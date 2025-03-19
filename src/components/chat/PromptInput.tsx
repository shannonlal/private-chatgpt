import React, { useState } from 'react';
import { TextArea } from '@/ui-kit/TextArea';
import { Button } from '@/ui-kit/Button';
import { IconSend } from '@/ui-kit/icons/IconSend';
import { IconError } from '@/ui-kit/icons/IconError';
import { useConversation } from '@/contexts/ConversationContext';
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  OpenAIErrorResponse,
} from '../../types/chat';

const PromptInput: React.FC = () => {
  // State Management
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');

  // Use Conversation Context
  const {
    addUserMessageToHistory,
    addAssistantMessageToHistory,
    setSystemPrompt: setContextSystemPrompt,
    setUserPrompt: setContextUserPrompt,
    conversationHistory,
  } = useConversation();

  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate input
    if (!userPrompt.trim()) return;

    // Add system prompt to context if exists
    if (systemPrompt.trim()) {
      setContextSystemPrompt(systemPrompt.trim());
    }

    // Add user message to history
    addUserMessageToHistory(userPrompt.trim());

    // Update context user prompt
    setContextUserPrompt(userPrompt.trim());

    setIsLoading(true);

    try {
      // Prepare request payload
      const requestPayload: ChatCompletionRequest = {
        systemPrompt: systemPrompt.trim() || 'You are a helpful AI assistant.',
        userPrompt: userPrompt.trim(),
        conversationHistory: conversationHistory,
      };

      // Send request to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const data: ChatCompletionResponse | OpenAIErrorResponse = await response.json();

      if (!response.ok) {
        const errorData = data as OpenAIErrorResponse;
        throw new Error(errorData.error.message || 'Failed to get assistant response');
      }

      const completionData = data as ChatCompletionResponse;

      // Add assistant response to history
      addAssistantMessageToHistory(completionData.assistantResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      // Clear input fields
      setSystemPrompt('');
      setUserPrompt('');
      setIsLoading(false);
    }
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

      {/* Error Display */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <div className="flex items-center">
            <IconError className="w-6 h-6 mr-2" />
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Send Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={!userPrompt.trim() || isLoading}
          className="flex items-center space-x-2
            transition-all duration-300 ease-in-out
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span>{isLoading ? 'Sending...' : 'Send'}</span>
          {isLoading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <IconSend className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </Button>
      </div>
    </form>
  );
};

export default PromptInput;
