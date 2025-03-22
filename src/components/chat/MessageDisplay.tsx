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

  // Enhanced message styling
  const getMessageClasses = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-blue-50 text-blue-800 self-start ml-4 rounded-lg';
      case 'system':
        return 'bg-gray-100 text-gray-800 italic text-center w-full mb-4 p-3';
      case 'assistant':
        return 'bg-green-50 text-green-800 self-start mr-4 rounded-lg';
      default:
        return '';
    }
  };

  // Grouped message rendering
  const renderMessageGroups = () => {
    type MessageGroup = {
      type: string;
      messages: typeof conversationHistory;
    };

    const groupedMessages = conversationHistory.reduce<MessageGroup[]>((groups, message, index) => {
      if (message.role === 'system' && index === 0) {
        // System message always at the top
        groups.unshift({ type: 'system', messages: [message] });
      } else if (message.role === 'user' || message.role === 'assistant') {
        const lastGroup = groups[groups.length - 1];
        if (lastGroup && lastGroup.type !== message.role) {
          groups.push({ type: message.role, messages: [message] });
        } else if (lastGroup) {
          lastGroup.messages.push(message);
        } else {
          groups.push({ type: message.role, messages: [message] });
        }
      }
      return groups;
    }, []);

    return groupedMessages.map((group, groupIndex) => (
      <div
        key={groupIndex}
        className={`flex flex-col ${group.type === 'user' ? 'items-start' : 'items-start'}`}
      >
        {group.messages.map(message => (
          <div
            key={message.id}
            className={cn('max-w-[80%] p-3 my-2 rounded-lg', getMessageClasses(message.role))}
          >
            <div>{message.content}</div>
            <small className="text-xs text-gray-500 self-end mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </small>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col flex-grow overflow-y-auto p-6 space-y-4">
      {conversationHistory.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start a conversation!
        </div>
      ) : (
        <>
          {renderMessageGroups()}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageDisplay;
