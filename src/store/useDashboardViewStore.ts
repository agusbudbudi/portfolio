import { create } from 'zustand';

/** Which dashboard an admin account is looking at. Non-admins are always 'user'. */
export type DashboardView = 'admin' | 'user';

const STORAGE_KEY = 'dashboard-view';

function readStoredView(): DashboardView {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'user' ? 'user' : 'admin';
  } catch {
    return 'admin';
  }
}

interface DashboardViewState {
  /** The admin's explicit choice from the profile menu; persisted. */
  chosen: DashboardView;
  /** Temporary user view after following a link to a user-only section
   *  (e.g. /dashboard/courses). Memory only, so it never outlives the tab
   *  or overrides what the admin actually picked. */
  override: DashboardView | null;
  setView: (view: DashboardView) => void;
  forceUserView: () => void;
  reset: () => void;
}

export const useDashboardViewStore = create<DashboardViewState>((set) => ({
  chosen: readStoredView(),
  override: null,
  setView: (view) => {
    try {
      localStorage.setItem(STORAGE_KEY, view);
    } catch {
      // Storage blocked: the choice still holds for this tab.
    }
    set({ chosen: view, override: null });
  },
  forceUserView: () => set({ override: 'user' }),
  reset: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ chosen: 'admin', override: null });
  },
}));

export const selectDashboardView = (s: DashboardViewState): DashboardView => s.override ?? s.chosen;
