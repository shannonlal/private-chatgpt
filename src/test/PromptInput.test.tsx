import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConversationProvider } from '@/contexts/ConversationContext';
import PromptInput from '@/components/chat/PromptInput';

describe('PromptInput Component', () => {
  // Test rendering
  it('renders system and user prompt text areas', () => {
    render(
      <ConversationProvider>
        <PromptInput />
      </ConversationProvider>
    );

    expect(screen.getByPlaceholderText('Enter system prompt (optional)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
  });

  // Test sending message
  it('sends message and clears inputs', () => {
    const { getByPlaceholderText, getByText } = render(
      <ConversationProvider>
        <PromptInput />
      </ConversationProvider>
    );

    const systemPromptInput = getByPlaceholderText('Enter system prompt (optional)');
    const userPromptInput = getByPlaceholderText('Enter your message');
    const sendButton = getByText('Send');

    // Enter prompts
    fireEvent.change(systemPromptInput, { target: { value: 'Test system prompt' } });
    fireEvent.change(userPromptInput, { target: { value: 'Test user message' } });

    // Send message
    fireEvent.click(sendButton);

    // Check inputs are cleared
    expect(systemPromptInput).toHaveValue('');
    expect(userPromptInput).toHaveValue('');
  });

  // Test send button disabled
  // it('disables send button when user prompt is empty', () => {
  //   const { getByText } = render(
  //     <ConversationProvider>
  //       <PromptInput />
  //     </ConversationProvider>
  //   );

  //   const sendButton = getByText('Send');
  //   expect(sendButton).toBeDisabled();
  // });
});
