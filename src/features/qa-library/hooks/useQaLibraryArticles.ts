import { useEffect, useState } from 'react';
import type { QaLibraryArticleSummary } from '../../../types/qaLibrary';

interface UseQaLibraryArticlesResult {
  articles: QaLibraryArticleSummary[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

// Public list of published articles, optionally filtered by category —
// GET /api/qa-library?category=.
export function useQaLibraryArticles(categoryId?: string): UseQaLibraryArticlesResult {
  const [articles, setArticles] = useState<QaLibraryArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${categoryId ?? ''}:${attempt}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = categoryId ? `?category=${encodeURIComponent(categoryId)}` : '';
    fetch(`/api/qa-library${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Gagal memuat artikel (HTTP ${res.status}).`);
        return res.json();
      })
      .then((data: { articles: QaLibraryArticleSummary[] }) => {
        if (!cancelled) setArticles(data.articles);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat artikel.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { articles, loading, error, retry: () => setAttempt((a) => a + 1) };
}
