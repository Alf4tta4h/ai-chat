import React from 'react';
import { Message } from '../services/storage';
import { User, Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  renderMessage: (message: Message, index: number) => React.ReactNode;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, renderMessage }) => {
  console.log('Rendering MessageList with messages:', messages);
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`flex items-start space-x-2 max-w-[90%] rounded-lg p-3 ${
              message.role === 'user'
                ? 'bolt-message-user'
                : 'bolt-message-assistant'
            }`}
          >
            {message.role === 'user' ? (
              <User className="w-6 h-6 flex-shrink-0 text-white" />
            ) : (
              <Bot className="w-6 h-6 flex-shrink-0" />
            )}
            <div className="flex-grow overflow-x-auto">
              {renderMessage(message, index)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
