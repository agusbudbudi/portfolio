import { create } from 'zustand';
import type { PortfolioRecord } from '../types/portfolio';
import {
  apiCreateMyPortfolio, apiGetMyPortfolio, apiUpdatePortfolio,
  ApiError, ConflictError, type PortfolioWritePayload, UnauthorizedError,
} from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';

export type ActionResult = { ok: boolean; reason?: string };

// Self-serve counterpart to useAdminPortfolioStore (admin roster management)
// — this store is "my own portfolio," scoped to whoever is currently logged
// in. Same auth session as admin (Google login), just an owner-gated
// endpoint (api/portfolios/mine.ts) for create/read and the owner-permitted
// path on api/portfolios/[slug].ts for update. Mirrors useMentorProfileStore.
interface PortfolioProfileState {
  portfolio: PortfolioRecord | null;
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  create: (payload: PortfolioWritePayload) => Promise<ActionResult>;
  update: (payload: PortfolioWritePayload) => Promise<ActionResult>;
}

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

export const usePortfolioProfileStore = create<PortfolioProfileState>((set, get) => ({
  portfolio: null,
  loading: true,
  loadError: null,

  load: async () => {
    const token = requireToken();
    if (!token) return;
    set({ loading: true, loadError: null });
    try {
      const portfolio = await apiGetMyPortfolio(token);
      set({ portfolio });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat portfolio.' });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      const portfolio = await apiCreateMyPortfolio(payload, token);
      set({ portfolio });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal membuat portfolio.' };
    }
  },

  update: async (payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    const current = get().portfolio;
    if (!current) return { ok: false, reason: 'Data portfolio belum dimuat.' };
    try {
      const portfolio = await apiUpdatePortfolio(current.slug, payload, current.updatedAt, token);
      set({ portfolio });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ConflictError) {
        set({ portfolio: err.current as PortfolioRecord });
        return { ok: false, reason: 'Portfolio ini berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
      }
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan portfolio.' };
    }
  },
}));
