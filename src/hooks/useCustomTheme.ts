import { useState, useEffect, useCallback } from 'react';
import { Theme, storage } from '../services/storage';

const defaultTheme: Theme = {
  secondary: '#0e0c0c',
  text: '#ffffff',
  background: '#121212',
  border: '#0b7a9c',
  inputBackground: '#121212',
  hover: '#1e1e1e',
  messageUser: '#1e1e1e',
  messageAssistant: '#2e2e2e',
  codeBackground: '#000000',
};

export function useCustomTheme() {
  const [customTheme, setCustomTheme] = useState<Theme>(() => {
    const savedTheme = storage.loadCustomTheme();
    return savedTheme || defaultTheme;
  });

  useEffect(() => {
    storage.saveCustomTheme(customTheme);
  }, [customTheme]);

  const applyCustomTheme = useCallback(() => {
    Object.entries(customTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, [customTheme]);

  const resetTheme = useCallback(() => {
    setCustomTheme(defaultTheme);
    Object.entries(defaultTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, []);

  useEffect(() => {
    applyCustomTheme();
  }, [applyCustomTheme]);

  return { customTheme, setCustomTheme, applyCustomTheme, resetTheme };
}
