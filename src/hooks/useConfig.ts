// useConfig – loads and parses the QA mentoring config JSON
import { useState, useEffect } from 'react';

export interface TopicConfig {
  id: string;
  label: string;
  description: string;
  image?: string;
  popular?: boolean;
}

export interface MentorConfig {
  id: string;
  name: string;
  whatsapp: string;
  expertise: string[];
  bio: string;
  avatar?: string;
  schedule: Record<string, string[]>;
}

export interface BookingRules {
  minIntroductionLength: number;
  maxTopicsSelectable: number;
  sessionDurationMinutes: number;
  daysInAdvanceMin: number;
  daysInAdvanceMax: number;
}

export interface MentoringConfig {
  metadata: {
    timezone: string;
    timezone_abbr: string;
    version: string;
  };
  topics: TopicConfig[];
  mentors: MentorConfig[];
  availableDays: string[];
  bookingRules: BookingRules;
}

interface UseConfigReturn {
  config: MentoringConfig | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useConfig(): UseConfigReturn {
  const [config, setConfig] = useState<MentoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/config/qa-mentoring-config.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MentoringConfig = await res.json();
        if (!cancelled) {
          setConfig(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Gagal memuat konfigurasi. Silakan coba lagi.');
          console.error('[useConfig] Failed to load config:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [retryCount]);

  const retry = () => setRetryCount((c) => c + 1);

  return { config, loading, error, retry };
}
