// Preload-before-first-render for code-split landing pages ("/", "/programs").
// main.tsx calls `preload()` before the first render on that path, and App
// renders `loaded()` directly when it is set, so the page paints without a
// Suspense fallback (no layout shift before the hero LCP). `preload` also
// works as the React.lazy factory for every other entry path.

export interface PagePreloader<M> {
  preload: () => Promise<M>;
  /** The module once `preload` has resolved, else null. */
  loaded: () => M | null;
}

export function createPagePreloader<M>(load: () => Promise<M>): PagePreloader<M> {
  let loaded: M | null = null;
  let pending: Promise<M> | null = null;
  return {
    preload() {
      pending ??= load().then(
        (m) => (loaded = m),
        (err) => {
          pending = null; // let the lazy path retry instead of caching the failure
          throw err;
        },
      );
      return pending;
    },
    loaded: () => loaded,
  };
}

/** Pathname without trailing slashes, so "/programs/" matches "/programs". */
export const normalizePath = (pathname: string) => pathname.replace(/\/+$/, '') || '/';
