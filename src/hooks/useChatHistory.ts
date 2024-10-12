import { useState, useEffect, useCallback } from 'react';
import { ChatHistory, Message, storage } from '../services/storage';

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const loadedChatHistory = storage.loadChatHistory();
    console.log('Loaded chat history:', loadedChatHistory);
    setChatHistory(loadedChatHistory);
    if (loadedChatHistory.length > 0) {
      setCurrentChatId(loadedChatHistory[0].id);
      setMessages(loadedChatHistory[0].messages);
    }
  }, []);

  useEffect(() => {
    console.log('Saving chat history:', chatHistory);
    storage.saveChatHistory(chatHistory);
  }, [chatHistory]);

  const startNewChat = useCallback(() => {
    const newChatId = Date.now().toString();
    const newChat: ChatHistory = { id: newChatId, title: 'New Chat', messages: [] };
    setChatHistory(prevHistory => [...prevHistory, newChat]);
    setCurrentChatId(newChatId);
    setMessages([]);
  }, []);

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChatHistory(prevHistory =>
      prevHistory.map(chat =>
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  }, []);

  const switchChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId);
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
    }
  }, [chatHistory]);

  const deleteChat = useCallback((chatId: string) => {
    setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
        setMessages(remainingChats[0].messages);
      } else {
        setCurrentChatId(null);
        setMessages([]);
      }
    }
  }, [currentChatId, chatHistory]);

  const updateMessages = useCallback((newMessagesOrUpdater: Message[] | ((prevMessages: Message[]) => Message[])) => {
    setMessages(prevMessages => {
      const updatedMessages = typeof newMessagesOrUpdater === 'function'
        ? newMessagesOrUpdater(prevMessages)
        : newMessagesOrUpdater;
      
      console.log('Updating messages:', updatedMessages);

      if (currentChatId) {
        setChatHistory(prevHistory =>
          prevHistory.map(chat =>
            chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat
          )
        );
      }
      
      return updatedMessages;
    });
  }, [currentChatId]);

  return {
    chatHistory,
    currentChatId,
    messages,
    startNewChat,
    updateChatTitle,
    switchChat,
    deleteChat,
    updateMessages,
  };
}
