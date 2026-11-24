import { create } from 'zustand';
import type {
  FeedbackFlowData, FeedbackFlowSummary, FeedbackQuestionData, FeedbackQuestionSummary,
} from '../types/feedback';
import {
  apiCreateFeedbackFlow, apiCreateFeedbackQuestion, apiDeleteFeedbackFlow, apiDeleteFeedbackQuestion,
  apiDuplicateFeedbackQuestion, apiListFeedbackFlows, apiListFeedbackQuestions, apiUpdateFeedbackFlow,
  apiUpdateFeedbackQuestion, ApiError, ConflictError, UnauthorizedError,
} from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

export type ActionResult = { ok: boolean; reason?: string; id?: string };

// Question bank + flows for the admin Feedback menu. Both lists are small,
// so every mutation simply reloads both (usage counts cross over).
interface AdminFeedbackState {
  questions: FeedbackQuestionSummary[];
  flows: FeedbackFlowSummary[];
  loading: boolean;
  loaded: boolean;
  loadError: string | null;
  load: () => Promise<void>;

  saveQuestion: (id: string | null, data: FeedbackQuestionData) => Promise<ActionResult>;
  duplicateQuestion: (id: string) => Promise<ActionResult>;
  deleteQuestion: (id: string) => Promise<ActionResult>;
  saveFlow: (id: string | null, data: FeedbackFlowData) => Promise<ActionResult>;
  deleteFlow: (id: string) => Promise<ActionResult>;
}

const SESSION_ENDED = 'Sesi berakhir, silakan login ulang.';
const CONFLICT = 'Data ini baru saja diubah di tab lain. Muat ulang lalu coba lagi.';

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

function failure(err: unknown, fallback: string): ActionResult {
  if (err instanceof UnauthorizedError) return { ok: false, reason: SESSION_ENDED };
  if (err instanceof ConflictError) return { ok: false, reason: CONFLICT };
  if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
  return { ok: false, reason: err instanceof Error ? err.message : fallback };
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminFeedbackStore = create<AdminFeedbackState>((set, get) => {
  // Runs a mutation with the session token, then refreshes both lists.
  const mutate = async (fallback: string, fn: (token: string) => Promise<{ id?: string } | void>): Promise<ActionResult> => {
    const token = requireToken();
    if (!token) return { ok: false, reason: SESSION_ENDED };
    try {
      const out = await fn(token);
      await get().load();
      return { ok: true, id: out && 'id' in out ? out.id : undefined };
    } catch (err) {
      return failure(err, fallback);
    }
  };

  return {
    questions: [],
    flows: [],
    loading: true,
    loaded: false,
    loadError: null,

    load: () => dedupeInFlight(loadRef, async () => {
      const token = requireToken();
      if (!token) return;
      set({ loading: true, loadError: null });
      try {
        const [{ questions }, { flows }] = await Promise.all([apiListFeedbackQuestions(token), apiListFeedbackFlows(token)]);
        set({ questions, flows, loaded: true });
      } catch (err) {
        if (err instanceof UnauthorizedError) return;
        set({ loadError: err instanceof Error ? err.message : 'Gagal memuat feedback.' });
      } finally {
        set({ loading: false });
      }
    }),

    saveQuestion: (id, data) => mutate('Gagal menyimpan pertanyaan.', (token) => {
      if (!id) return apiCreateFeedbackQuestion(data, token);
      const current = get().questions.find((q) => q.id === id);
      return apiUpdateFeedbackQuestion(id, data, current?.updatedAt ?? '', token);
    }),
    duplicateQuestion: (id) => mutate('Gagal menduplikat pertanyaan.', (token) => apiDuplicateFeedbackQuestion(id, token)),
    deleteQuestion: (id) => mutate('Gagal menghapus pertanyaan.', (token) => apiDeleteFeedbackQuestion(id, token)),

    saveFlow: (id, data) => mutate('Gagal menyimpan flow.', (token) => {
      if (!id) return apiCreateFeedbackFlow(data, token);
      const current = get().flows.find((f) => f.id === id);
      return apiUpdateFeedbackFlow(id, data, current?.updatedAt ?? '', token);
    }),
    deleteFlow: (id) => mutate('Gagal menghapus flow.', (token) => apiDeleteFeedbackFlow(id, token)),
  };
});
