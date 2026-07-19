import { create } from 'zustand';
import type { QaLibraryArticle, QaLibraryArticleSummary } from '../types/qaLibrary';
import {
  apiCreateQaLibraryArticle, apiDeleteQaLibraryArticle, apiGetQaLibraryArticle, apiListQaLibraryArticlesAdmin,
  apiUpdateQaLibraryArticle, ApiError, ConflictError, type QaLibraryArticleWritePayload, UnauthorizedError,
} from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

export type ActionResult = { ok: boolean; reason?: string };

// Real per-row resource, not a whole-array config document — mirrors
// useAdminPortfolioStore.ts: the list only holds lightweight summaries, and
// editing a single article fetches its full record (with body/doc fields)
// on demand via loadOne().
interface AdminQaLibraryState {
  articles: QaLibraryArticleSummary[];
  loading: boolean;
  loadError: string | null;
  load: () => Promise<void>;

  current: QaLibraryArticle | null;
  currentLoading: boolean;
  currentError: string | null;
  loadOne: (slug: string) => Promise<void>;
  clearCurrent: () => void;

  create: (payload: QaLibraryArticleWritePayload) => Promise<ActionResult>;
  update: (currentSlug: string, payload: QaLibraryArticleWritePayload) => Promise<ActionResult>;
  remove: (slug: string) => Promise<ActionResult>;
}

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminQaLibraryStore = create<AdminQaLibraryState>((set, get) => ({
  articles: [],
  loading: true,
  loadError: null,

  load: () => dedupeInFlight(loadRef, async () => {
    const token = requireToken();
    if (!token) return;
    set({ loading: true, loadError: null });
    try {
      const { articles } = await apiListQaLibraryArticlesAdmin(token);
      set({ articles });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat artikel.' });
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
      const article = await apiGetQaLibraryArticle(slug, token);
      set({ current: article });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ currentError: err instanceof Error ? err.message : 'Gagal memuat artikel.' });
    } finally {
      set({ currentLoading: false });
    }
  },

  clearCurrent: () => set({ current: null, currentError: null }),

  create: async (payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      await apiCreateQaLibraryArticle(payload, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal membuat artikel.' };
    }
  },

  update: async (currentSlug, payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    const expectedUpdatedAt = get().current?.updatedAt;
    if (!expectedUpdatedAt) return { ok: false, reason: 'Data artikel belum dimuat.' };
    try {
      const saved = await apiUpdateQaLibraryArticle(currentSlug, payload, expectedUpdatedAt, token);
      set({ current: saved });
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ConflictError) {
        const current = err.current as QaLibraryArticle;
        set({ current });
        return { ok: false, reason: 'Artikel ini berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
      }
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan artikel.' };
    }
  },

  remove: async (slug) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      await apiDeleteQaLibraryArticle(slug, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menghapus artikel.' };
    }
  },
}));
