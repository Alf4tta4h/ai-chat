import { useState, useEffect } from 'react';
import { ApiConfig, storage } from '../services/storage';

export function useApiConfig() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    const savedConfig = storage.loadApiConfig();
    return savedConfig || {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4o',
    };
  });

  useEffect(() => {
    storage.saveApiConfig(apiConfig);
  }, [apiConfig]);

  return { apiConfig, setApiConfig };
}
