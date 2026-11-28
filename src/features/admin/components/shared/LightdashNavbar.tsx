import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { ProductsMobileList, ProductsTrayPanel } from './ProductsTray';
import OnboardingBanner, { OnboardingBannerSpacer } from '../../../onboarding/components/OnboardingBanner';

const navLinks = [
  { label: 'Mentoring', to: '/mentoring' },
];

const portfolioLink = { label: 'Portfolio QA', to: '/portfolio' };
const qaLibraryLink = { label: 'QA Library', to: '/qa-library' };
const qaSimulatorLink = { label: 'QA Simulator', to: '/qa-simulator' };
const qaCourseLink = { label: 'QA Course', to: '/courses' };

// Desktop menu, in order. NavLink matches by prefix, so /mentoring/booking
// highlights "Mentoring" and /qa-library/:slug highlights "QA Library".
const DESKTOP_LINKS: { label: string; to: string; badge?: string }[] = [
  { ...qaCourseLink, badge: 'New' },
  { ...qaSimulatorLink, badge: 'New' },
  portfolioLink,
  qaLibraryLink,
  ...navLinks,
];

// Primary header CTA. Signed out: Google sign-in (free) that returns to the
// current page. Signed in: shortcut to the user's dashboard.
const AuthCta: React.FC<{ mobile?: boolean; onNavigate?: () => void; inverted?: boolean }> = ({ mobile = false, onNavigate, inverted = false }) => {
  const user = useAdminAuthStore((s) => s.user);
  const { pathname, search } = useLocation();
  const base = `inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium no-underline transition-colors ${mobile ? 'w-full px-4 py-2.5' : 'px-4 py-2.5'}`;

  if (user) {
    return (
      <Link to="/dashboard" onClick={onNavigate} className={`${base} ${inverted ? 'border border-white/40 bg-white/10 text-white hover:bg-white/20' : 'border border-ld-ash bg-ld-canvas text-ld-graphite hover:border-ld-violet hover:text-ld-violet'}`}>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" width={20} height={20} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <LayoutDashboard size={15} />
        )}
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      to={`/login?redirect=${encodeURIComponent(pathname + search)}`}
      onClick={onNavigate}
      className={`${base} group ${inverted ? 'bg-white text-ld-violet hover:bg-ld-lilac' : 'bg-ld-violet text-white hover:bg-[#1f87e6]'}`}
      aria-label="Masuk atau daftar gratis dengan Google"
    >
      Mulai Gratis
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
};

const LightdashNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);
  const trayBtnRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  const closeMenu = () => setIsMenuOpen(false);
  const closeTray = () => setTrayOpen(false);

  // Product tray: close on route change (adjusted during render, no effect),
  // outside click, or Escape (focus returns to the trigger).
  const [trayPath, setTrayPath] = useState(pathname);
  if (trayPath !== pathname) {
    setTrayPath(pathname);
    setTrayOpen(false);
  }
  useEffect(() => {
    if (!trayOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!trayRef.current?.contains(t) && !trayBtnRef.current?.contains(t)) setTrayOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setTrayOpen(false); trayBtnRef.current?.focus(); }
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); window.removeEventListener('keydown', onKey); };
  }, [trayOpen]);
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  // Pages whose hero starts with the brand blue get a transparent, white-text
  // header while at the very top; it turns back to the white bar once the
  // page scrolls (or a menu/tray opens, since those panels are white).
  const hasBlueHero = pathname === '/mentoring';
  const [atTop, setAtTop] = useState(() => typeof window === 'undefined' || window.scrollY < 8);
  useEffect(() => {
    if (!hasBlueHero) return;
    const onScroll = () => setAtTop(window.scrollY < 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasBlueHero]);
  const onBlue = hasBlueHero && atTop && !trayOpen && !isMenuOpen;

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full h-16 border-b z-[1000] font-ld-sans transition-[background-color,border-color,backdrop-filter] duration-300 ${
          onBlue ? 'bg-transparent border-transparent' : 'bg-ld-canvas/90 backdrop-blur-md border-ld-ash'
        }`}
      >
        <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
          <Link to="/" className={`flex items-center gap-2 text-lg font-medium tracking-tight no-underline font-ld-display transition-colors ${onBlue ? 'text-white' : 'text-ld-graphite'}`} onClick={closeMenu}>
            <img
              src="/shared/img/mentor-logo-96.webp"
              alt="Mentor.QA"
              width={28}
              height={28}
              loading="eager"
              decoding="async"
              className={`w-7 h-7 object-contain rounded-md transition-shadow ${onBlue ? 'ring-2 ring-white/80' : ''}`}
            />
            <span>Mentor<span className={onBlue ? 'text-ld-lilac' : 'text-ld-violet'}>.QA</span></span>
          </Link>

          <div className="hidden md:flex items-stretch gap-7 h-full">
            <button
              ref={trayBtnRef}
              type="button"
              onClick={() => setTrayOpen((v) => !v)}
              aria-expanded={trayOpen}
              aria-controls="products-tray"
              className={`relative inline-flex items-center gap-1 h-full bg-transparent border-none cursor-pointer text-sm font-medium transition-colors ${trayOpen ? 'text-ld-violet' : onBlue ? 'text-white/90 hover:text-white' : 'text-ld-graphite hover:text-ld-violet'}`}
            >
              Program
              <ChevronDown size={15} className={`transition-transform ${trayOpen ? 'rotate-180' : ''}`} />
              <span aria-hidden="true" className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-ld-violet transition-opacity ${trayOpen ? 'opacity-100' : 'opacity-0'}`} />
            </button>
            {DESKTOP_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative inline-flex items-center gap-1.5 h-full text-sm font-medium no-underline transition-colors ${
                    onBlue
                      ? isActive ? 'text-white' : 'text-white/85 hover:text-white'
                      : isActive ? 'text-ld-violet' : 'text-ld-graphite hover:text-ld-violet'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {link.badge && (
                      <span className={`inline-flex items-center px-1.5 py-1 rounded-sm text-[10px] font-semibold leading-none tracking-wide ${onBlue ? 'bg-white text-ld-violet' : 'bg-ld-violet text-white'}`}>
                        {link.badge}
                      </span>
                    )}
                    {/* active underline, flush with the header's bottom border */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full transition-opacity ${onBlue ? 'bg-white' : 'bg-ld-violet'} ${isActive ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <AuthCta inverted={onBlue} />
          </div>

          {/* Mobile hamburger */}
          <button
            className={`w-9 h-9 rounded-md border flex items-center justify-center cursor-pointer transition-colors md:hidden ${onBlue ? 'border-white/40 bg-white/10 text-white hover:bg-white/20' : 'border-ld-ash bg-ld-canvas text-ld-graphite hover:border-ld-violet hover:text-ld-violet'}`}
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
        {/* Guest invite to onboarding, hangs below the header bar */}
        <OnboardingBanner suppressed={trayOpen || isMenuOpen} />
        {/* Products tray (desktop) — hangs below the header bar */}
        <AnimatePresence>
          {trayOpen && (
            <motion.div
              ref={trayRef}
              key="products-tray"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="hidden md:block absolute left-0 right-0 top-full bg-ld-canvas border-b border-ld-frost shadow-[0_18px_40px_-20px_rgba(39,40,53,0.25)]"
            >
              <ProductsTrayPanel id="products-tray" onNavigate={closeTray} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {/* Pushes the page down while the onboarding strip shows (blue on /mentoring,
          whose hero runs under the transparent header). */}
      <OnboardingBannerSpacer color={hasBlueHero ? '#3b9eff' : undefined} />
      <AnimatePresence>
        {trayOpen && (
          <motion.div
            key="tray-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:block fixed inset-0 top-16 bg-ld-onyx/20 z-[999]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile dropdown — rendered as sibling to header, outside its stacking context */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 bg-black/50 z-[1001] md:hidden"
              onClick={closeMenu}
            />

            <motion.div
              key="dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-16 left-0 w-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-ld-canvas border-b border-ld-ash z-[1002] md:hidden"
            >
              <div className="border-b border-ld-ash py-2">
                <p className="m-0 px-6 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-ld-fog">Program</p>
                <ProductsMobileList onNavigate={closeMenu} />
              </div>
              <ul className="list-none m-0 p-0 divide-y divide-ld-ash">
                <motion.li initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}>
                  <NavLink
                    to={qaSimulatorLink.to}
                    onClick={closeMenu}
                    className={({ isActive }) => `flex items-center gap-2 px-6 py-4 text-[15px] font-medium transition-colors duration-150 no-underline ${isActive ? 'text-ld-violet bg-ld-lilac/50 shadow-[inset_3px_0_0_#3b9eff]' : 'text-ld-graphite hover:text-ld-violet hover:bg-ld-cloud'}`}
                  >
                    {qaSimulatorLink.label}
                    <span className="inline-flex items-center px-1.5 py-1 rounded-sm bg-ld-violet text-white text-[10px] font-semibold leading-none tracking-wide">
                      New
                    </span>
                  </NavLink>
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.045, duration: 0.18 }}>
                  <NavLink
                    to={portfolioLink.to}
                    onClick={closeMenu}
                    className={({ isActive }) => `flex items-center px-6 py-4 text-[15px] font-medium transition-colors duration-150 no-underline ${isActive ? 'text-ld-violet bg-ld-lilac/50 shadow-[inset_3px_0_0_#3b9eff]' : 'text-ld-graphite hover:text-ld-violet hover:bg-ld-cloud'}`}
                  >
                    {portfolioLink.label}
                  </NavLink>
                </motion.li>
                <motion.li initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.09, duration: 0.18 }}>
                  <NavLink
                    to={qaLibraryLink.to}
                    onClick={closeMenu}
                    className={({ isActive }) => `flex items-center px-6 py-4 text-[15px] font-medium transition-colors duration-150 no-underline ${isActive ? 'text-ld-violet bg-ld-lilac/50 shadow-[inset_3px_0_0_#3b9eff]' : 'text-ld-graphite hover:text-ld-violet hover:bg-ld-cloud'}`}
                  >
                    {qaLibraryLink.label}
                  </NavLink>
                </motion.li>
                {navLinks.map((link, idx) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx + 3) * 0.045, duration: 0.18 }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={closeMenu}
                      className={({ isActive }) => `flex items-center px-6 py-4 text-[15px] font-medium transition-colors duration-150 no-underline ${isActive ? 'text-ld-violet bg-ld-lilac/50 shadow-[inset_3px_0_0_#3b9eff]' : 'text-ld-graphite hover:text-ld-violet hover:bg-ld-cloud'}`}
                  >
                      {link.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <div className="px-6 py-4 border-t border-ld-ash bg-ld-cloud/60">
                <AuthCta mobile onNavigate={closeMenu} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LightdashNavbar;
