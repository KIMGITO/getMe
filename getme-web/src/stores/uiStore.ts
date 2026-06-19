// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '@/types/common.types';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalContent: React.ReactNode | null;
 
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;

}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      modalOpen: false,
      modalContent: null,
      
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { theme: newTheme };
        });
      },
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      openModal: (content) => set({ modalOpen: true, modalContent: content }),
      
      closeModal: () => set({ modalOpen: false, modalContent: null }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);