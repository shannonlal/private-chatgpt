import React, { useEffect, useState } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/ui-kit/utils/cn';
import { IconDelete } from '@/ui-kit/icons/IconDelete';

const ConversationSidebar: React.FC = () => {
  const { conversations, fetchConversationsList, selectConversation, currentConversationId,deleteConversation } =
    useConversation();

  // Load conversations when component mounts
  useEffect(() => {
    fetchConversationsList();
  }, [fetchConversationsList]);

  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  const handleDeleteClick = async (conversationId: string) => {
    if (confirmingDelete === conversationId) {
      try {
        await deleteConversation(conversationId);
        setConfirmingDelete(null);
      } catch (error) {
        console.error('Failed to delete conversation', error);
      }
    } else {
      setConfirmingDelete(conversationId);
    }
  };

  const cancelDelete = () => {
    setConfirmingDelete(null);
  };

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
                <div onClick={() => selectConversation(conversation.id)} className="flex-grow pr-2">
                  <div className="text-sm text-gray-900">
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </div>
                  {conversation.lastMessagePreview && (
                    <div className="text-xs text-gray-500 truncate">
                      {conversation.lastMessagePreview}
                    </div>
                  )}
                </div>
                <div className="relative">
                  {confirmingDelete === conversation.id ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleDeleteClick(conversation.id)}
                        className="text-red-500 text-xs hover:bg-red-100 px-2 py-1 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="text-gray-500 text-xs hover:bg-gray-100 px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(conversation.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <IconDelete className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
