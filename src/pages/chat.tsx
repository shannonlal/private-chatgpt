import React from 'react';
import { NextPage } from 'next';
import { ConversationProvider } from '@/contexts/ConversationContext';
import PromptInput from '@/components/chat/PromptInput';
import MessageDisplay from '@/components/chat/MessageDisplay';
import Layout from '@/components/layout/Layout';

const ChatPage: NextPage = () => {
  return (
    <Layout>
      <ConversationProvider>
        <div className="grid grid-cols-[300px_1fr] h-screen max-w-6xl mx-auto">
          {/* Left Side: Prompt Input */}
          <div className="border-r border-gray-200 overflow-y-auto">
            <PromptInput />
          </div>

          {/* Right Side: Message Display */}
          <div className="flex flex-col">
            <MessageDisplay />
          </div>
        </div>
      </ConversationProvider>
    </Layout>
  );
};

export default ChatPage;
