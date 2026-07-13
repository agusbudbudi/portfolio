import { create } from 'zustand';
import type { BookingRules, MentoringConfig, TopicConfig } from '../types/mentoring';
import {
  apiGetBookingRules, apiGetTopics,
  apiPutBookingRules, apiPutTopics,
  ConflictError, UnauthorizedError,
} from '../lib/adminApi';
import { validateBookingRules, validateTopics } from '../lib/configValidation';
import { invalidateConfigCache } from '../hooks/useConfig';
import { useAdminAuthStore } from './useAdminAuthStore';
import { useAdminMentorStore } from './useAdminMentorStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'conflict' | 'error';

export interface SaveState {
  status: SaveStatus;
  error: string | null;
  validationErrors: string[];
}

const IDLE_SAVE: SaveState = { status: 'idle', error: null, validationErrors: [] };

export type ActionResult = { ok: boolean; reason?: string };

interface AdminConfigState {
  // Working copies. Topics save immediately per action; booking rules still
  // batches edits behind an explicit Save/Discard. Mentors moved to
  // useAdminMentorStore (real per-row resource, not a config document).
  topics: TopicConfig[];
  metadata: MentoringConfig['metadata'];
  availableDays: string[];
  bookingRules: BookingRules;

  // Last-known-server snapshot for booking rules, used by discardRules() to
  // revert without a round-trip to the API.
  serverMetadata: MentoringConfig['metadata'];
  serverAvailableDays: string[];
  serverBookingRules: BookingRules;

  topicsUpdatedAt?: string;
  rulesUpdatedAt?: string;

  rulesDirty: boolean;
  rulesSave: SaveState;

  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;

  upsertTopic: (topic: TopicConfig) => Promise<ActionResult>;
  deleteTopic: (topicId: string) => Promise<ActionResult>;

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

type Setter = (partial: Partial<AdminConfigState>) => void;
type Getter = () => AdminConfigState;

// Validates + PUTs the full topics array immediately. On conflict, resyncs
// local state to the server's current doc (returned by the API on 409) so
// the next edit starts from fresh data instead of requiring a manual reload.
async function commitTopics(set: Setter, get: Getter, topics: TopicConfig[]): Promise<ActionResult> {
  const result = validateTopics({ topics });
  if (!result.ok) return { ok: false, reason: result.errors.join(' ') };

  const token = useAdminAuthStore.getState().token;
  if (!token) {
    useAdminAuthStore.getState().logout();
    return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
  }

  try {
    const saved = await apiPutTopics({ topics: result.topics }, get().topicsUpdatedAt, token);
    invalidateConfigCache();
    set({ topics: deepCopy(saved.topics), topicsUpdatedAt: saved.updatedAt });
    return { ok: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      useAdminAuthStore.getState().logout();
      return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    }
    if (err instanceof ConflictError) {
      const current = err.current as { topics: TopicConfig[]; updatedAt: string };
      set({ topics: deepCopy(current.topics), topicsUpdatedAt: current.updatedAt });
      return { ok: false, reason: 'Topics berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
    }
    return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan topics.' };
  }
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminConfigStore = create<AdminConfigState>((set, get) => ({
  topics: [],
  metadata: EMPTY_METADATA,
  availableDays: [],
  bookingRules: EMPTY_BOOKING_RULES,

  serverMetadata: EMPTY_METADATA,
  serverAvailableDays: [],
  serverBookingRules: EMPTY_BOOKING_RULES,

  topicsUpdatedAt: undefined,
  rulesUpdatedAt: undefined,

  rulesDirty: false,

  rulesSave: IDLE_SAVE,

  loading: true,
  loadError: null,

  load: () => dedupeInFlight(loadRef, async () => {
    set({ loading: true, loadError: null });
    try {
      const [topicsDoc, rulesDoc] = await Promise.all([
        apiGetTopics(), apiGetBookingRules(),
      ]);

      set({
        topics: deepCopy(topicsDoc.topics),
        metadata: deepCopy(rulesDoc.metadata),
        availableDays: deepCopy(rulesDoc.availableDays),
        bookingRules: deepCopy(rulesDoc.bookingRules),
        serverMetadata: deepCopy(rulesDoc.metadata),
        serverAvailableDays: deepCopy(rulesDoc.availableDays),
        serverBookingRules: deepCopy(rulesDoc.bookingRules),
        topicsUpdatedAt: topicsDoc.updatedAt,
        rulesUpdatedAt: rulesDoc.updatedAt,
        rulesDirty: false,
        rulesSave: IDLE_SAVE,
      });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat config.' });
    } finally {
      set({ loading: false });
    }
  }),

  // ---- topics (save immediately on each action) ----

  upsertTopic: async (topic) => {
    const stamped = { ...topic, updatedAt: new Date().toISOString() };
    const topics = deepCopy(get().topics);
    const idx = topics.findIndex((t) => t.id === stamped.id);
    if (idx >= 0) topics[idx] = stamped;
    else topics.push(stamped);
    return commitTopics(set, get, topics);
  },

  deleteTopic: async (topicId) => {
    const { topics } = get();
    const usedBy = useAdminMentorStore.getState().mentors.filter((m) => m.expertise.includes(topicId));
    if (usedBy.length > 0) {
      return {
        ok: false,
        reason: `Topic dipakai sebagai expertise oleh: ${usedBy.map((m) => m.name).join(', ')}. Hapus dari mentor dulu.`,
      };
    }
    return commitTopics(set, get, topics.filter((t) => t.id !== topicId));
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
