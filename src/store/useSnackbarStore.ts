import { create } from 'zustand';

export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info';

interface SnackbarMessage {
  id: string;
  message: string;
  variant: SnackbarVariant;
  duration?: number;
}

interface SnackbarState {
  toasts: SnackbarMessage[];
  show: (message: string, variant: SnackbarVariant, duration?: number) => void;
  dismiss: (id: string) => void;
}

export const useSnackbarStore = create<SnackbarState>((set, get) => ({
  toasts: [],
  show: (message, variant, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: SnackbarMessage = { id, message, variant, duration };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().dismiss(id);
      }, duration);
    }
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
