import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole } from '@/types/common.types';

interface User {
  id: string;
  email?: string;
  name: string;
  role: UserRole;
  phone: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuthSession: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Fire this on successful login OR instant registration
      setAuthSession: (user, token) => 
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        }),

      // Flushes both state memory and browser storage instantly
      logout: () => 
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'getme-auth-storage', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);