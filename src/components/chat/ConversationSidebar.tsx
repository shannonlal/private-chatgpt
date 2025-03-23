import React from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/ui-kit/utils/cn';

const ConversationSidebar: React.FC = () => {
  const { conversationHistory } = useConversation();

  // Get a preview of the conversation for the history
  const getConversationPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  // Group messages by conversation
  const getConversationGroups = () => {
    const groups: { date: string; messages: typeof conversationHistory }[] = [];
    let currentDate = '';
    let currentGroup: typeof conversationHistory = [];

    conversationHistory.forEach(message => {
      const messageDate = new Date(message.timestamp).toLocaleDateString();

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Chat History</h2>
        {conversationHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No messages yet</p>
        ) : (
          <div className="space-y-6">
            {getConversationGroups().map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                <div className="text-xs font-medium text-gray-500">{group.date}</div>
                {group.messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={cn(
                      'text-sm p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors',
                      message.role === 'system' ? 'text-gray-500 italic' : 'text-gray-900'
                    )}
                  >
                    {getConversationPreview(message.content)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
