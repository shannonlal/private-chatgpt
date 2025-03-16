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

  it('has correct layout classes', () => {
    const { container } = render(<ChatPage />);
    const pageContainer = container.firstChild;

    expect(pageContainer).toHaveClass('flex flex-col h-screen max-w-4xl mx-auto p-4 space-y-4');
  });

  // it('has correct child container classes', () => {
  //   const { container } = render(<ChatPage />);
  //   const messageDisplayContainer = container.querySelector('div > div:first-child');
  //   const promptInputContainer = container.querySelector('div > div:last-child');

  //   expect(messageDisplayContainer).toHaveClass('flex-grow overflow-hidden');
  //   expect(promptInputContainer).toHaveClass('sticky bottom-0 w-full');
  // });
});
