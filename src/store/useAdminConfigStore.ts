import { create } from 'zustand';
import type { BookingRules, MentorConfig, MentoringConfig, TopicConfig } from '../types/mentoring';
import { apiGetConfig, apiPutConfig, ConflictError, UnauthorizedError } from '../lib/adminApi';
import { validateMentoringConfig } from '../lib/configValidation';
import { invalidateConfigCache } from '../hooks/useConfig';
import { useAdminAuthStore } from './useAdminAuthStore';

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'conflict' | 'error';

interface AdminConfigState {
  serverConfig: MentoringConfig | null;
  draft: MentoringConfig | null;
  dirty: boolean;
  loading: boolean;
  loadError: string | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  validationErrors: string[];

  load: () => Promise<void>;
  upsertTopic: (topic: TopicConfig) => void;
  deleteTopic: (topicId: string) => { ok: boolean; reason?: string };
  upsertMentor: (mentor: MentorConfig) => void;
  deleteMentor: (mentorId: string) => { ok: boolean; reason?: string };
  toggleAvailableDay: (day: string) => void;
  setBookingRules: (rules: BookingRules) => void;
  setMetadata: (metadata: MentoringConfig['metadata']) => void;
  discard: () => void;
  save: () => Promise<void>;
}

function mutateDraft(
  set: (partial: Partial<AdminConfigState>) => void,
  get: () => AdminConfigState,
  mutate: (draft: MentoringConfig) => void
) {
  const draft = get().draft;
  if (!draft) return;
  const next = deepCopy(draft);
  mutate(next);
  set({ draft: next, dirty: true, saveStatus: 'idle', saveError: null, validationErrors: [] });
}

export const useAdminConfigStore = create<AdminConfigState>((set, get) => ({
  serverConfig: null,
  draft: null,
  dirty: false,
  loading: false,
  loadError: null,
  saveStatus: 'idle',
  saveError: null,
  validationErrors: [],

  load: async () => {
    set({ loading: true, loadError: null });
    try {
      const config = await apiGetConfig();
      set({
        serverConfig: config,
        draft: deepCopy(config),
        dirty: false,
        saveStatus: 'idle',
        saveError: null,
        validationErrors: [],
      });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat config.' });
    } finally {
      set({ loading: false });
    }
  },

  upsertTopic: (topic) =>
    mutateDraft(set, get, (draft) => {
      const idx = draft.topics.findIndex((t) => t.id === topic.id);
      if (idx >= 0) draft.topics[idx] = topic;
      else draft.topics.push(topic);
    }),

  deleteTopic: (topicId) => {
    const draft = get().draft;
    if (!draft) return { ok: false, reason: 'Config belum dimuat.' };
    const usedBy = draft.mentors.filter((m) => m.expertise.includes(topicId));
    if (usedBy.length > 0) {
      return {
        ok: false,
        reason: `Topic dipakai sebagai expertise oleh: ${usedBy.map((m) => m.name).join(', ')}. Hapus dari mentor dulu.`,
      };
    }
    mutateDraft(set, get, (d) => {
      d.topics = d.topics.filter((t) => t.id !== topicId);
    });
    return { ok: true };
  },

  upsertMentor: (mentor) =>
    mutateDraft(set, get, (draft) => {
      const idx = draft.mentors.findIndex((m) => m.id === mentor.id);
      if (idx >= 0) draft.mentors[idx] = mentor;
      else draft.mentors.push(mentor);
    }),

  deleteMentor: (mentorId) => {
    const draft = get().draft;
    if (!draft) return { ok: false, reason: 'Config belum dimuat.' };
    if (draft.mentors.length <= 1) {
      return { ok: false, reason: 'Minimal harus ada satu mentor.' };
    }
    mutateDraft(set, get, (d) => {
      d.mentors = d.mentors.filter((m) => m.id !== mentorId);
    });
    return { ok: true };
  },

  toggleAvailableDay: (day) =>
    mutateDraft(set, get, (draft) => {
      draft.availableDays = draft.availableDays.includes(day)
        ? draft.availableDays.filter((d) => d !== day)
        : [...draft.availableDays, day];
    }),

  setBookingRules: (rules) =>
    mutateDraft(set, get, (draft) => {
      draft.bookingRules = rules;
    }),

  setMetadata: (metadata) =>
    mutateDraft(set, get, (draft) => {
      draft.metadata = { ...metadata, updatedAt: draft.metadata.updatedAt };
    }),

  discard: () => {
    const server = get().serverConfig;
    if (!server) return;
    set({ draft: deepCopy(server), dirty: false, saveStatus: 'idle', saveError: null, validationErrors: [] });
  },

  save: async () => {
    const { draft, serverConfig } = get();
    if (!draft) return;

    const result = validateMentoringConfig(draft);
    if (!result.ok) {
      set({ saveStatus: 'error', validationErrors: result.errors, saveError: 'Config tidak valid. Perbaiki dulu.' });
      return;
    }

    const token = useAdminAuthStore.getState().token;
    if (!token) {
      useAdminAuthStore.getState().logout();
      return;
    }

    set({ saveStatus: 'saving', saveError: null, validationErrors: [] });
    try {
      const saved = await apiPutConfig(result.config, serverConfig?.metadata.updatedAt, token);
      invalidateConfigCache();
      set({ serverConfig: saved, draft: deepCopy(saved), dirty: false, saveStatus: 'saved' });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        useAdminAuthStore.getState().logout();
        set({ saveStatus: 'idle' });
        return;
      }
      if (err instanceof ConflictError) {
        set({
          saveStatus: 'conflict',
          saveError: 'Config berubah di tempat lain. Muat ulang untuk mengambil versi terbaru (perubahanmu akan hilang).',
        });
        return;
      }
      const errors = err instanceof Error && 'errors' in err ? (err as { errors?: string[] }).errors : undefined;
      set({
        saveStatus: 'error',
        saveError: err instanceof Error ? err.message : 'Gagal menyimpan config.',
        validationErrors: errors ?? [],
      });
    }
  },
}));
