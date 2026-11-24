import { useSyncExternalStore } from 'react';

/**
 * Live match of a CSS media query, e.g. useMediaQuery('(max-width: 639px)').
 * Server/first render without `window` reads as false.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Below Tailwind's `sm` (640px): dialogs render as bottom sheets. */
export const useIsMobileSheet = () => useMediaQuery('(max-width: 639px)');
