import { create } from 'zustand';
import { apiLogin } from '../lib/adminApi';

const STORAGE_KEY = 'mentoring-admin-session';

interface StoredSession {
  token: string;
  expiresAt: number;
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: StoredSession = JSON.parse(raw);
    if (typeof session.token !== 'string' || typeof session.expiresAt !== 'number') return null;
    if (Date.now() >= session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

interface AdminAuthState {
  token: string | null;
  expiresAt: number | null;
  loggingIn: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => {
  const stored = readStoredSession();
  return {
    token: stored?.token ?? null,
    expiresAt: stored?.expiresAt ?? null,
    loggingIn: false,

    login: async (password) => {
      set({ loggingIn: true });
      try {
        const session = await apiLogin(password);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        set({ token: session.token, expiresAt: session.expiresAt });
      } finally {
        set({ loggingIn: false });
      }
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ token: null, expiresAt: null });
    },
  };
});
