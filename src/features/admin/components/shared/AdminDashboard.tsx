import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut, RefreshCw,
  Users, BookOpen, SlidersHorizontal, CalendarCheck, Menu, X, ExternalLink,
  UserSquare2, Wrench, LayoutDashboard, UserCog,
  type LucideIcon,
} from 'lucide-react';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { useAdminConfigStore } from '../../../../store/useAdminConfigStore';
import { useAdminMentorStore } from '../../../../store/useAdminMentorStore';
import { useAdminBookingsStore } from '../../../../store/useAdminBookingsStore';
import { useAdminPortfolioStore } from '../../../../store/useAdminPortfolioStore';
import { useAdminUsersStore } from '../../../../store/useAdminUsersStore';
import LoadingState from '../../../../components/common/LoadingState';
import AdminHomeTab from '../superadmin/AdminHomeTab';
import BookingRulesTab from '../superadmin/BookingRulesTab';
import TopicsTab from '../superadmin/TopicsTab';
import MentorsTab from '../mentor/MentorsTab';
import BookingsTab from '../superadmin/BookingsTab';
import PortfoliosTab from '../superadmin/PortfoliosTab';
import ToolsTab from '../superadmin/ToolsTab';
import UsersTab from '../superadmin/UsersTab';
import ProfileMenu from './ProfileMenu';

type NavId = 'home' | 'bookings' | 'mentors' | 'users' | 'topics' | 'rules' | 'portfolios' | 'tools';

interface NavItem {
  id: NavId;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'home', label: 'Dashboard', description: 'Ringkasan aktivitas mentoring', icon: LayoutDashboard },
    ],
  },
  {
    id: 'mentoring',
    label: 'Mentoring',
    items: [
      { id: 'bookings', label: 'Bookings', description: 'Booking sesi mentoring', icon: CalendarCheck },
      { id: 'mentors', label: 'Mentors', description: 'Kelola mentor & jadwal', icon: Users },
    ],
  },
  {
    id: 'mentee',
    label: 'Portfolio Mentee',
    items: [
      { id: 'portfolios', label: 'Portfolios', description: 'Portfolio mentee QA', icon: UserSquare2 },
    ],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    items: [
      { id: 'users', label: 'Users', description: 'Semua akun terdaftar', icon: UserCog },
    ],
  },
  {
    id: 'master-data',
    label: 'Master Data',
    items: [
      { id: 'topics', label: 'Topics', description: 'Topik sesi mentoring', icon: BookOpen },
      { id: 'tools', label: 'Tools', description: 'Master tools untuk project portfolio', icon: Wrench },
      { id: 'rules', label: 'Booking Rules', description: 'Hari aktif, aturan & batasan booking', icon: SlidersHorizontal },
    ],
  },
];

import { useSnackbarStore } from '../../../../store/useSnackbarStore';

const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

