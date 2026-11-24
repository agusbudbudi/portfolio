import React, { useEffect, useRef, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import PortfolioLiveIllustration from '../../../../components/illustration/PortfolioLiveIllustration';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import { useIsMobileSheet } from '../../../../hooks/useMediaQuery';

// Shown once a portfolio goes live (dashboard card or form "Simpan & publish").
// Plays the page going live (PortfolioLiveIllustration), shows the public link with copy, and opens the page. Same scrim
// and panel as ConfirmationDialog (bottom sheet below sm); wrap in
// <AnimatePresence> for the exit.

interface Props {
  url: string;
  /** Profile photo, shown in the mockup's avatar. */
  photoUrl?: string;
  onClose: () => void;
}

const PortfolioPublishedDialog: React.FC<Props> = ({ url, photoUrl, onClose }) => {
  const trapRef = useFocusTrap<HTMLDivElement>();
  const sheet = useIsMobileSheet();
  const dragControls = useDragControls();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); window.clearTimeout(copiedTimer.current); };
  }, [onClose]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { return; }
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center sm:p-4 bg-ld-onyx/50 backdrop-blur-sm font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="published-title"
        className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-xl border-t sm:border border-ld-frost/70 shadow-[0_-8px_32px_rgba(39,40,53,0.14)] sm:shadow-[0_24px_64px_rgba(39,40,53,0.18)] outline-none"
        initial={sheet ? { y: '100%' } : { opacity: 0, y: 12, scale: 0.97 }}
        animate={sheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={sheet ? { y: '100%' } : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
        // Bottom sheet: drag the handle down to dismiss (not the content, so scroll and text fields work).
        dragControls={dragControls}
        dragListener={false}
        drag={sheet ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 600) onClose(); }}
      >
        <div
          aria-hidden="true"
          onPointerDown={(e) => dragControls.start(e)}
          className="sm:hidden flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing touch-none"
        >
          <span className="w-10 h-1 rounded-full bg-ld-ash" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud bg-transparent border-none cursor-pointer transition-colors"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-5 sm:pt-8 pb-6 text-center">
          <PortfolioLiveIllustration photoUrl={photoUrl} className="mx-auto w-64 max-w-full h-auto -mt-3 -mb-1" />
          <h2 id="published-title" className="m-0 mt-3 text-xl font-semibold text-ld-onyx">Portfolio kamu sudah live!</h2>
          <p className="m-0 mt-1.5 text-sm text-ld-slate leading-relaxed max-w-xs mx-auto">
            Siapa saja bisa membukanya sekarang. Bagikan link-nya ke recruiter atau taruh di profil LinkedIn kamu.
          </p>

          <div className="mt-5 flex items-center gap-1.5 min-w-0 rounded-lg bg-ld-cloud border border-ld-frost pl-3 pr-1 py-1 text-left">
            <span className="flex-1 font-ld-mono text-xs text-ld-slate truncate">{url.replace(/^https?:\/\//, '')}</span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-medium text-ld-graphite hover:text-ld-violet hover:bg-white cursor-pointer border-none bg-transparent transition-colors shrink-0"
              aria-label="Salin link portfolio"
            >
              {copied ? <><Check size={14} className="text-green-600" /> Tersalin</> : <><Copy size={14} /> Salin</>}
            </button>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-6 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:pb-4 border-t border-ld-frost bg-ld-cloud/50">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center min-h-11 max-sm:min-h-12 px-5 rounded-lg border border-ld-frost bg-white text-sm max-sm:text-[15px] font-medium text-ld-graphite hover:bg-ld-cloud cursor-pointer transition-colors"
          >
            Tutup
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            autoFocus
            className="inline-flex items-center justify-center gap-1.5 min-h-11 max-sm:min-h-12 px-5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm max-sm:text-[15px] font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ld-violet"
          >
            Buka portfolio <ExternalLink size={15} />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PortfolioPublishedDialog;
