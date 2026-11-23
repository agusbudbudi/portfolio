import { useEffect, useState } from 'react';
import type { QaLibraryArticleSummary } from '../../../types/qaLibrary';

const ARTICLE_PATH = /^\/qa-library\/([a-z0-9-]+)\/?$/;

/** Slug of a QA Library article link, or null for any other URL. */
export function articleSlugFromUrl(url: string): string | null {
  return ARTICLE_PATH.exec(url)?.[1] ?? null;
}

// Summaries (thumbnail, excerpt, reading time) for the QA Library articles a
// phase links to — GET /api/qa-library?slugs=. Missing/draft slugs are simply
// absent from the result; callers fall back to the resource label.
export function usePhaseArticles(slugs: string[]): {
  articles: Record<string, QaLibraryArticleSummary>;
  loading: boolean;
} {
  // Result is tagged with the key it was fetched for, so loading is derived
  // (no synchronous setState in the effect) and stale results never show.
  const [result, setResult] = useState<{ key: string; articles: Record<string, QaLibraryArticleSummary> }>({ key: '', articles: {} });
  const key = slugs.join(',');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/qa-library?slugs=${encodeURIComponent(key)}`)
      .then((res) => (res.ok ? res.json() : { articles: [] }))
      .then((data: { articles: QaLibraryArticleSummary[] }) => {
        if (!cancelled) setResult({ key, articles: Object.fromEntries(data.articles.map((a) => [a.slug, a])) });
      })
      .catch(() => { if (!cancelled) setResult({ key, articles: {} }); });
    return () => { cancelled = true; };
  }, [key]);

  const articles = result.key === key ? result.articles : {};
  const loading = key !== '' && result.key !== key;
  return { articles, loading };
}
