// Shared class strings + helpers for the admin Feedback screens. Class
// strings match QaCourseForm so the forms read as one admin.
export const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac disabled:bg-ld-cloud disabled:text-ld-slate';
export const smallInputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac disabled:bg-ld-cloud disabled:text-ld-slate';
export const iconBtn =
  'p-1.5 rounded-md text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent disabled:opacity-30 disabled:cursor-not-allowed';
export const infoBox = 'rounded-xl border border-ld-frost p-4 flex flex-col gap-2';
export const infoLabel = 'm-0 text-[11px] font-medium uppercase tracking-widest text-ld-fog';

export const newOptionId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 10);

export function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
