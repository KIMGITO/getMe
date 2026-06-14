// src/hooks/useTheme.ts
import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

export const useTheme = () => {
  const { theme, toggleTheme, setTheme } = useUIStore();
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  return { theme, toggleTheme, setTheme };
};