export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export interface ApiConfig {
  provider: 'openai' | 'ollama' | 'claude' | 'gemini';
  apiKey: string;
  model: string;
}

export interface Theme {
  secondary: string;
  text: string;
  background: string;
  border: string;
  inputBackground: string;
  hover: string;
  messageUser: string;
  messageAssistant: string;
  codeBackground: string;
}

const CHAT_HISTORY_KEY = 'chatHistory';
const API_CONFIG_KEY = 'apiConfig';
const CUSTOM_THEME_KEY = 'customTheme';

export const storage = {
  saveChatHistory: (history: ChatHistory[]) => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  },

  loadChatHistory: (): ChatHistory[] => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  },

  saveApiConfig: (config: ApiConfig) => {
    localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
  },

  loadApiConfig: (): ApiConfig | null => {
    try {
      const storedConfig = localStorage.getItem(API_CONFIG_KEY);
      return storedConfig ? JSON.parse(storedConfig) : null;
    } catch (error) {
      console.error('Error loading API config:', error);
      return null;
    }
  },

  saveCustomTheme: (theme: Theme) => {
    localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(theme));
  },

  loadCustomTheme: (): Theme | null => {
    try {
      const storedTheme = localStorage.getItem(CUSTOM_THEME_KEY);
      return storedTheme ? JSON.parse(storedTheme) : null;
    } catch (error) {
      console.error('Error loading custom theme:', error);
      return null;
    }
  }
};
