import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import GoogleSignInButton from '../../../components/common/GoogleSignInButton';
import LockIllustration from '../../qa-simulator/components/LockIllustration';

const BENEFITS = [
  'Progress course tersimpan, lanjutkan dari device mana pun.',
  'Misi QA Simulator tercatat otomatis di course.',
  'Gratis. Cukup login pakai akun Google.',
];

interface CourseLoginModalProps {
  courseTitle: string;
  /** e.g. the lesson the guest tried to open. */
  lessonTitle?: string;
  onLoggedIn: () => void;
  onClose: () => void;
}

// Guests can read the first lesson of a course; anything after asks them to
// log in so their progress can be saved.
const CourseLoginModal: React.FC<CourseLoginModalProps> = ({ courseTitle, lessonTitle, onLoggedIn, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-ld-onyx/50 backdrop-blur-sm sm:p-4 font-ld-sans"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="course-login-title" className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-transparent hover:bg-ld-cloud text-ld-slate hover:text-ld-onyx border-none cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>
        <div className="px-6 pt-8 pb-6 text-center">
          <LockIllustration className="mx-auto w-28 h-auto" />
          <p className="m-0 mt-4 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">{courseTitle}</p>
          <h3 id="course-login-title" className="m-0 mt-1 text-xl font-semibold text-ld-onyx">Login untuk lanjut belajar</h3>
          {lessonTitle && <p className="m-0 mt-2 text-sm text-ld-slate">Berikutnya: {lessonTitle}</p>}
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
          {error && <p className="m-0 text-xs text-center text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default CourseLoginModal;
