import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { UnauthorizedError } from '../../../lib/adminApi';
import type { AssignmentProgress, ProjectProgress } from '../../../types/qaSimulator';
import { apiGetSimulatorProgress, apiPutSimulatorProgress } from '../lib/simulatorApi';
import { blankAssignment, emptyProgress } from '../lib/progress';

export type SyncStatus = 'loading' | 'local' | 'saving' | 'saved' | 'error';

const SAVE_DEBOUNCE_MS = 1200;

const localKey = (projectId: string, userId: string | null) => `qa-simulator:${projectId}:${userId ?? 'guest'}`;

function readLocal(key: string): ProjectProgress | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectProgress;
    return parsed && typeof parsed.assignments === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, progress: ProjectProgress) {
  try {
    localStorage.setItem(key, JSON.stringify(progress));
  } catch {
    // Storage full / blocked — server copy (if logged in) is still the source of truth.
  }
}

const hasContent = (p: ProjectProgress | null) => !!p && Object.keys(p.assignments).length > 0;

/**
 * Guests: progress lives in localStorage only. Logged in: localStorage mirror
 * + Turso (debounced PUT). On first load after login, guest progress is
 * carried over if the account has nothing saved yet — so a learner who did
 * phase 1 anonymously keeps their work once they log in for phase 2.
 */
interface SessionState {
  /** projectId|userId|auth-mode — state resets when any of these change. */
  key: string;
  progress: ProjectProgress;
  status: SyncStatus;
  error: string | null;
}

function readInitialLocal(projectId: string, userId: string | null): ProjectProgress | null {
  return readLocal(localKey(projectId, userId)) ?? (userId ? readLocal(localKey(projectId, null)) : null);
}

export function useSimulatorProgress(projectId: string) {
  const token = useAdminAuthStore((s) => s.token);
  const userId = useAdminAuthStore((s) => s.user?.id ?? null);
  const sessionKey = `${projectId}|${userId ?? ''}|${token ? 'auth' : 'guest'}`;

  const makeInitial = (): SessionState => ({
    key: sessionKey,
    progress: readInitialLocal(projectId, userId) ?? emptyProgress(),
    status: token ? 'loading' : 'local',
    error: null,
  });
  const [session, setSession] = useState<SessionState>(makeInitial);
  // Reset synchronously when project / account changes (React's "adjust state
  // while rendering" pattern) instead of a setState inside an effect.
  const stale = session.key !== sessionKey;
  if (stale) setSession(makeInitial());
  const current = stale ? makeInitial() : session;

  const progressRef = useRef(current.progress);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { progressRef.current = session.progress; }, [session.progress]);

  const patch = useCallback((key: string, next: Partial<SessionState>) => {
    setSession((prev) => (prev.key === key ? { ...prev, ...next } : prev));
  }, []);

  // Logged in: reconcile the local copy with the server copy once per session.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const key = sessionKey;
    const storageKey = localKey(projectId, userId);
    const local = readInitialLocal(projectId, userId);

    const apply = (p: ProjectProgress, status: SyncStatus, error: string | null = null) => {
      progressRef.current = p;
      writeLocal(storageKey, p);
      patch(key, { progress: p, status, error });
    };

    apiGetSimulatorProgress(projectId, token)
      .then(async (record) => {
        if (cancelled) return;
        const server = record?.data ?? null;
        // progressRef (not the snapshot above) so edits typed while the GET
        // was in flight aren't overwritten by an older server copy.
        const localNow = progressRef.current;
        const localIsNewer = hasContent(localNow) && (!server || Date.parse(localNow.updatedAt) > Date.parse(server.updatedAt));
        if (localIsNewer) {
          apply(localNow, 'saving');
          await apiPutSimulatorProgress(projectId, localNow, token);
          if (!cancelled) patch(key, { status: 'saved' });
        } else {
          apply(server ?? emptyProgress(), 'saved');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        apply(local ?? emptyProgress(), 'error', err instanceof UnauthorizedError
          ? 'Sesi login habis. Login ulang untuk menyimpan ke akun.'
          : 'Gagal sinkron dengan server. Perubahan disimpan di browser ini.');
      });

    return () => { cancelled = true; };
  }, [sessionKey, projectId, token, userId, patch]);

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const t = tokenRef.current;
    if (!t) return;
    try {
      await apiPutSimulatorProgress(projectId, progressRef.current, t);
      patch(sessionKey, { status: 'saved', error: null });
    } catch (err) {
      patch(sessionKey, {
        status: 'error',
        error: err instanceof UnauthorizedError ? 'Sesi login habis. Login ulang untuk menyimpan ke akun.' : 'Gagal menyimpan ke server. Perubahan tetap tersimpan di browser ini.',
      });
    }
  }, [projectId, sessionKey, patch]);

  // Flush a pending save when leaving the page.
  useEffect(() => () => {
    if (timerRef.current) void flush();
  }, [flush]);

  const updateAssignment = useCallback(
    (assignmentId: string, updater: (prev: AssignmentProgress) => AssignmentProgress) => {
      const now = new Date().toISOString();
      const prev = progressRef.current;
      const nextAssignment = { ...updater(prev.assignments[assignmentId] ?? blankAssignment()), updatedAt: now };
      const next: ProjectProgress = { assignments: { ...prev.assignments, [assignmentId]: nextAssignment }, updatedAt: now };
      progressRef.current = next;
      writeLocal(localKey(projectId, userId), next);
      const loggedIn = !!tokenRef.current;
      patch(sessionKey, loggedIn ? { progress: next, status: 'saving' } : { progress: next });

      if (!loggedIn) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => { void flush(); }, SAVE_DEBOUNCE_MS);
    },
    [projectId, userId, sessionKey, flush, patch]
  );

  return { progress: current.progress, status: current.status, error: current.error, updateAssignment, flush, loggedIn: !!token };
}
