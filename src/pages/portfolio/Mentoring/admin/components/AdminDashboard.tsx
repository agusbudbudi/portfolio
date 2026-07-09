import React, { useEffect, useState } from 'react';
import {
  LogOut, RotateCcw, Save, AlertTriangle, RefreshCw, Zap,
  Users, BookOpen, SlidersHorizontal, Menu, X, ExternalLink,
} from 'lucide-react';
import { useAdminAuthStore } from '../../../../../store/useAdminAuthStore';
import { useAdminConfigStore } from '../../../../../store/useAdminConfigStore';
import BookingRulesTab from './BookingRulesTab';
import TopicsTab from './TopicsTab';
import MentorsTab from './MentorsTab';

const NAV_ITEMS = [
  { id: 'mentors', label: 'Mentors', description: 'Kelola mentor & jadwal', icon: Users },
  { id: 'topics', label: 'Topics', description: 'Topik sesi mentoring', icon: BookOpen },
  { id: 'rules', label: 'Booking Rules', description: 'Hari aktif, aturan & batasan booking', icon: SlidersHorizontal },
] as const;

type NavId = (typeof NAV_ITEMS)[number]['id'];

const AdminDashboard: React.FC = () => {
  const logout = useAdminAuthStore((s) => s.logout);
  const {
    draft, dirty, loading, loadError, saveStatus, saveError, validationErrors,
    load, discard, save,
  } = useAdminConfigStore();
  const [activeNav, setActiveNav] = useState<NavId>('mentors');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || (!draft && !loadError)) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-ld-fog">Memuat config…</div>;
  }

  if (loadError || !draft) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-sm text-red-500 m-0">{loadError ?? 'Config tidak tersedia.'}</p>
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
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-ld-ash/60">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-ld-violet text-white shrink-0">
          <Zap size={16} />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-ld-onyx leading-tight truncate">Mentoring Ops</p>
          <p className="m-0 text-[11px] text-ld-fog leading-tight truncate">Operational Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer border-none transition-colors ${
                active
                  ? 'bg-ld-lilac/60 text-ld-violet'
                  : 'bg-transparent text-ld-slate hover:bg-ld-cloud hover:text-ld-graphite'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-ld-ash/60 space-y-1">
        <a
          href="/mentoring/booking"
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ld-slate hover:bg-ld-cloud hover:text-ld-graphite no-underline transition-colors"
        >
          <ExternalLink size={17} className="shrink-0" /> Lihat Booking Page
        </a>
        <button
          onClick={logout}
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
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-ld-ash/70 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Sidebar — mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ld-midnight/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-white border-r border-ld-ash/70 shadow-[rgba(39,40,53,0.1)_0px_0px_0px_1px,rgba(39,40,53,0.08)_0px_24px_24px_-12px]">
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
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 md:px-6 bg-white/95 backdrop-blur border-b border-ld-ash/70">
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
              <p className="m-0 text-[11px] text-ld-fog leading-tight truncate">
                {draft.metadata.updatedAt
                  ? `Terakhir disimpan ${new Date(draft.metadata.updatedAt).toLocaleString('id-ID')}`
                  : activeItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {dirty && (
              <span className="hidden sm:inline-flex text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                Belum disimpan
              </span>
            )}
            <button
              onClick={discard}
              disabled={!dirty || saveStatus === 'saving'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-ld-ash bg-white text-sm text-ld-graphite hover:border-ld-steel disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <RotateCcw size={14} /> <span className="hidden sm:inline">Discard</span>
            </button>
            <button
              onClick={save}
              disabled={!dirty || saveStatus === 'saving'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none transition-colors"
            >
              <Save size={14} /> {saveStatus === 'saving' ? 'Menyimpan…' : 'Save changes'}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 w-full">
          {saveStatus === 'saved' && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
              Config berhasil disimpan.
            </div>
          )}

          {saveStatus === 'conflict' && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2"><AlertTriangle size={16} /> {saveError}</span>
              <button
                onClick={load}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium cursor-pointer border-none"
              >
                Muat ulang
              </button>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              <p className="m-0 font-medium">{saveError}</p>
              {validationErrors.length > 0 && (
                <ul className="m-0 mt-2 pl-5 space-y-0.5">
                  {validationErrors.map((err) => <li key={err}>{err}</li>)}
                </ul>
              )}
            </div>
          )}

          <section className="bg-white rounded-xl border border-ld-ash/70 p-5 md:p-6">
            {activeNav === 'mentors' && <MentorsTab />}
            {activeNav === 'topics' && <TopicsTab />}
            {activeNav === 'rules' && <BookingRulesTab />}
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
