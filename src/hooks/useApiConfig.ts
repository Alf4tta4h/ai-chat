import { useState, useEffect } from 'react';
import { ApiConfig, storage } from '../services/storage';

export function useApiConfig() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const savedConfig = storage.loadApiConfig();
    return savedConfig || {
      provider: 'ollama',
      apiKey: '',
      model: 'llama3.2:1b-instruct-fp16',
    };
  });

  useEffect(() => {
    storage.saveApiConfig(apiConfig);
  }, [apiConfig]);

  return { apiConfig, setApiConfig };
}
