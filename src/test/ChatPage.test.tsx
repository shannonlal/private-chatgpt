import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChatPage from '../pages/chat';

// Mock the child components to isolate the page component
vi.mock('@/components/chat/MessageDisplay', () => ({
  default: () => <div data-testid="message-display">Mocked Message Display</div>,
}));

vi.mock('@/components/chat/PromptInput', () => ({
  default: () => <div data-testid="prompt-input">Mocked Prompt Input</div>,
}));

describe('ChatPage', () => {
  it('renders the page with ConversationProvider', () => {
    render(<ChatPage />);

    // Check if mocked components are rendered
    const messageDisplay = screen.getByTestId('message-display');
    const promptInput = screen.getByTestId('prompt-input');

    expect(messageDisplay).toBeInTheDocument();
    expect(promptInput).toBeInTheDocument();
  });

});
