import { useState } from 'react';

// Shared client-side pagination for admin tables — all lists here are
// small enough (mentors, topics, tools, bookings, portfolios) to load in
// full and slice locally rather than paginating server-side. `page` is
// clamped to the valid range as a derived value (not synced via effect),
// so it self-corrects the render right after the list shrinks (e.g. delete).
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { page: safePage, setPage, totalPages, pageItems, pageSize };
}
