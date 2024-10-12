import React from 'react';
import { Message } from '../services/storage';
import { MessageList } from './MessageList';

interface ChatAreaProps {
  messages: Message[];
  renderMessage: (message: Message, index: number) => React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, renderMessage, messagesEndRef }) => {
  console.log('Rendering ChatArea with messages:', messages);
  return (
    <main className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto">
        <MessageList messages={messages} renderMessage={renderMessage} />
        <div ref={messagesEndRef} />
      </div>
    </main>
  );
};
