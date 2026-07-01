// useDraft – localStorage draft management for QA Mentoring Booking
import { useState, useCallback, useRef } from 'react';
import type { FormData } from '../lib/validation';

const STORAGE_KEY = 'qa-mentoring-booking-draft';
const EXPIRY_DAYS = 7;
const DEBOUNCE_MS = 1000;

interface DraftData {
  savedAt: string;
  expiresAt: string;
  formData: FormData;
}

interface UseDraftReturn {
  draft: DraftData | null;
  save: (formData: FormData) => void;
  restore: () => FormData | null;
  clear: () => void;
  draftSavedIndicator: boolean;
}

function readDraft(): DraftData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: DraftData = JSON.parse(raw);
    const now = new Date();
    const expiry = new Date(data.expiresAt);

    if (now > expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function useDraft(): UseDraftReturn {
  const [draft, setDraft] = useState<DraftData | null>(() => readDraft());
  const [draftSavedIndicator, setDraftSavedIndicator] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indicatorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((formData: FormData) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      try {
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + EXPIRY_DAYS);

        const draftData: DraftData = {
          savedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          formData,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
        setDraft(draftData);

        // Show "Draft tersimpan" indicator for 2 seconds
        setDraftSavedIndicator(true);
        if (indicatorTimer.current) clearTimeout(indicatorTimer.current);
        indicatorTimer.current = setTimeout(() => {
          setDraftSavedIndicator(false);
        }, 2000);
      } catch (err) {
        console.warn('[useDraft] localStorage write failed:', err);
      }
    }, DEBOUNCE_MS);
  }, []);

  const restore = useCallback((): FormData | null => {
    const current = readDraft();
    return current?.formData ?? null;
  }, []);

  const clear = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    try {
      localStorage.removeItem(STORAGE_KEY);
      setDraft(null);
    } catch {
      // ignore
    }
  }, []);

  return { draft, save, restore, clear, draftSavedIndicator };
}
