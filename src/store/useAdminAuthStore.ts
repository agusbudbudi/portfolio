import { create } from 'zustand';
import { apiLogin, type AdminUser } from '../lib/adminApi';

const STORAGE_KEY = 'mentoring-admin-session';

interface StoredSession {
  token: string;
  expiresAt: number;
  user: AdminUser;
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: StoredSession = JSON.parse(raw);
    if (typeof session.token !== 'string' || typeof session.expiresAt !== 'number' || !session.user) return null;
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
  user: AdminUser | null;
  loggingIn: boolean;
  login: (credential: string) => Promise<void>;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => {
  const stored = readStoredSession();
  return {
    token: stored?.token ?? null,
    expiresAt: stored?.expiresAt ?? null,
    user: stored?.user ?? null,
    loggingIn: false,

    login: async (credential) => {
      set({ loggingIn: true });
      try {
        const session = await apiLogin(credential);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        set({ token: session.token, expiresAt: session.expiresAt, user: session.user });
      } finally {
        set({ loggingIn: false });
      }
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ token: null, expiresAt: null, user: null });
    },
  };
});
