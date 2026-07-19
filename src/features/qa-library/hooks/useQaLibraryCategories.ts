import { useEffect, useState } from 'react';
import type { QaLibraryCategory } from '../../../types/qaLibrary';

// Public read of the category taxonomy — GET /api/admin-config/qa-library-categories.
export function useQaLibraryCategories(): { categories: QaLibraryCategory[]; loading: boolean } {
  const [categories, setCategories] = useState<QaLibraryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin-config/qa-library-categories')
      .then((res) => (res.ok ? res.json() : { categories: [] }))
      .then((data: { categories: QaLibraryCategory[] }) => {
        if (!cancelled) setCategories(data.categories ?? []);
      })
      .catch(() => { /* non-fatal — filter chips just won't show */ })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { categories, loading };
}