const AdminDashboard: React.FC = () => {
  const logout = useAdminAuthStore((s) => s.logout);
  const showSnackbar = useSnackbarStore((s) => s.show);
  const user = useAdminAuthStore((s) => s.user);
  const { loading, loadError, load } = useAdminConfigStore();
  const loadMentors = useAdminMentorStore((s) => s.load);
  const loadBookings = useAdminBookingsStore((s) => s.load);
  const loadPortfolios = useAdminPortfolioStore((s) => s.load);
  const loadUsers = useAdminUsersStore((s) => s.load);
  const location = useLocation();
  const navigate = useNavigate();
  const activeNav: NavId = (() => {
    const seg = location.pathname.replace(/^\/dashboard\/?/, '').split('/')[0];
    const validIds: NavId[] = ['bookings', 'mentors', 'users', 'topics', 'rules', 'portfolios', 'tools'];
    return (validIds as string[]).includes(seg) ? (seg as NavId) : 'home';
  })();
  const navPath = (id: NavId) => (id === 'home' ? '/dashboard' : `/dashboard/${id}`);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prefetch so tabs that don't fetch mentors themselves (BookingRulesTab,
  // BookingsTab) have them available — mentors has its own loading state
  // now (see MentorsTab), so it doesn't block the whole dashboard shell.
  // Bookings/portfolios/users are also prefetched so the home tab's stats
  // are ready regardless of which tab the admin lands on first.
  useEffect(() => {
    load();
    loadMentors();
    loadBookings();
    loadPortfolios();
    loadUsers();
  }, [load, loadMentors, loadBookings, loadPortfolios, loadUsers]);

  if (loading) {
    return <LoadingState label="Memuat config…" className="min-h-screen" />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-sm text-red-500 m-0">{loadError}</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ld-violet text-white text-sm font-medium cursor-pointer border-none"
        >
          <RefreshCw size={14} /> Coba lagi
        </button>
      </div>
    );
  }

  const activeItem = NAV_ITEMS.find((item) => item.id === activeNav) ?? NAV_ITEMS[0];

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-ld-frost/60">
        <img
          src="/shared/img/mentor-logo.webp"
          alt="Mentor.QA"
          width={32}
          height={32}
          className="w-8 h-8 rounded-lg object-contain shrink-0"
        />
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-ld-onyx leading-tight truncate">Mentoring Ops</p>
          <p className="m-0 text-[11px] text-ld-fog leading-tight truncate">Operational Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.id}>
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-ld-fog">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { navigate(navPath(item.id)); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer border-none transition-colors ${active
                      ? 'bg-ld-lilac/60 text-ld-violet'
                      : 'bg-transparent text-ld-slate hover:bg-ld-cloud hover:text-ld-graphite'
                      }`}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-ld-frost/60 space-y-1">
        <a
          href="/mentoring/booking"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ld-slate hover:bg-ld-cloud hover:text-ld-graphite no-underline transition-colors"
        >
          <ExternalLink size={17} className="shrink-0" /> Lihat Booking Page
        </a>
        <button
          onClick={() => { logout(); showSnackbar('Kamu telah berhasil keluar.', 'info'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ld-slate hover:bg-red-50 hover:text-red-500 cursor-pointer bg-transparent border-none text-left transition-colors"
        >
          <LogOut size={17} className="shrink-0" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-ld-cloud">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-ld-frost/70 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Sidebar — mobile drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-ld-midnight/40" onClick={() => setSidebarOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-64 flex flex-col bg-white border-r border-ld-frost/70 shadow-[rgba(39,40,53,0.1)_0px_0px_0px_1px,rgba(39,40,53,0.08)_0px_24px_24px_-12px] transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-3 p-1.5 rounded-lg text-ld-fog hover:text-ld-graphite bg-transparent border-none cursor-pointer"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
          {sidebarContent}
        </aside>
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 md:px-6 bg-white/95 backdrop-blur border-b border-ld-frost/70">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-ld-graphite hover:bg-ld-cloud bg-transparent border-none cursor-pointer"
              aria-label="Buka menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="m-0 text-base font-semibold text-ld-onyx leading-tight truncate">{activeItem.label}</h1>
              <p className="m-0 text-[11px] text-ld-fog leading-tight truncate">{activeItem.description}</p>
            </div>
          </div>

          {user && (
            <ProfileMenu
              user={user}
              roleLabel="Admin"
              onLogout={() => { logout(); showSnackbar('Kamu telah berhasil keluar.', 'info'); }}
            />
          )}
        </header>

        <main className="flex-1 p-2 md:p-6 w-full bg-white/70">
          {activeNav === 'home' && <AdminHomeTab onNavigate={(id) => navigate(navPath(id))} />}
          {activeNav === 'bookings' && <BookingsTab />}
          {activeNav === 'mentors' && <MentorsTab />}
          {activeNav === 'users' && <UsersTab />}
          {activeNav === 'topics' && <TopicsTab />}
          {activeNav === 'rules' && <BookingRulesTab />}
          {activeNav === 'portfolios' && <PortfoliosTab />}
          {activeNav === 'tools' && <ToolsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
