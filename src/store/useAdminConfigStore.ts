import { create } from 'zustand';
import type { BookingRules, MentoringConfig, MentorConfig, TopicConfig } from '../types/mentoring';
import {
  apiGetBookingRules, apiGetMentors, apiGetTopics,
  apiPutBookingRules, apiPutMentors, apiPutTopics,
  ConflictError, UnauthorizedError,
} from '../lib/adminApi';
import { validateBookingRules, validateMentors, validateTopics } from '../lib/configValidation';
import { invalidateConfigCache } from '../hooks/useConfig';
import { useAdminAuthStore } from './useAdminAuthStore';

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'conflict' | 'error';

export interface SaveState {
  status: SaveStatus;
  error: string | null;
  validationErrors: string[];
}

const IDLE_SAVE: SaveState = { status: 'idle', error: null, validationErrors: [] };

interface AdminConfigState {
  // Working copies — loaded together (mentor/topic cross-references need all
  // three in memory) but saved and version-tracked independently.
  topics: TopicConfig[];
  mentors: MentorConfig[];
  metadata: MentoringConfig['metadata'];
  availableDays: string[];
  bookingRules: BookingRules;

  // Last-known-server snapshots, used by discard*() to revert without a
  // round-trip to the API.
  serverTopics: TopicConfig[];
  serverMentors: MentorConfig[];
  serverMetadata: MentoringConfig['metadata'];
  serverAvailableDays: string[];
  serverBookingRules: BookingRules;

  topicsUpdatedAt?: string;
  mentorsUpdatedAt?: string;
  rulesUpdatedAt?: string;

  topicsDirty: boolean;
  mentorsDirty: boolean;
  rulesDirty: boolean;

  topicsSave: SaveState;
  mentorsSave: SaveState;
  rulesSave: SaveState;

  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;

  upsertTopic: (topic: TopicConfig) => void;
  deleteTopic: (topicId: string) => { ok: boolean; reason?: string };
  discardTopics: () => void;
  saveTopics: () => Promise<void>;
  reloadTopics: () => Promise<void>;

  upsertMentor: (mentor: MentorConfig) => void;
  deleteMentor: (mentorId: string) => { ok: boolean; reason?: string };
  discardMentors: () => void;
  saveMentors: () => Promise<void>;
  reloadMentors: () => Promise<void>;

  toggleAvailableDay: (day: string) => void;
  setBookingRules: (rules: BookingRules) => void;
  setMetadata: (metadata: MentoringConfig['metadata']) => void;
  discardRules: () => void;
  saveRules: () => Promise<void>;
  reloadRules: () => Promise<void>;
}

const EMPTY_METADATA: MentoringConfig['metadata'] = { timezone: '', timezone_abbr: '', version: '' };
const EMPTY_BOOKING_RULES: BookingRules = {
  minIntroductionLength: 0,
  maxTopicsSelectable: 0,
  sessionDurationMinutes: 0,
  daysInAdvanceMin: 0,
  daysInAdvanceMax: 0,
};

