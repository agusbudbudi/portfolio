// usePortfolio – loads a published mentee portfolio by slug plus the shared
// tools catalog (for project tool badges), for the public /portfolio/:slug page.
import { useEffect, useState } from 'react';
import type { PortfolioRecord, ToolConfig } from '../types/portfolio';

interface UsePortfolioReturn {
  portfolio: PortfolioRecord | null;
  tools: ToolConfig[];
  loading: boolean;
  notFound: boolean;
  error: string | null;
  retry: () => void;
}

export function usePortfolio(slug: string | undefined): UsePortfolioReturn {
  const [portfolio, setPortfolio] = useState<PortfolioRecord | null>(null);
  const [tools, setTools] = useState<ToolConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    Promise.all([
      fetch(`/api/portfolios/${encodeURIComponent(slug)}`),
      fetch('/api/admin-config/tools'),
    ])
      .then(async ([portfolioRes, toolsRes]) => {
        if (cancelled) return;
        if (portfolioRes.status === 404) {
          setNotFound(true);
          return;
        }
        if (!portfolioRes.ok) throw new Error(`HTTP ${portfolioRes.status}`);

        const record = (await portfolioRes.json()) as PortfolioRecord;
        const toolsDoc = toolsRes.ok ? await toolsRes.json() : { tools: [] };
        setPortfolio(record);
        setTools(Array.isArray(toolsDoc.tools) ? toolsDoc.tools : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Gagal memuat portfolio. Silakan coba lagi.');
          console.error('[usePortfolio] Failed to load portfolio:', err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug, retryCount]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setRetryCount((c) => c + 1);
  };

  return { portfolio, tools, loading, notFound, error, retry };
}
