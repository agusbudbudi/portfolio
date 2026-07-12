import { create } from 'zustand';
import type { MentorConfig } from '../types/mentoring';
import {
  apiCreateMentor, apiDeleteMentor, apiListMentors, apiUpdateMentor,
  ApiError, ConflictError, type MentorWritePayload, UnauthorizedError,
} from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';

export type ActionResult = { ok: boolean; reason?: string };

// Mentors are a real per-record resource (see api/_lib/mentorStore.ts), not
// a whole-array config document — but unlike portfolios, mentor records are
// small enough that the full list (not just summaries) is kept in memory,
// same as the admin UI has always done. No current/loadOne split needed.
interface AdminMentorState {
  mentors: MentorConfig[];
  loading: boolean;
  loadError: string | null;
  load: () => Promise<void>;

  create: (payload: MentorWritePayload) => Promise<ActionResult>;
  update: (id: string, payload: MentorWritePayload) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
}

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

export const useAdminMentorStore = create<AdminMentorState>((set, get) => ({
  mentors: [],
  loading: true,
  loadError: null,

  load: async () => {
    set({ loading: true, loadError: null });
    try {
      const token = useAdminAuthStore.getState().token ?? undefined;
      const { mentors } = await apiListMentors(token);
      set({ mentors });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat mentors.' });
    } finally {
      set({ loading: false });
    }
  },

  create: async (payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      await apiCreateMentor(payload, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal membuat mentor.' };
    }
  },

  update: async (id, payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    const expectedUpdatedAt = get().mentors.find((m) => m.id === id)?.updatedAt;
    if (!expectedUpdatedAt) return { ok: false, reason: 'Data mentor belum dimuat.' };
    try {
      await apiUpdateMentor(id, payload, expectedUpdatedAt, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ConflictError) {
        await get().load();
        return { ok: false, reason: 'Mentor ini berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
      }
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan mentor.' };
    }
  },

  remove: async (id) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      await apiDeleteMentor(id, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError) return { ok: false, reason: err.message };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menghapus mentor.' };
    }
  },
}));
