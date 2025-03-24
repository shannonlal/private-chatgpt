import React from 'react';
import { NextPage } from 'next';
import { ConversationProvider } from '@/contexts/ConversationContext';
import PromptInput from '@/components/chat/PromptInput';
import MessageDisplay from '@/components/chat/MessageDisplay';
import ConversationSidebar from '@/components/chat/ConversationSidebar';
import Layout from '@/components/layout/Layout';

const ChatPage: NextPage = () => {
  return (
    <Layout>
      <ConversationProvider>
        <div className="grid grid-cols-[280px_1fr] h-screen">
          {/* Left Side: Conversation Sidebar */}
          <div className="border-r border-gray-200">
            <ConversationSidebar />
          </div>

          {/* Right Side: Message Display and Input */}
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <MessageDisplay />
            </div>
            <div className="border-t border-gray-200">
              <PromptInput />
            </div>
          </div>
        </div>
      </ConversationProvider>
    </Layout>
  );
};

export default ChatPage;
