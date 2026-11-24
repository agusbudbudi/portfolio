// HomePage is code-split (keeps the main bundle small for every other route),
// but "/" is the main entry/SEO page, so main.tsx preloads it before the first
// render there. See lib/pagePreloader.ts.
import { createPagePreloader } from '../../lib/pagePreloader';

export const { preload: preloadHomePage, loaded: loadedHomePage } = createPagePreloader(
  () => import('./pages/HomePage'),
);
