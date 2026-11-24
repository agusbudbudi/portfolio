import React from 'react';
import { User as UserIcon } from 'lucide-react';
import type { AdminUserRecord } from '../../../../lib/adminApi';
import Combobox from '../../../../components/common/Combobox';

// Searchable author lookup for the article Author field, sourced from the
// registered `users` list (search matches name and email).
interface QaLibraryAuthorSelectProps {
  users: AdminUserRecord[];
  value: string | undefined; // authorUserId
  onChange: (user: AdminUserRecord) => void;
}

const Avatar: React.FC<{ user: AdminUserRecord; size?: number }> = ({ user, size = 28 }) => (
  user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt=""
      className="rounded-full object-cover border border-ld-frost shrink-0"
      style={{ width: size, height: size }}
      referrerPolicy="no-referrer"
    />
  ) : (
    <span
      className="rounded-full bg-ld-cloud border border-ld-frost shrink-0 flex items-center justify-center text-ld-fog"
      style={{ width: size, height: size }}
    >
      <UserIcon size={size * 0.55} />
    </span>
  )
);

const QaLibraryAuthorSelect: React.FC<QaLibraryAuthorSelectProps> = ({ users, value, onChange }) => (
  <Combobox
    options={users.map((u) => ({ value: u.id, label: u.name, description: u.email, keywords: u.email, leading: <Avatar user={u} /> }))}
    value={value}
    onChange={(id) => {
      const user = users.find((u) => u.id === id);
      if (user) onChange(user);
    }}
    placeholder="Pilih author"
    searchPlaceholder="Cari user…"
    emptyLabel="User tidak ditemukan."
    aria-label="Author"
  />
);

export default QaLibraryAuthorSelect;
