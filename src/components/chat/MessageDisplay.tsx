import React, { useRef, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/ui-kit/utils/cn';

const MessageDisplay: React.FC = () => {
  const { conversationHistory } = useConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  // Determine message style based on role
  const getMessageClasses = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-100 text-blue-800 self-end';
      case 'system':
        return 'bg-gray-100 text-gray-800 italic';
      case 'assistant':
        return 'bg-green-100 text-green-800 self-start';
      default:
        return '';
    }
  };

  // Render empty state if no messages
  if (conversationHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No messages yet. Start a conversation!
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
      {conversationHistory.map(message => (
        <div
          key={message.id}
          className={cn('max-w-[80%] p-3 rounded-lg', getMessageClasses(message.role))}
        >
          {message.content}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageDisplay;
