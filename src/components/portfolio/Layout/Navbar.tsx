import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const navLinks = [
  { to: '/personal-portfolio', label: 'Home', end: true },
  { to: '/personal-portfolio/about', label: 'About & Experience', end: false },
  { to: '/personal-portfolio/projects', label: 'Projects', end: false },
  { to: '/personal-portfolio/certifications', label: 'Certifications', end: false },
  { to: '/mentoring', label: 'Mentoring', end: false },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[70px] bg-ld-canvas/80 backdrop-blur-xl border-b border-ld-ash z-[1000]">
        <nav className="max-w-[1200px] mx-auto px-4 h-full flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/personal-portfolio"
            className="flex items-center font-ld-display font-semibold text-xl md:text-2xl text-ld-graphite tracking-[-0.01em] no-underline"
            onClick={closeMenu}
          >
            <div className="relative w-9 h-9 mr-2">
              <img
                src="/img/profile/logo-portfolio.webp"
                alt="Logo"
                width={36}
                height={36}
                loading="eager"
                decoding="async"
                className="w-full h-full rounded-full object-contain border-2 border-ld-violet/10 p-[2px]"
              />
              <span className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full bottom-0.5 right-0.5 border-2 border-white animate-pulse"></span>
            </div>
            Agus.<span className="text-ld-violet">QA</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-10 list-none m-0 p-0">
              {navLinks.map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors duration-200 block py-2 no-underline relative group ${isActive
                        ? 'text-ld-violet'
                        : 'text-ld-slate hover:text-ld-violet'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {label}
                        <span
                          className={`absolute top-12 left-0 h-[3px] bg-ld-violet rounded-t-full transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                            }`}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile right controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="w-9 h-9 rounded-md border border-ld-ash bg-ld-canvas text-ld-graphite flex items-center justify-center cursor-pointer transition-colors hover:border-ld-violet hover:text-ld-violet"
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
          </div>
        </nav>
      </header>

      {/* Mobile dropdown — rendered as sibling to header, outside its stacking context */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-[70px] bg-black/50 z-[1001] md:hidden"
              onClick={closeMenu}
            />

            {/* Dropdown panel */}
            <motion.div
              key="dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-[70px] left-0 w-full bg-ld-canvas border-b border-ld-ash z-[1002] md:hidden"
            >
              <ul className="list-none m-0 p-0 divide-y divide-ld-ash">
                {navLinks.map(({ to, label, end }, idx) => (
                  <motion.li
                    key={to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.045, duration: 0.18 }}
                  >
                    <NavLink
                      to={to}
                      end={end}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center px-6 py-4 text-[15px] font-medium transition-colors duration-150 no-underline ${isActive
                          ? 'text-ld-violet bg-ld-lilac'
                          : 'text-ld-graphite hover:text-ld-violet hover:bg-ld-cloud'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="w-1 h-4 bg-ld-violet rounded-full mr-3 -ml-1 flex-shrink-0" />
                          )}
                          {label}
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <div className="px-6 py-3 border-t border-ld-ash bg-ld-cloud/60">
                <p className="text-xs text-ld-fog">Agus Budiman · QA Engineer Portfolio</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
