import { useEffect, useState } from 'react';
import type { QaLibraryArticle } from '../../../types/qaLibrary';

interface UseQaLibraryArticleResult {
  article: QaLibraryArticle | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
}

// Public read-by-slug — GET /api/qa-library/:slug. 404 (draft or missing)
// surfaces as notFound, distinct from a network/server error.
export function useQaLibraryArticle(slug: string | undefined): UseQaLibraryArticleResult {
  const [article, setArticle] = useState<QaLibraryArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = slug ?? '';

  useEffect(() => {
    if (!slug) { setLoading(false); setNotFound(true); return; }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);

    fetch(`/api/qa-library/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (res.status === 404) { if (!cancelled) setNotFound(true); return null; }
        if (!res.ok) throw new Error(`Gagal memuat artikel (HTTP ${res.status}).`);
        return res.json();
      })
      .then((data: QaLibraryArticle | null) => {
        if (!cancelled && data) setArticle(data);
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

  return { article, loading, notFound, error };
}
