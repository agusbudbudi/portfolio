import { create } from 'zustand';
import { apiListUsers, type AdminUserRecord } from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';

// Read-only list (no create/update/delete from this tab yet) — role grants
// stay a manual DB action for now, see api/_lib/userStore.ts.
interface AdminUsersState {
  users: AdminUserRecord[];
  loading: boolean;
  loadError: string | null;
  load: () => Promise<void>;
}

export const useAdminUsersStore = create<AdminUsersState>((set) => ({
  users: [],
  loading: true,
  loadError: null,

  load: async () => {
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
  },
}));
