import { create } from 'zustand';
import type { PortfolioRecord, PortfolioSummary } from '../types/portfolio';
import {
  apiCreatePortfolio, apiDeletePortfolio, apiGetPortfolio, apiListPortfolios, apiUpdatePortfolio,
  ApiError, ConflictError, type PortfolioWritePayload, UnauthorizedError,
} from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

export type ActionResult = { ok: boolean; reason?: string };

// Portfolios are a real per-record resource, not a whole-array config
// document like topics/mentors — the list only ever holds lightweight
// summaries (no nested experience/projects/endorsements), and editing a
// single portfolio fetches its full record on demand via loadOne(). This is
// a deliberate deviation from useAdminConfigStore's load-everything-at-once
// pattern: portfolios can grow to hundreds of rows, so no view needs (or
// should hold) every record's full data blob in memory at once.
interface AdminPortfolioState {
  portfolios: PortfolioSummary[];
  loading: boolean;
  loadError: string | null;
  load: () => Promise<void>;

  current: PortfolioRecord | null;
  currentLoading: boolean;
  currentError: string | null;
  loadOne: (slug: string) => Promise<void>;
  clearCurrent: () => void;

  create: (payload: PortfolioWritePayload) => Promise<ActionResult>;
  update: (currentSlug: string, payload: PortfolioWritePayload) => Promise<ActionResult>;
  remove: (slug: string) => Promise<ActionResult>;
}

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminPortfolioStore = create<AdminPortfolioState>((set, get) => ({
  portfolios: [],
  loading: true,
  loadError: null,

  load: () => dedupeInFlight(loadRef, async () => {
    const token = requireToken();
    if (!token) return;
    set({ loading: true, loadError: null });
    try {
      const { portfolios } = await apiListPortfolios(token);
      set({ portfolios });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat portfolios.' });
    } finally {
      set({ loading: false });
    }
  }),

  current: null,
  currentLoading: false,
  currentError: null,

  loadOne: async (slug) => {
    const token = requireToken();
    if (!token) return;
    set({ currentLoading: true, currentError: null, current: null });
    try {
      const record = await apiGetPortfolio(slug, token);
      set({ current: record });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ currentError: err instanceof Error ? err.message : 'Gagal memuat portfolio.' });
    } finally {
      set({ currentLoading: false });
    }
  },

  clearCurrent: () => set({ current: null, currentError: null }),

  create: async (payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      await apiCreatePortfolio(payload, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal membuat portfolio.' };
    }
  },

  update: async (currentSlug, payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    const expectedUpdatedAt = get().current?.updatedAt;
    if (!expectedUpdatedAt) return { ok: false, reason: 'Data portfolio belum dimuat.' };
    try {
      const saved = await apiUpdatePortfolio(currentSlug, payload, expectedUpdatedAt, token);
      set({ current: saved });
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ConflictError) {
        const current = err.current as PortfolioRecord;
        set({ current });
        return { ok: false, reason: 'Portfolio ini berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
      }
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan portfolio.' };
    }
  },

  remove: async (slug) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      await apiDeletePortfolio(slug, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menghapus portfolio.' };
    }
  },
}));
