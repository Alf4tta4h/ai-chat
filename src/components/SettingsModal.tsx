import React from 'react';
import { X } from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { ApiConfig, Theme } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  customTheme: Theme;
  setCustomTheme: React.Dispatch<React.SetStateAction<Theme>>;
  applyCustomTheme: () => void;
  resetTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiConfig,
  setApiConfig,
  customTheme,
  setCustomTheme,
  applyCustomTheme,
  resetTheme
}) => {
  if (!isOpen) return null;

  const modelOptions = {
    ollama: ['llama3.2:1b-instruct-fp16', 'llama2', 'mistral', 'gemma:2b', 'gemma:7b', 'codellama', 'phi'],
    openai: ['gpt-4', 'gpt-4o'],
    claude: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    gemini: ['gemini-1.5-pro', 'gemini-1.5-pro-002', 'gemini-1.5-flash', 'gemini-1.5-flash-002', 'gemini-1.5-flash-8b']
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    alert('localStorage telah dibersihkan. Aplikasi akan dimuat ulang.');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--color-secondary)] text-[var(--color-text)] p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pengaturan</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text)] hover:text-[var(--color-hover)]"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <Tabs>
          <TabList>
            <Tab>API</Tab>
            <Tab>Tema</Tab>
            <Tab>Data</Tab>
          </TabList>

          <TabPanel>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Provider
                </label>
                <select
                  value={apiConfig.provider}
                  onChange={(e) => setApiConfig({ ...apiConfig, provider: e.target.value as ApiConfig['provider'] })}
                  className="w-full px-3 py-2 text-base border-gray-600 bg-[#343541] text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                >
                  <option value="ollama">Ollama</option>
                  <option value="openai">OpenAI</option>
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
              {(apiConfig.provider === 'openai' || apiConfig.provider === 'claude' || apiConfig.provider === 'gemini') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiConfig.apiKey}
                    onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-[#343541] text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={apiConfig.model}
                  onChange={(e) => setApiConfig({ ...apiConfig, model: e.target.value })}
                  className="w-full px-3 py-2 text-base border-gray-600 bg-[#343541] text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10a37f]"
                >
                  {modelOptions[apiConfig.provider].map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </form>
          </TabPanel>

          <TabPanel>
            <div>
              <label className="block text-sm font-medium mb-2">
                Tema Kustom
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(customTheme).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs mb-1 capitalize">{key}</label>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setCustomTheme(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full h-8 rounded-md cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={applyCustomTheme}
                className="flex-1 bg-[var(--color-secondary)] text-[var(--color-text)] py-2 px-4 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
              >
                Terapkan Tema
              </button>
              <button
                onClick={resetTheme}
                className="flex-1 bg-[var(--color-secondary)] text-[var(--color-text)] py-2 px-4 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
              >
                Reset Tema
              </button>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Manajemen Data</h3>
              <p className="text-sm">Berhati-hatilah saat membersihkan data. Tindakan ini tidak dapat dibatalkan.</p>
              <button
                onClick={clearLocalStorage}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Bersihkan localStorage
              </button>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
};
