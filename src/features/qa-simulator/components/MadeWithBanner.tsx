import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, Bug, Check } from 'lucide-react';
import { QaSimulatorIcon } from '../../../components/illustration/ProductIcons';

const EASE = [0.4, 0, 0.2, 1] as const;
const pop = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 340, damping: 18, delay } },
});
const rise = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, delay } },
});

// Compact art: the QA Simulator brand icon with a found-bug chip and a
// "done" check landing on it. Plays once on mount; static under reduced motion.
const MadeWithArt: React.FC = () => {
  const reduce = !!useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="relative w-[88px] h-[64px] shrink-0"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      <motion.div variants={rise(0.05)} className="absolute left-1 top-1">
        <QaSimulatorIcon size={52} />
      </motion.div>
      <motion.span
        variants={pop(0.35)}
        className="absolute right-0 top-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-ld-frost shadow-[0_6px_14px_-8px_rgba(39,40,53,0.4)] text-[9px] font-semibold text-red-600"
      >
        <Bug size={10} /> SB-3
      </motion.span>
      <motion.span
        variants={pop(0.55)}
        className="absolute right-4 bottom-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_6px_14px_-6px_rgba(16,120,80,0.55)]"
      >
        <Check size={13} strokeWidth={3} />
      </motion.span>
    </motion.div>
  );
};

/**
 * Banner above a publicly shared simulator portfolio: tells visitors
 * (recruiters, other learners) where the case study comes from and invites
 * them to try QA Simulator or start from QA Course.
 */
const MadeWithBanner: React.FC = () => (
  <section
    aria-label="Tentang QA Simulator"
    className="print:hidden mb-4 rounded-xl border border-ld-lavender bg-gradient-to-r from-ld-lilac to-white px-4 sm:px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-3"
  >
    <MadeWithArt />
    <div className="flex-1 min-w-[200px]">
      <p className="m-0 text-sm font-semibold text-ld-onyx">Portfolio ini dibuat di QA Simulator</p>
      <p className="m-0 mt-1 text-xs text-ld-slate leading-relaxed">
        Simulasi kerja QA dengan PRD, tim, dan aplikasi staging sungguhan. Semua isinya dikerjakan sendiri oleh pemilik portfolio.
      </p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Link
        to="/qa-simulator"
        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium no-underline transition-colors"
      >
        Coba QA Simulator <ArrowRight size={15} />
      </Link>
      <Link
        to="/courses"
        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-ld-frost bg-white text-ld-graphite text-sm font-medium no-underline hover:border-ld-violet transition-colors"
      >
        Belajar dari nol
      </Link>
    </div>
  </section>
);

export default MadeWithBanner;
