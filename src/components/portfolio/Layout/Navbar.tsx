import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const navLinks = [
  { to: '/portfolio', label: 'Home', end: true },
  { to: '/portfolio/about', label: 'About & Experience', end: false },
  { to: '/portfolio/projects', label: 'Projects', end: false },
  { to: '/portfolio/certifications', label: 'Certifications', end: false },
  { to: '/mentoring', label: 'Mentoring', end: false },
];

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[70px] bg-white/60 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 z-[1000] transition-colors duration-200 shadow-sm shadow-slate-100/40 dark:shadow-none">
        <nav className="max-w-[1200px] mx-auto px-4 h-full flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/portfolio"
            className="flex items-center text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight decoration-none"
            onClick={closeMenu}
          >
            <div className="relative w-9 h-9 mr-3">
              <img
                src="/img/profile/logo-portfolio.png"
                alt="Logo"
                className="w-full h-full rounded-full object-contain border-2 border-blue-500/10 dark:bg-white p-[2px]"
              />
              <span className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full bottom-0.5 right-0.5 border-2 border-white dark:border-slate-900 animate-pulse"></span>
            </div>
            Agus.<span className="text-blue-500">QA</span>
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
                      `text-sm font-semibold transition-colors duration-200 block py-2 decoration-none relative group ${isActive
                        ? 'text-blue-500'
                        : 'text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {label}
                        <span
                          className={`absolute top-12 left-0 h-[3px] bg-blue-500 rounded-t-full transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                            }`}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <button
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* Mobile right controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-500 dark:hover:text-blue-400"
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
              className="fixed top-[70px] left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-[1002] md:hidden"
            >
              <ul className="list-none m-0 p-0 divide-y divide-slate-100 dark:divide-slate-800/60">
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
                        `flex items-center px-6 py-4 text-[15px] font-semibold transition-colors duration-150 decoration-none ${isActive
                          ? 'text-blue-500 bg-blue-50 dark:bg-blue-500/10'
                          : 'text-slate-700 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="w-1 h-4 bg-blue-500 rounded-full mr-3 -ml-1 flex-shrink-0" />
                          )}
                          {label}
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40">
                <p className="text-xs text-slate-400 dark:text-slate-500">Agus Budiman · QA Engineer Portfolio</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
