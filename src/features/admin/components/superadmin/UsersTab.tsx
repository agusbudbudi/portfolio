import React, { useEffect } from 'react';
import { useAdminUsersStore } from '../../../../store/useAdminUsersStore';
import { usePagination } from '../../../../hooks/usePagination';
import { sortByUpdatedAtDesc } from '../../../../lib/sortByUpdatedAt';
import LoadingState from '../../../../components/common/LoadingState';
import Pagination from '../shared/Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';

const ROLE_TONE: Record<string, StatusBadgeTone> = {
  admin: 'violet',
  mentor: 'sky',
  mentee: 'slate',
};

// Highest-priority role only — a user with all three roles is shown as
// "admin", not all three badges.
const ROLE_PRIORITY = ['admin', 'mentor', 'mentee'];

const primaryRole = (roles: string[]): string =>
  ROLE_PRIORITY.find((role) => roles.includes(role)) ?? roles[0] ?? 'mentee';

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

const UsersTab: React.FC = () => {
  const { users, loading, loadError, load } = useAdminUsersStore();

  useEffect(() => { load(); }, [load]);

  const sorted = sortByUpdatedAtDesc(users);
  const { page, setPage, totalPages, pageItems: pagedUsers } = usePagination(sorted);

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Users</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{users.length} akun terdaftar.</p>
        </div>
      </div>

      <div className={ADMIN_CARD_BODY}>
        {loadError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{loadError}</p>
        )}

        {loading ? (
          <LoadingState label="Memuat users…" />
        ) : (
          <>
            <div className="overflow-x-auto border border-ld-frost rounded-xl">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ld-cloud text-left">
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Id</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">User</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Role</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Terdaftar</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Update terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((user) => (
                    <tr key={user.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <code className="text-[11px] text-ld-slate">{user.id}</code>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-3 min-w-[220px]">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-full object-cover border border-ld-frost shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-ld-lilac text-ld-violet flex items-center justify-center text-sm font-semibold shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ld-onyx m-0 truncate">{user.name}</p>
                            <p className="text-xs text-ld-fog m-0 mt-0.5 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <StatusBadge tone={ROLE_TONE[primaryRole(user.roles)] ?? 'slate'}>
                          {primaryRole(user.roles)}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-ld-slate whitespace-nowrap">{formatDateTime(user.createdAt)}</td>
                      <td className="px-4 py-3 align-top text-xs text-ld-slate whitespace-nowrap">{formatDateTime(user.updatedAt)}</td>
                    </tr>
                  ))}
                  {sorted.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-ld-fog">Belum ada user terdaftar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={sorted.length} pageSize={10} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default UsersTab;
