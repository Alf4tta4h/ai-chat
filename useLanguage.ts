import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export function useLanguage() {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = storage.loadLanguage();
    return savedLanguage || 'EN'; // Default to English
  });

  useEffect(() => {
    storage.saveLanguage(language);
  }, [language]);

  return { language, setLanguage };
}
