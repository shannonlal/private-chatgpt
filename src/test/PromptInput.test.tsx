import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationProvider } from '@/contexts/ConversationContext';
import PromptInput from '@/components/chat/PromptInput';

// Mock fetch
global.fetch = vi.fn();

describe('PromptInput Component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    vi.resetAllMocks();
  });

  // Test rendering
  it('renders system and user prompt text areas', () => {
    render(
      <ConversationProvider>
        <PromptInput />
      </ConversationProvider>
    );

    expect(
      screen.getByPlaceholderText('Optional: Set system prompt to define AI behavior')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
  });

  // Test sending message
  it('sends message and clears inputs', async () => {
    // Mock successful fetch response
    (global.fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          assistantResponse: 'Test assistant response',
        }),
    });

    render(
      <ConversationProvider>
        <PromptInput />
      </ConversationProvider>
    );

    const systemPromptInput = screen.getByPlaceholderText(
      'Optional: Set system prompt to define AI behavior'
    );
    const userPromptInput = screen.getByPlaceholderText('Enter your message');
    const sendButton = screen.getByText('Send');

    // Enter prompts
    fireEvent.change(systemPromptInput, { target: { value: 'Test system prompt' } });
    fireEvent.change(userPromptInput, { target: { value: 'Test user message' } });

    // Send message
    fireEvent.click(sendButton);

    // Wait for inputs to be cleared
    await waitFor(() => {
      expect(systemPromptInput).toHaveValue('');
      expect(userPromptInput).toHaveValue('');
    });
  });
});
