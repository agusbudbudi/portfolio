import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Topik', href: '#topics' },
  { label: 'Cara Kerja', href: '#how-it-works' },
  { label: 'Mentor', href: '#mentor' },
  { label: 'FAQ', href: '#faq' },
];

const portfolioLink = { label: 'Portfolio QA', to: '/portfolio' };

const LightdashNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((v) => !v);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-16 bg-ld-canvas/90 backdrop-blur-md border-b border-ld-ash z-[1000] font-ld-sans">
        <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-lg font-medium text-ld-graphite tracking-tight no-underline font-ld-display" onClick={closeMenu}>
            <img
              src="/shared/img/mentor-logo.webp"
              alt="Mentor.QA"
              width={28}
              height={28}
              loading="eager"
              decoding="async"
              className="w-7 h-7 object-contain"
            />
            <span>Mentor<span className="text-ld-violet">.QA</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link
              to={portfolioLink.to}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ld-graphite hover:text-ld-violet transition-colors no-underline"
            >
              {portfolioLink.label}
              <span className="inline-flex items-center px-1.5 py-1 rounded-sm bg-ld-violet text-white text-[10px] font-semibold leading-none tracking-wide">
                New
              </span>
            </Link>
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={`/${link.href}`}
                className="text-sm font-medium text-ld-graphite hover:text-ld-violet transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            <Link
              to="/mentoring/booking"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-ld-violet text-white text-sm font-medium no-underline hover:bg-[#1f87e6] transition-colors"
            >
              <Calendar size={15} />
              Book Session
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="w-9 h-9 rounded-md border border-ld-ash bg-ld-canvas text-ld-graphite flex items-center justify-center cursor-pointer transition-colors hover:border-ld-violet hover:text-ld-violet md:hidden"
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
      </header>

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
              className="fixed top-16 left-0 w-full bg-ld-canvas border-b border-ld-ash z-[1002] md:hidden"
            >
              <ul className="list-none m-0 p-0 divide-y divide-ld-ash">
                <motion.li initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.18 }}>
                  <Link
                    to={portfolioLink.to}
                    onClick={closeMenu}
                    className="flex items-center gap-2 px-6 py-4 text-[15px] font-medium text-ld-graphite hover:text-ld-violet hover:bg-ld-cloud transition-colors duration-150 no-underline"
                  >
                    {portfolioLink.label}
                    <span className="inline-flex items-center px-1.5 py-1 rounded-sm bg-ld-violet text-white text-[10px] font-semibold leading-none tracking-wide">
                      New
                    </span>
                  </Link>
                </motion.li>
                {navLinks.map((link, idx) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx + 1) * 0.045, duration: 0.18 }}
                  >
                    <Link
                      to={`/${link.href}`}
                      onClick={closeMenu}
                      className="flex items-center px-6 py-4 text-[15px] font-medium text-ld-graphite hover:text-ld-violet hover:bg-ld-cloud transition-colors duration-150 no-underline"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="px-6 py-4 border-t border-ld-ash bg-ld-cloud/60">
                <Link
                  to="/mentoring/booking"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-lg bg-ld-violet text-white text-sm font-medium no-underline hover:bg-[#1f87e6] transition-colors"
                >
                  <Calendar size={15} />
                  Book Session
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default LightdashNavbar;
