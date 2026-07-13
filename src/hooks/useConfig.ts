// useConfig – loads and parses the QA mentoring config JSON
// API-first (/api/config, backed by Vercel Blob) with a static-file fallback,
// deduped via a module-level promise cache so multiple consumers share one fetch.
import { useState, useEffect } from 'react';
import type { MentoringConfig } from '../types/mentoring';

export type { TopicConfig, MentorConfig, BookingRules, MentoringConfig } from '../types/mentoring';

interface UseConfigReturn {
  config: MentoringConfig | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

let configPromise: Promise<MentoringConfig> | null = null;

async function fetchJson(url: string): Promise<MentoringConfig> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function loadConfig(): Promise<MentoringConfig> {
  if (!configPromise) {
    configPromise = fetchJson('/api/config').catch(() =>
      fetchJson('/mentoring/config/qa-mentoring-config.json')
    );
    // Don't cache failures — let the next caller retry from scratch.
    configPromise.catch(() => { configPromise = null; });
  }
  return configPromise;
}

// Called by the admin dashboard after a successful save so public pages refetch.
export function invalidateConfigCache() {
  configPromise = null;
}

export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<MentoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadConfig()
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Gagal memuat konfigurasi. Silakan coba lagi.');
          console.error('[useConfig] Failed to load config:', err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [retryCount]);

  const retry = () => {
    invalidateConfigCache();
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  return { config, loading, error, retry };
}
