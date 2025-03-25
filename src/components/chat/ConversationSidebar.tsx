import React, { useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/ui-kit/utils/cn';

const ConversationSidebar: React.FC = () => {
  const { conversations, fetchConversationsList, selectConversation, currentConversationId } =
    useConversation();

  // Load conversations when component mounts
  useEffect(() => {
    fetchConversationsList();
  }, [fetchConversationsList]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Conversations</h2>
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-500">No conversations yet</p>
        ) : (
          <div className="space-y-2">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={cn(
                  'text-sm p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors',
                  currentConversationId === conversation.id ? 'bg-blue-100' : ''
                )}
                onClick={() => selectConversation(conversation.id)}
              >
                {conversation.conversationName || 'Unnamed Conversation'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
