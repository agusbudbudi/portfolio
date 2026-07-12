// Shared "newest updated on top" sort for admin tables (bookings, portfolios,
// mentors, topics, tools). ISO timestamp strings compare correctly with
// plain string comparison; items without one (never re-saved since the
// updatedAt field was added) sort to the bottom.
export function sortByUpdatedAtDesc<T extends { updatedAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}