export const useAdminConfigStore = create<AdminConfigState>((set, get) => ({
  topics: [],
  mentors: [],
  metadata: EMPTY_METADATA,
  availableDays: [],
  bookingRules: EMPTY_BOOKING_RULES,

  serverTopics: [],
  serverMentors: [],
  serverMetadata: EMPTY_METADATA,
  serverAvailableDays: [],
  serverBookingRules: EMPTY_BOOKING_RULES,

  topicsUpdatedAt: undefined,
  mentorsUpdatedAt: undefined,
  rulesUpdatedAt: undefined,

  topicsDirty: false,
  mentorsDirty: false,
  rulesDirty: false,

  topicsSave: IDLE_SAVE,
  mentorsSave: IDLE_SAVE,
  rulesSave: IDLE_SAVE,

  loading: true,
  loadError: null,

  load: async () => {
    set({ loading: true, loadError: null });
    try {
      const [topicsDoc, mentorsDoc, rulesDoc] = await Promise.all([
        apiGetTopics(), apiGetMentors(), apiGetBookingRules(),
      ]);

      set({
        topics: deepCopy(topicsDoc.topics),
        mentors: deepCopy(mentorsDoc.mentors),
        metadata: deepCopy(rulesDoc.metadata),
        availableDays: deepCopy(rulesDoc.availableDays),
        bookingRules: deepCopy(rulesDoc.bookingRules),
        serverTopics: deepCopy(topicsDoc.topics),
        serverMentors: deepCopy(mentorsDoc.mentors),
        serverMetadata: deepCopy(rulesDoc.metadata),
        serverAvailableDays: deepCopy(rulesDoc.availableDays),
        serverBookingRules: deepCopy(rulesDoc.bookingRules),
        topicsUpdatedAt: topicsDoc.updatedAt,
        mentorsUpdatedAt: mentorsDoc.updatedAt,
        rulesUpdatedAt: rulesDoc.updatedAt,
        topicsDirty: false,
        mentorsDirty: false,
        rulesDirty: false,
        topicsSave: IDLE_SAVE,
        mentorsSave: IDLE_SAVE,
        rulesSave: IDLE_SAVE,
      });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat config.' });
    } finally {
      set({ loading: false });
    }
  },

  // ---- topics ----

  upsertTopic: (topic) => {
    const topics = deepCopy(get().topics);
    const idx = topics.findIndex((t) => t.id === topic.id);
    if (idx >= 0) topics[idx] = topic;
    else topics.push(topic);
    set({ topics, topicsDirty: true, topicsSave: IDLE_SAVE });
  },

  deleteTopic: (topicId) => {
    const { topics, mentors } = get();
    const usedBy = mentors.filter((m) => m.expertise.includes(topicId));
    if (usedBy.length > 0) {
      return {
        ok: false,
        reason: `Topic dipakai sebagai expertise oleh: ${usedBy.map((m) => m.name).join(', ')}. Hapus dari mentor dulu.`,
      };
    }
    set({
      topics: topics.filter((t) => t.id !== topicId),
      topicsDirty: true,
      topicsSave: IDLE_SAVE,
    });
    return { ok: true };
  },

  discardTopics: () => {
    set({ topics: deepCopy(get().serverTopics), topicsDirty: false, topicsSave: IDLE_SAVE });
  },

  saveTopics: async () => {
    const result = validateTopics({ topics: get().topics });
    if (!result.ok) {
      set({ topicsSave: { status: 'error', error: 'Topics tidak valid. Perbaiki dulu.', validationErrors: result.errors } });
      return;
    }

    const token = useAdminAuthStore.getState().token;
    if (!token) {
      useAdminAuthStore.getState().logout();
      return;
    }

    set({ topicsSave: { status: 'saving', error: null, validationErrors: [] } });
    try {
      const saved = await apiPutTopics({ topics: result.topics }, get().topicsUpdatedAt, token);
      invalidateConfigCache();
      set({
        topics: deepCopy(saved.topics),
        serverTopics: deepCopy(saved.topics),
        topicsUpdatedAt: saved.updatedAt,
        topicsDirty: false,
        topicsSave: { status: 'saved', error: null, validationErrors: [] },
      });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        useAdminAuthStore.getState().logout();
        set({ topicsSave: IDLE_SAVE });
        return;
      }
      if (err instanceof ConflictError) {
        set({
          topicsSave: {
            status: 'conflict',
            error: 'Topics berubah di tempat lain. Muat ulang untuk mengambil versi terbaru (perubahanmu akan hilang).',
            validationErrors: [],
          },
        });
        return;
      }
      const errors = err instanceof Error && 'errors' in err ? (err as { errors?: string[] }).errors : undefined;
      set({
        topicsSave: {
          status: 'error',
          error: err instanceof Error ? err.message : 'Gagal menyimpan topics.',
          validationErrors: errors ?? [],
        },
      });
    }
  },

  // Refetches just this resource — used to recover from a 409 conflict
  // without discarding unsaved edits sitting in the other two tabs.
  reloadTopics: async () => {
    const doc = await apiGetTopics();
    set({
      topics: deepCopy(doc.topics),
      serverTopics: deepCopy(doc.topics),
      topicsUpdatedAt: doc.updatedAt,
      topicsDirty: false,
      topicsSave: IDLE_SAVE,
    });
  },

  // ---- mentors ----

  upsertMentor: (mentor) => {
    const mentors = deepCopy(get().mentors);
    const idx = mentors.findIndex((m) => m.id === mentor.id);
    if (idx >= 0) mentors[idx] = mentor;
    else mentors.push(mentor);
    set({ mentors, mentorsDirty: true, mentorsSave: IDLE_SAVE });
  },

  deleteMentor: (mentorId) => {
    const mentors = get().mentors;
    if (mentors.length <= 1) {
      return { ok: false, reason: 'Minimal harus ada satu mentor.' };
    }
    set({
      mentors: mentors.filter((m) => m.id !== mentorId),
      mentorsDirty: true,
      mentorsSave: IDLE_SAVE,
    });
    return { ok: true };
  },

  discardMentors: () => {
    set({ mentors: deepCopy(get().serverMentors), mentorsDirty: false, mentorsSave: IDLE_SAVE });
  },

  saveMentors: async () => {
    const validTopicIds = new Set(get().topics.map((t) => t.id));
    const result = validateMentors({ mentors: get().mentors }, validTopicIds);
    if (!result.ok) {
      set({ mentorsSave: { status: 'error', error: 'Mentors tidak valid. Perbaiki dulu.', validationErrors: result.errors } });
      return;
    }

    const token = useAdminAuthStore.getState().token;
    if (!token) {
      useAdminAuthStore.getState().logout();
      return;
    }

    set({ mentorsSave: { status: 'saving', error: null, validationErrors: [] } });
    try {
      const saved = await apiPutMentors({ mentors: result.mentors }, get().mentorsUpdatedAt, token);
      invalidateConfigCache();
      set({
        mentors: deepCopy(saved.mentors),
        serverMentors: deepCopy(saved.mentors),
        mentorsUpdatedAt: saved.updatedAt,
        mentorsDirty: false,
        mentorsSave: { status: 'saved', error: null, validationErrors: [] },
      });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        useAdminAuthStore.getState().logout();
        set({ mentorsSave: IDLE_SAVE });
        return;
      }
      if (err instanceof ConflictError) {
        set({
          mentorsSave: {
            status: 'conflict',
            error: 'Mentors berubah di tempat lain. Muat ulang untuk mengambil versi terbaru (perubahanmu akan hilang).',
            validationErrors: [],
          },
        });
        return;
      }
      const errors = err instanceof Error && 'errors' in err ? (err as { errors?: string[] }).errors : undefined;
      set({
        mentorsSave: {
          status: 'error',
          error: err instanceof Error ? err.message : 'Gagal menyimpan mentors.',
          validationErrors: errors ?? [],
        },
      });
    }
  },

  reloadMentors: async () => {
    const doc = await apiGetMentors();
    set({
      mentors: deepCopy(doc.mentors),
      serverMentors: deepCopy(doc.mentors),
      mentorsUpdatedAt: doc.updatedAt,
      mentorsDirty: false,
      mentorsSave: IDLE_SAVE,
    });
  },

  // ---- booking rules (+ available days, metadata) ----

  toggleAvailableDay: (day) => {
    const availableDays = get().availableDays;
    set({
      availableDays: availableDays.includes(day)
        ? availableDays.filter((d) => d !== day)
        : [...availableDays, day],
      rulesDirty: true,
      rulesSave: IDLE_SAVE,
    });
  },

  setBookingRules: (rules) => {
    set({ bookingRules: rules, rulesDirty: true, rulesSave: IDLE_SAVE });
  },

  setMetadata: (metadata) => {
    set({ metadata, rulesDirty: true, rulesSave: IDLE_SAVE });
  },

  discardRules: () => {
    const { serverMetadata, serverAvailableDays, serverBookingRules } = get();
    set({
      metadata: deepCopy(serverMetadata),
      availableDays: deepCopy(serverAvailableDays),
      bookingRules: deepCopy(serverBookingRules),
      rulesDirty: false,
      rulesSave: IDLE_SAVE,
    });
  },

  saveRules: async () => {
    const { metadata, availableDays, bookingRules } = get();
    const result = validateBookingRules({ metadata, availableDays, bookingRules });
    if (!result.ok) {
      set({ rulesSave: { status: 'error', error: 'Booking rules tidak valid. Perbaiki dulu.', validationErrors: result.errors } });
      return;
    }

    const token = useAdminAuthStore.getState().token;
    if (!token) {
      useAdminAuthStore.getState().logout();
      return;
    }

    set({ rulesSave: { status: 'saving', error: null, validationErrors: [] } });
    try {
      const saved = await apiPutBookingRules(
        { metadata: result.metadata, availableDays: result.availableDays, bookingRules: result.bookingRules },
        get().rulesUpdatedAt,
        token
      );
      invalidateConfigCache();
      set({
        metadata: deepCopy(saved.metadata),
        availableDays: deepCopy(saved.availableDays),
        bookingRules: deepCopy(saved.bookingRules),
        serverMetadata: deepCopy(saved.metadata),
        serverAvailableDays: deepCopy(saved.availableDays),
        serverBookingRules: deepCopy(saved.bookingRules),
        rulesUpdatedAt: saved.updatedAt,
        rulesDirty: false,
        rulesSave: { status: 'saved', error: null, validationErrors: [] },
      });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        useAdminAuthStore.getState().logout();
        set({ rulesSave: IDLE_SAVE });
        return;
      }
      if (err instanceof ConflictError) {
        set({
          rulesSave: {
            status: 'conflict',
            error: 'Booking rules berubah di tempat lain. Muat ulang untuk mengambil versi terbaru (perubahanmu akan hilang).',
            validationErrors: [],
          },
        });
        return;
      }
      const errors = err instanceof Error && 'errors' in err ? (err as { errors?: string[] }).errors : undefined;
      set({
        rulesSave: {
          status: 'error',
          error: err instanceof Error ? err.message : 'Gagal menyimpan booking rules.',
          validationErrors: errors ?? [],
        },
      });
    }
  },

  reloadRules: async () => {
    const doc = await apiGetBookingRules();
    set({
      metadata: deepCopy(doc.metadata),
      availableDays: deepCopy(doc.availableDays),
      bookingRules: deepCopy(doc.bookingRules),
      serverMetadata: deepCopy(doc.metadata),
      serverAvailableDays: deepCopy(doc.availableDays),
      serverBookingRules: deepCopy(doc.bookingRules),
      rulesUpdatedAt: doc.updatedAt,
      rulesDirty: false,
      rulesSave: IDLE_SAVE,
    });
  },
}));
