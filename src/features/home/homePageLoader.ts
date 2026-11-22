// HomePage is code-split (keeps the main bundle small for every other route),
// but "/" is the main entry/SEO page. main.tsx calls preloadHomePage() before
// the first render on "/", so App renders the already-loaded module directly:
// no Suspense fallback -> content layout shift before the hero LCP.

type HomePageModule = typeof import('./pages/HomePage');

let loaded: HomePageModule | null = null;
let pending: Promise<HomePageModule> | null = null;

export function preloadHomePage(): Promise<HomePageModule> {
  pending ??= import('./pages/HomePage').then(
    (m) => (loaded = m),
    (err) => {
      pending = null; // let the lazy path retry instead of caching the failure
      throw err;
    },
  );
  return pending;
}

export function loadedHomePage(): HomePageModule | null {
  return loaded;
}
