import { useEffect, useState } from 'react';
import type { QaLibraryArticle } from '../../../types/qaLibrary';

interface UseQaLibraryArticleResult {
  article: QaLibraryArticle | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
}

// Public read-by-slug — GET /api/qa-library/:slug. 404 (draft or missing)
// surfaces as notFound, distinct from a network/server error. `courseSlug` =
// the article is read as a lesson of that course: the API then sends a
// course-only article whole instead of its library preview.
export function useQaLibraryArticle(slug: string | undefined, courseSlug?: string | null): UseQaLibraryArticleResult {
  const [article, setArticle] = useState<QaLibraryArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = `${slug ?? ''}|${courseSlug ?? ''}`;

  useEffect(() => {
    if (!slug) { setLoading(false); setNotFound(true); return; }
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setError(null);

    const query = courseSlug ? `?course=${encodeURIComponent(courseSlug)}` : '';
    fetch(`/api/qa-library/${encodeURIComponent(slug)}${query}`)
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
