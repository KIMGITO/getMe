import { create } from 'zustand';
import { RoutePath } from '@/constants/routes';

export interface ContextualNavItem {
  path: RoutePath | string;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface NavState {
  customNavItems: ContextualNavItem[] | null;
  setCustomNav: (items: ContextualNavItem[] | null) => void;
  clearCustomNav: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  customNavItems: null,
  setCustomNav: (customNavItems) => set({ customNavItems }),
  clearCustomNav: () => set({ customNavItems: null }),
}));