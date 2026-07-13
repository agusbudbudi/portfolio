import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const SCROLL_THRESHOLD = 200;

// Mentor Di — line banner
const PublicPortfolioScrollBanner: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visible = scrolled && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-16 left-0 w-full z-[999] bg-gradient-to-r from-ld-lilac/90 to-ld-canvas/90 backdrop-blur-md border-b border-ld-ash/20"
        >
          <Link
            to="/portfolio"
            className="max-w-[1200px] mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between flex-nowrap gap-2 no-underline"
          >
            <p className="text-xs font-medium text-ld-graphite m-0 truncate min-w-0">
              Bikin Portfolio QA Engineer-mu di <span className="font-bold">Mentor.QA</span>
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-semibold text-ld-violet whitespace-nowrap">Buat Sekarang</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDismissed(true);
                }}
                aria-label="Tutup"
                className="flex items-center justify-center text-ld-violet/70 hover:text-ld-violet transition-colors bg-transparent border-none cursor-pointer p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PublicPortfolioScrollBanner;
