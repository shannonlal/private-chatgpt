import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConversationProvider } from '@/contexts/ConversationContext';
import MessageDisplay from '@/components/chat/MessageDisplay';

describe('MessageDisplay Component', () => {
  it('renders empty state when no messages', () => {
    render(
      <ConversationProvider>
        <MessageDisplay />
      </ConversationProvider>
    );

    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument();
  });

  // it('renders messages with correct styling', () => {
  //   const MockMessageDisplayWithContext: React.FC = () => {
  //     const { addMessageToHistory } = useConversation();

  //     React.useEffect(() => {
  //       addMessageToHistory({
  //         id: '1',
  //         role: 'user',
  //         content: 'User message',
  //         timestamp: new Date(),
  //       });
  //       addMessageToHistory({
  //         id: '2',
  //         role: 'assistant',
  //         content: 'Assistant response',
  //         timestamp: new Date(),
  //       });
  //     }, [addMessageToHistory]);

  //     return <MessageDisplay />;
  //   };

  //   render(
  //     <ConversationProvider>
  //       <MockMessageDisplayWithContext />
  //     </ConversationProvider>
  //   );

  //   // Check that messages are rendered
  //   expect(screen.getByText('User message')).toBeInTheDocument();
  //   expect(screen.getByText('Assistant response')).toBeInTheDocument();
  // });

  // it('applies correct styling based on message role', () => {
  //   const MockMessageDisplayWithContext: React.FC = () => {
  //     const { addMessageToHistory } = useConversation();

  //     React.useEffect(() => {
  //       addMessageToHistory({
  //         id: '1',
  //         role: 'user',
  //         content: 'User message',
  //         timestamp: new Date(),
  //       });
  //       addMessageToHistory({
  //         id: '2',
  //         role: 'system',
  //         content: 'System message',
  //         timestamp: new Date(),
  //       });
  //       addMessageToHistory({
  //         id: '3',
  //         role: 'assistant',
  //         content: 'Assistant response',
  //         timestamp: new Date(),
  //       });
  //     }, [addMessageToHistory]);

  //     return <MessageDisplay />;
  //   };

  //   render(
  //     <ConversationProvider>
  //       <MockMessageDisplayWithContext />
  //     </ConversationProvider>
  //   );

  //   const userMessage = screen.getByText('User message');
  //   const systemMessage = screen.getByText('System message');
  //   const assistantMessage = screen.getByText('Assistant response');

  //   // Check for role-specific classes
  //   expect(userMessage.className).toContain('bg-blue-100');
  //   expect(systemMessage.className).toContain('bg-gray-100');
  //   expect(assistantMessage.className).toContain('bg-green-100');
  // });
});
