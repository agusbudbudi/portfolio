import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import LockIllustration from './LockIllustration';
import GoogleSignInButton from '../../../components/common/GoogleSignInButton';
import type { SimulatorPhase } from '../../../types/qaSimulator';

interface LoginPromptModalProps {
  phase: SimulatorPhase;
  phaseNumber: number;
  /** Called after Google sign-in succeeded and the session is stored. */
  onLoggedIn: () => void;
  onClose: () => void;
}

const BENEFITS = [
  'Pekerjaanmu di phase sebelumnya ikut terbawa ke akun.',
  'Progress tersimpan otomatis, lanjutkan dari device mana pun.',
  'Gratis — cukup login pakai akun Google.',
];

// Shown when a guest tries to open a phase that needs an account. The page
// stays on the phase they were on, so closing this loses nothing.
const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ phase, phaseNumber, onLoggedIn, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-ld-onyx/50 backdrop-blur-sm sm:p-4 font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-prompt-title"
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-lg overflow-hidden"
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-transparent hover:bg-ld-cloud text-ld-slate hover:text-ld-onyx border-none cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        <div className="px-6 pt-8 pb-6 text-center">
          <LockIllustration className="mx-auto w-32 h-auto" />
          <p className="m-0 mt-4 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">Phase {phaseNumber}: {phase.shortTitle}</p>
          <h3 id="login-prompt-title" className="m-0 mt-1 text-xl font-semibold text-ld-onyx">Login untuk lanjut ke phase ini</h3>
          <p className="m-0 mt-2 text-sm text-ld-slate">{phase.summary}</p>

          <ul className="m-0 mt-5 p-0 list-none space-y-2 text-left">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-ld-graphite">
                <span className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                  <Check size={11} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-2">
          <GoogleSignInButton onSuccess={onLoggedIn} onError={setError} />
          {error && <p className="m-0 text-xs text-red-500 text-center">{error}</p>}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-transparent hover:bg-ld-cloud text-sm font-medium text-ld-slate border-none cursor-pointer"
          >
            Nanti dulu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPromptModal;
