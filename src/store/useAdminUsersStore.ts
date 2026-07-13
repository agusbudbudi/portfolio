import { create } from 'zustand';
import { apiListUsers, type AdminUserRecord } from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

// Read-only list (no create/update/delete from this tab yet) — role grants
// stay a manual DB action for now, see api/_lib/userStore.ts.
interface AdminUsersState {
  users: AdminUserRecord[];
  loading: boolean;
  loadError: string | null;
  load: () => Promise<void>;
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminUsersStore = create<AdminUsersState>((set) => ({
  users: [],
  loading: true,
  loadError: null,

  load: () => dedupeInFlight(loadRef, async () => {
    const token = useAdminAuthStore.getState().token;
    if (!token) return useAdminAuthStore.getState().logout();
    set({ loading: true, loadError: null });
    try {
      const { users } = await apiListUsers(token);
      set({ users });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat users.' });
    } finally {
      set({ loading: false });
    }
  }),
}));
