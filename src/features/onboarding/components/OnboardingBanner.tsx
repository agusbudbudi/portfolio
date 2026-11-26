import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { track } from '../../../lib/analytics';
import { readParkedClaim } from '../claimStore';

const DISMISS_KEY = 'onboarding-banner-dismissed';

function readDismissed(): boolean {
  try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
}

// Guest invite to the onboarding questionnaire (PRD Onboarding Guest B1-B5):
// a thin strip hanging under the fixed public header, overlapping the top of
// the hero. Only for signed-out visitors who haven't dismissed it or already
// answered (parked claim); hidden once the page scrolls or a header panel
// (product tray, mobile menu) is open.
const OnboardingBanner: React.FC<{ suppressed?: boolean }> = ({ suppressed = false }) => {
  const signedIn = useAdminAuthStore((s) => !!s.token);
  const { pathname, search } = useLocation();
  const [dismissed, setDismissed] = useState(readDismissed);
  // Read per render, not once: the navbar stays mounted across routes, so a
  // guest coming back from the onboarding result must see it gone.
  const answered = readParkedClaim() !== null;
  const [atTop, setAtTop] = useState(() => typeof window === 'undefined' || window.scrollY < 8);

  // /career-path embeds the same questionnaire and the home page has its own
  // invite card under the hero (HomePersonalizeCard), so no strip on either.
  const path = pathname.replace(/\/+$/, '') || '/';
  const eligible = !signedIn && !dismissed && !answered && path !== '/career-path' && path !== '/';

  useEffect(() => {
    if (!eligible) return;
    const onScroll = () => setAtTop(window.scrollY < 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [eligible]);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* shows again next visit */ }
  };

  const href = `/onboarding?next=${encodeURIComponent(pathname + search)}`;

  return (
    <AnimatePresence>
      {eligible && atTop && !suppressed && (
        <motion.div
          key="onboarding-banner"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute left-0 right-0 top-full bg-ld-lilac/95 backdrop-blur-md border-b border-ld-lavender/60 font-ld-sans"
        >
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-9 flex items-center gap-2">
            <Link
              to={href}
              onClick={() => track('onboarding_banner_clicked', { path: pathname })}
              className="group flex-1 min-w-0 flex items-center justify-center gap-2 h-full text-[13px] text-ld-graphite no-underline"
            >
              <span aria-hidden="true" className="grid grid-cols-2 gap-[2px] shrink-0">
                <span className="w-[5px] h-[5px] rounded-[1px] bg-ld-violet" />
                <span className="w-[5px] h-[5px] rounded-[1px] bg-ld-lavender" />
                <span className="w-[5px] h-[5px] rounded-[1px] bg-ld-lavender" />
                <span className="w-[5px] h-[5px] rounded-[1px] bg-ld-violet" />
              </span>
              <span className="truncate">
                <span className="font-semibold text-ld-onyx">Bingung mulai<span className="hidden sm:inline"> dari mana</span>?</span>{' '}
                <span className="hidden sm:inline">Temukan program QA yang cocok, cuma 1 menit.</span>
                <span className="sm:hidden">Cek program yang cocok</span>
              </span>
              <ArrowRight size={14} className="shrink-0 text-ld-violet transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Tutup ajakan"
              className="shrink-0 w-7 h-7 -mr-1.5 flex items-center justify-center rounded-md bg-transparent border-none text-ld-slate hover:text-ld-onyx hover:bg-white/60 cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingBanner;
