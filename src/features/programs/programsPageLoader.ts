// /programs is the ad landing page, so it gets the same preload treatment as
// "/": ad clicks never see a full-screen Suspense spinner before the hero.
// See lib/pagePreloader.ts.
import { createPagePreloader } from '../../lib/pagePreloader';

export const { preload: preloadProgramsPage, loaded: loadedProgramsPage } = createPagePreloader(
  () => import('./pages/ProgramsPage'),
);
