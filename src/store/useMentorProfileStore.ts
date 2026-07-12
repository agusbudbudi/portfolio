import { create } from 'zustand';
import type { MentorConfig } from '../types/mentoring';
import {
  apiApplyMentor, apiGetMyMentor, apiUpdateMentor,
  ApiError, ConflictError, type MentorWritePayload, UnauthorizedError,
} from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';

export type ActionResult = { ok: boolean; reason?: string };

// Self-serve counterpart to useAdminMentorStore (admin roster management) —
// this store is "my own mentor application/profile," scoped to whoever is
// currently logged in. Same auth session as admin (Google login), just a
// non-admin role calling owner-gated endpoints instead of admin ones.
interface MentorProfileState {
  mentor: MentorConfig | null;
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  apply: (payload: MentorWritePayload) => Promise<ActionResult>;
  update: (payload: MentorWritePayload) => Promise<ActionResult>;
}

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

export const useMentorProfileStore = create<MentorProfileState>((set, get) => ({
  mentor: null,
  loading: true,
  loadError: null,

  load: async () => {
    const token = requireToken();
    if (!token) return;
    set({ loading: true, loadError: null });
    try {
      const mentor = await apiGetMyMentor(token);
      set({ mentor });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat profil mentor.' });
    } finally {
      set({ loading: false });
    }
  },

  apply: async (payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      const mentor = await apiApplyMentor(payload, token);
      set({ mentor });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal mengirim aplikasi mentor.' };
    }
  },

  update: async (payload) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    const current = get().mentor;
    if (!current?.updatedAt) return { ok: false, reason: 'Data mentor belum dimuat.' };
    try {
      const mentor = await apiUpdateMentor(current.id, payload, current.updatedAt, token);
      set({ mentor });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ConflictError) {
        set({ mentor: err.current as MentorConfig });
        return { ok: false, reason: 'Profil ini berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
      }
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan profil mentor.' };
    }
  },
}));
