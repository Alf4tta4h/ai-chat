import React from 'react';
import { X, Settings, Save } from 'lucide-react';
import { ChatHistory } from '../services/storage';

interface SidebarProps {
  chatHistory: ChatHistory[];
  currentChatId: string | null;
  onStartNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onOpenSettings: () => void;
  onExportChat: () => void;
  newChatText: string;
  settingsText: string;
  exportChatText: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chatHistory,
  currentChatId,
  onStartNewChat,
  onSwitchChat,
  onDeleteChat,
  onOpenSettings,
  onExportChat,
  newChatText,
  settingsText,
  exportChatText
}) => {
  return (
    <div className="w-64 bolt-sidebar p-4 flex flex-col">
      <button
        onClick={onStartNewChat}
        className="bolt-button mb-4"
      >
        {newChatText}
      </button>
      <div className="flex-grow overflow-y-auto">
        {chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={`flex justify-between items-center cursor-pointer p-2 rounded mb-2 ${
              currentChatId === chat.id ? 'bg-[var(--color-hover)]' : 'hover:bg-[var(--color-hover)]'
            }`}
          >
            <div onClick={() => onSwitchChat(chat.id)} className="truncate flex-grow">
              {chat.title}
            </div>
            <button
              onClick={() => onDeleteChat(chat.id)}
              className="text-gray-500 hover:text-red-500 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-auto space-y-2">
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-2 hover:bg-[var(--color-hover)] rounded-md p-2 w-full"
        >
          <Settings className="w-5 h-5" />
          <span>{settingsText}</span>
        </button>
        <button
          onClick={onExportChat}
          className="flex items-center space-x-2 hover:bg-[var(--color-hover)] rounded-md p-2 w-full"
        >
          <Save className="w-5 h-5" />
          <span>{exportChatText}</span>
        </button>
      </div>
    </div>
  );
};
