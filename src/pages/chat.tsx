import React from 'react';
import { ConversationProvider } from '@/contexts/ConversationContext';
import PromptInput from '@/components/chat/PromptInput';
import MessageDisplay from '@/components/chat/MessageDisplay';

const ChatPage: React.FC = () => {
  return (
    <ConversationProvider>
      <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 space-y-4 bg-gray-50 transition-colors duration-300 ease-in-out">
        {/* Message Display Area */}
        <div className="flex-grow overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
          <MessageDisplay />
        </div>

        {/* Prompt Input Area */}
        <div className="sticky bottom-0 w-full z-10 animate-fade-in-up">
          <PromptInput />
        </div>
      </div>
    </ConversationProvider>
  );
};

export default ChatPage;
