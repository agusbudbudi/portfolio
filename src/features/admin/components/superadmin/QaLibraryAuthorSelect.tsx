import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, User as UserIcon } from 'lucide-react';
import type { AdminUserRecord } from '../../../../lib/adminApi';

// Searchable single-select with avatar — admin lookup for the article
// Author field, mirrors MentorSelect.tsx's UX but sources from the
// registered `users` list instead of mentors.
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

const QaLibraryAuthorSelect: React.FC<QaLibraryAuthorSelectProps> = ({ users, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const closeDropdown = () => { setOpen(false); setQuery(''); };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const selectedUser = users.find((u) => u.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  const select = (user: AdminUserRecord) => {
    onChange(user);
    closeDropdown();
  };

  return (
    <div ref={rootRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => (open ? closeDropdown() : setOpen(true))}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-ld-frost bg-white text-left text-sm cursor-pointer hover:border-ld-violet transition-colors"
        >
          {selectedUser ? (
            <span className="flex items-center gap-2.5 min-w-0">
              <Avatar user={selectedUser} />
              <span className="min-w-0">
                <span className="block text-ld-onyx font-medium truncate">{selectedUser.name}</span>
                <span className="block text-[11px] text-ld-fog truncate">{selectedUser.email}</span>
              </span>
            </span>
          ) : (
            <span className="text-ld-fog">Pilih author</span>
          )}
          <ChevronDown size={15} className={`text-ld-fog flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-ld-frost bg-white shadow-[rgba(39,40,53,0.1)_0px_0px_0px_1px,rgba(39,40,53,0.12)_0px_12px_24px_-8px]">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-ld-frost/60">
              <Search size={14} className="text-ld-fog flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari user…"
                className="w-full text-sm outline-none border-none bg-transparent text-ld-onyx placeholder:text-ld-fog"
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <p className="px-2.5 py-3 text-xs text-ld-fog text-center m-0">User tidak ditemukan.</p>
              )}
              {filtered.map((user) => {
                const selected = user.id === value;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => select(user)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer border-none transition-colors ${
                      selected ? 'bg-ld-lilac/60' : 'bg-transparent hover:bg-ld-cloud'
                    }`}
                  >
                    <Avatar user={user} size={32} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ld-onyx truncate">{user.name}</span>
                      <span className="block text-[11px] text-ld-fog truncate">{user.email}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QaLibraryAuthorSelect;
