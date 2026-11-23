import React, { Suspense, useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LogIn, TrendingUp } from 'lucide-react';
import CoursesDrawer from './CoursesDrawer';
import LoadingState from '../../../components/common/LoadingState';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';

// Focused shell for reading a course lesson (/qa-library/:slug?course=…).
// Mirrors QA Simulator's "Labs" header (SimulatorLayout): a dark, sticky
// workspace bar so a lesson feels like part of a learning tool rather than a
// marketing page, and a compact one-line footer instead of the site footer.

const CourseHeader: React.FC = () => {
  const user = useAdminAuthStore((s) => s.user);
  const location = useLocation();
  // Lesson pages carry the course as ?course=slug; course pages (e.g.
  // /courses/:slug/selesai) carry it in the path.
  const courseSlug = new URLSearchParams(location.search).get('course')
    ?? location.pathname.match(/^\/courses\/([^/]+)/)?.[1]
    ?? null;
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
            <img src="/shared/img/mentor-logo-96.webp" alt="" width={20} height={20} className="w-5 h-5 object-contain" />
            <span className="hidden sm:inline">Mentor.QA</span>
          </Link>

          <span className="h-5 w-px bg-white/15 shrink-0" aria-hidden="true" />

          <Link to="/courses" className="inline-flex items-center gap-2 no-underline text-white min-w-0">
            <span className="font-semibold tracking-tight truncate">QA Course</span>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md border border-sky-300/40 text-sky-300 font-ld-mono text-[10px] uppercase tracking-widest leading-none">
              Learn
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            className={`inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm border-none cursor-pointer transition-colors ${drawerOpen ? 'bg-white/10 text-white' : 'bg-transparent text-white/60 hover:text-white'}`}
          >
            <GraduationCap size={16} className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Courses</span>
          </button>
          {user ? (
            <Link
              to="/dashboard/courses"
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
              <TrendingUp size={14} className="sm:hidden" aria-hidden="true" />
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
      <CoursesDrawer open={drawerOpen} onClose={closeDrawer} currentSlug={courseSlug} />
    </header>
  );
};

// One-line footer, same pattern as QA Simulator's SimulatorFooter: product
// tag on the left, a few exits on the right. Not the full site footer.
const CourseFooter: React.FC = () => (
  <footer className="print:hidden border-t border-ld-frost bg-ld-canvas font-ld-sans">
    <div className="px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ld-steel">
      <p className="m-0 font-ld-mono">
        QA Course <span className="text-ld-mist">·</span> a Mentor.QA Learn project <span className="text-ld-mist">·</span> © {new Date().getFullYear()}
      </p>
      <div className="flex items-center gap-4">
        <Link to="/" className="text-ld-slate hover:text-ld-violet no-underline">Mentor.QA</Link>
        <Link to="/qa-simulator" className="text-ld-slate hover:text-ld-violet no-underline">QA Simulator</Link>
        <Link to="/mentoring/booking" className="text-ld-slate hover:text-ld-violet no-underline">Booking mentor</Link>
      </div>
    </div>
  </footer>
);

const CourseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-ld-canvas">
    <CourseHeader />
    <main className="flex-grow">
      <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>{children}</Suspense>
    </main>
    <CourseFooter />
  </div>
);

export default CourseLayout;
