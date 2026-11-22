import { create } from 'zustand';
import type { QaCourseDetail, QaCourseSummary } from '../types/qaCourse';
import {
  apiCreateQaCourse, apiDeleteQaCourse, apiGetQaCourseAdmin, apiListQaCoursesAdmin, apiUpdateQaCourse,
  ApiError, ConflictError, type QaCourseWritePayload, UnauthorizedError,
} from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

export type ActionResult = { ok: boolean; reason?: string };

// Mirrors useAdminQaLibraryStore: list of summaries + one full course loaded
// on demand for the editor.
interface AdminQaCourseState {
  courses: QaCourseSummary[];
  loading: boolean;
  loadError: string | null;
  load: () => Promise<void>;

  current: QaCourseDetail | null;
  currentLoading: boolean;
  currentError: string | null;
  loadOne: (slug: string) => Promise<void>;
  clearCurrent: () => void;

  create: (payload: QaCourseWritePayload) => Promise<ActionResult>;
  update: (currentSlug: string, payload: QaCourseWritePayload) => Promise<ActionResult>;
  remove: (slug: string) => Promise<ActionResult>;
}

const SESSION_ENDED = 'Sesi berakhir, silakan login ulang.';

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

function failure(err: unknown, fallback: string): ActionResult {
  if (err instanceof UnauthorizedError) return { ok: false, reason: SESSION_ENDED };
  if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
  return { ok: false, reason: err instanceof Error ? err.message : fallback };
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminQaCourseStore = create<AdminQaCourseState>((set, get) => ({
  courses: [],
  loading: true,
  loadError: null,

  load: () => dedupeInFlight(loadRef, async () => {
    const token = requireToken();
    if (!token) return;
    set({ loading: true, loadError: null });
    try {
      const { courses } = await apiListQaCoursesAdmin(token);
      set({ courses });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat course.' });
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
      set({ current: await apiGetQaCourseAdmin(slug, token) });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ currentError: err instanceof Error ? err.message : 'Gagal memuat course.' });
    } finally {
      set({ currentLoading: false });
    }
  },

  clearCurrent: () => set({ current: null, currentError: null }),

  create: async (payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: SESSION_ENDED };
    try {
      await apiCreateQaCourse(payload, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      return failure(err, 'Gagal membuat course.');
    }
  },

  update: async (currentSlug, payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: SESSION_ENDED };
    const current = get().current;
    if (!current) return { ok: false, reason: 'Data course belum dimuat.' };
    try {
      const saved = await apiUpdateQaCourse(currentSlug, payload, current.updatedAt, token);
      set({ current: { ...current, ...saved } });
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof ConflictError) {
        if (err.current) {
          await get().loadOne(currentSlug);
          return { ok: false, reason: 'Course ini berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
        }
        return { ok: false, reason: 'Slug sudah dipakai course lain.' };
      }
      return failure(err, 'Gagal menyimpan course.');
    }
  },

  remove: async (slug) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: SESSION_ENDED };
    try {
      await apiDeleteQaCourse(slug, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      return failure(err, 'Gagal menghapus course.');
    }
  },
}));
