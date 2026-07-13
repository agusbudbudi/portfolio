import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';

const ROLE_BADGE_OUTLINE = 'border border-ld-violet text-ld-violet bg-transparent rounded-sm px-1.5 text-[10px] font-medium';

interface ProfileMenuUser {
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface ProfileMenuProps {
  user: ProfileMenuUser;
  roleLabel: string;
  onLogout: () => void;
}

// Top-right header identity control — avatar/name/role trigger + a click-open
// tray with account details and logout. Shared by AdminDashboard and
// MemberDashboard so both header areas stay visually and behaviorally
// identical; only `roleLabel` differs per dashboard.
const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, roleLabel, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 min-w-0 cursor-pointer bg-transparent border-none p-0"
      >
        <div className="hidden sm:flex items-center gap-1.5 min-w-0">
          <span className={`inline-block ${ROLE_BADGE_OUTLINE}`}>{roleLabel}</span>
          <p className="m-0 text-sm font-semibold text-ld-onyx leading-tight truncate">{user.name}</p>
        </div>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-ld-lilac text-ld-violet flex items-center justify-center text-sm font-semibold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <ChevronDown size={16} className={`text-ld-fog shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-ld-frost bg-white shadow-[rgba(39,40,53,0.1)_0px_0px_0px_1px,rgba(39,40,53,0.08)_0px_24px_24px_-12px] z-50 overflow-hidden">
          <div className="p-4 flex items-start gap-3 border-b border-ld-frost/60">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-ld-lilac text-ld-violet flex items-center justify-center text-base font-semibold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold text-ld-onyx leading-tight truncate">{user.name}</p>
              <p className="m-0 text-xs text-ld-fog leading-tight truncate mt-0.5">{user.email}</p>
              <span className={`inline-block mt-1.5 ${ROLE_BADGE_OUTLINE}`}>{roleLabel}</span>
            </div>
          </div>
          <div className="p-2">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ld-slate hover:bg-red-50 hover:text-red-500 cursor-pointer bg-transparent border-none text-left transition-colors"
            >
              <LogOut size={17} className="shrink-0" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
