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
        <div className="flex flex-col h-screen max-h-screen">
          <div className="flex-grow overflow-hidden">
            <MessageDisplay />
          </div>
          <div className="p-4 border-t border-gray-200">
            <PromptInput />
          </div>
        </div>
      </ConversationProvider>
    </Layout>
  );
};

export default ChatPage;
