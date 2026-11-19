import { useCallback, useEffect, useState } from 'react';
import type { SimulatorIndex, SimulatorProject } from '../../../types/qaSimulator';
import { fetchSimulatorIndex, fetchSimulatorProject } from '../lib/simulatorApi';

interface Settled<T> {
  key: string;
  data: T | null;
  error: string | null;
}

// `loading` is derived (settled result belongs to an older key) rather than
// set inside the effect, so there's no synchronous setState in the effect body.
function useKeyedFetch<T>(baseKey: string, load: () => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const key = `${baseKey}:${attempt}`;
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((data) => { if (!cancelled) setSettled({ key, data, error: null }); })
      .catch((err: Error) => { if (!cancelled) setSettled({ key, data: null, error: err.message || 'Gagal memuat data.' }); });
    return () => { cancelled = true; };
  }, [key, load]);

  const current = settled?.key === key ? settled : null;
  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { data: current?.data ?? null, error: current?.error ?? null, loading: current === null, retry };
}

export function useSimulatorIndex() {
  const { data, ...rest } = useKeyedFetch<SimulatorIndex>('index', fetchSimulatorIndex);
  return { index: data, ...rest };
}

export function useSimulatorProject(projectId: string) {
  const load = useCallback(() => fetchSimulatorProject(projectId), [projectId]);
  const { data, ...rest } = useKeyedFetch<SimulatorProject>(projectId, load);
  return { project: data, ...rest };
}
