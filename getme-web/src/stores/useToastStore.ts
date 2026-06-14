import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastMessage {
  id: string;
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  position: ToastPosition; // Every individual toast explicitly tracks its own location
}

interface ToastState {
  toasts: ToastMessage[];
  toast: (props: { 
    message: string; 
    description?: string; 
    variant?: ToastVariant; 
    duration?: number;
    position?: ToastPosition; // Optional here: falls back to system standard if omitted
  }) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  dismiss: (id) => 
    set((state) => ({ 
      toasts: state.toasts.filter((t) => t.id !== id) 
    })),

  toast: ({ message, description, variant = 'info', duration = 4000, position = 'bottom-right' }) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    set((state) => ({
      toasts: [...state.toasts, { id, message, description, variant, duration, position }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().dismiss(id);
      }, duration);
    }
  },
}));