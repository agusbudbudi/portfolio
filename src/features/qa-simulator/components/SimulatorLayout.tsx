import React, { Suspense, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, LayoutGrid, LogIn } from 'lucide-react';
import LoadingState from '../../../components/common/LoadingState';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import ProjectsDrawer from './ProjectsDrawer';

// Standalone "Labs" shell for the project workspace (/qa-simulator/:projectId;
// the /qa-simulator listing keeps the landing layout) — intentionally looks like a
// separate product (dark workspace bar, terminal-ish type, minimal footer)
// so entering the simulator feels like stepping into a tool, not another
// landing section. The only way back to the marketing site is the explicit
// "Mentor.QA" link on the left.

const SimulatorHeader: React.FC = () => {
  const user = useAdminAuthStore((s) => s.user);
  const location = useLocation();
  const loginHref = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <header className="print:hidden sticky top-0 z-[1000] h-14 bg-ld-onyx text-white border-b border-white/10 font-ld-sans">
      <nav className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white no-underline transition-colors shrink-0"
            aria-label="Mentor.QA — halaman utama"
          >
            <img src="/shared/img/mentor-logo.webp" alt="" width={20} height={20} className="w-5 h-5 object-contain" />
            <span className="hidden sm:inline">Mentor.QA</span>
          </Link>

          <span className="h-5 w-px bg-white/15 shrink-0" aria-hidden="true" />

          <Link to="/qa-simulator" className="inline-flex items-center gap-2 no-underline text-white min-w-0">
            <span className="font-semibold tracking-tight truncate">QA Simulator</span>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md border border-emerald-400/40 text-emerald-300 font-ld-mono text-[10px] uppercase tracking-widest leading-none">
              Labs
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-sm border-none cursor-pointer transition-colors ${drawerOpen ? 'bg-white/10 text-white' : 'bg-transparent text-white/60 hover:text-white'}`}
          >
            <LayoutGrid size={15} className="sm:hidden" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Projects</span>
          </button>
          {user ? (
            <Link
              to="/dashboard/simulator"
              className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-sm text-white no-underline transition-colors"
              title="Progress saya di dashboard"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-ld-violet flex items-center justify-center text-xs font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <LayoutDashboard size={14} className="sm:hidden" />
              <span className="hidden sm:inline">Progress saya</span>
            </Link>
          ) : (
            <Link
              to={loginHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ld-violet hover:bg-ld-violet/90 text-sm font-medium text-white no-underline transition-colors"
            >
              <LogIn size={14} /> Masuk
            </Link>
          )}
        </div>
      </nav>
      <ProjectsDrawer open={drawerOpen} onClose={closeDrawer} />
    </header>
  );
};

const SimulatorFooter: React.FC = () => (
  <footer className="print:hidden border-t border-ld-frost bg-ld-canvas font-ld-sans">
    <div className="px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ld-steel">
      <p className="m-0 font-ld-mono">
        QA Simulator <span className="text-ld-mist">·</span> a Mentor.QA Labs project <span className="text-ld-mist">·</span> © {new Date().getFullYear()}
      </p>
      <div className="flex items-center gap-4">
        <Link to="/" className="text-ld-slate hover:text-ld-violet no-underline">Mentor.QA</Link>
        <Link to="/qa-library" className="text-ld-slate hover:text-ld-violet no-underline">QA Library</Link>
        <Link to="/mentoring/booking" className="text-ld-slate hover:text-ld-violet no-underline">Booking mentor</Link>
      </div>
    </div>
  </footer>
);

const SimulatorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-ld-cloud print:bg-white print:min-h-0">
    <SimulatorHeader />
    <main className="flex-grow">
      <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>{children}</Suspense>
    </main>
    <SimulatorFooter />
  </div>
);

export default SimulatorLayout;
