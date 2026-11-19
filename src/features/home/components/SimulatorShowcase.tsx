import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check, FileText, Hash } from 'lucide-react';
import PixelMosaic from '../../../components/illustration/PixelMosaic';

// Home "QA Simulator" row art: tells what the simulator *is* in one picture —
// a Labs workspace walking through the phases (PRD → test case → bug hunting
// → Go/No-Go), a Jira-style bug found on staging, and the PM pinging you in the squad
// channel. Stacked top-to-bottom (chat left, bug right), nothing overlaps. Plays once on mount (the row mounts it when
// scrolled into view). Decorative only.

const EASE = [0.4, 0, 0.2, 1] as const;
const SHADOW = 'shadow-[0_18px_40px_-12px_rgba(39,40,53,0.2)]';

const rise = (delay: number, y = 18): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});
const pop = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 18, delay } },
});
const fill = (delay: number): Variants => ({
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.5, ease: EASE, delay } },
});

const PHASES = ['Requirement', 'Test Design', 'Bug Hunting', 'Go / No-Go'];
const CASES = ['TC-01 Pajak dihitung setelah service', 'TC-02 Diskon > subtotal ditolak', 'TC-03 Nama peserta duplikat'];

const SimulatorShowcase: React.FC = () => {
  const reduce = !!useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[520px] mx-auto flex flex-col gap-7 py-6 select-none font-ld-sans"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      <PixelMosaic variant="blue" className="absolute -top-6 -right-6" style={{ width: 'min(56%, 280px)' }} />

      {/* squad ping — chat bubble, left-aligned */}
      <motion.div variants={pop(0.05)} className="relative z-[1] flex items-end gap-2 w-fit max-w-[80%] origin-bottom-left">
        <span className="w-7 h-7 rounded-full bg-rose-400 text-white flex items-center justify-center text-[9px] font-bold shrink-0">RP</span>
        <span>
          <span className="flex items-center gap-1 mb-1 text-[9px] text-ld-slate">
            <span className="font-semibold text-ld-onyx">Rani</span> · PM <Hash size={9} className="ml-1 text-ld-fog" /> squad-splitbill
          </span>
          <span className="block rounded-2xl rounded-bl-sm bg-white border border-ld-frost px-3 py-2 text-[11px] text-ld-graphite shadow-[0_8px_20px_-10px_rgba(39,40,53,0.25)]">
            PRD Split Bill v2 siap. Tolong review & cari bug-nya ya!
            {/* PRD attachment */}
            <motion.span variants={rise(0.35, 4)} className="mt-2 flex w-fit items-center gap-1.5 rounded-md bg-ld-lilac px-2 py-1">
              <FileText size={11} className="text-ld-violet shrink-0" />
              <span className="text-[10px] font-medium text-ld-violet">PRD-split-bill-v2.md</span>
            </motion.span>
          </span>
        </span>
      </motion.div>

      {/* Labs workspace */}
      <motion.div variants={rise(0.1, 26)} className={`relative z-[1] w-full rounded-xl bg-white border border-ld-frost overflow-hidden ${SHADOW}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-ld-onyx">
          <span className="text-[10px] font-semibold text-white">QA Simulator</span>
          <span className="px-1 py-px rounded-[3px] border border-emerald-400/50 text-emerald-300 font-ld-mono text-[7px] tracking-widest">LABS</span>
          <span className="ml-auto text-[9px] text-white/50">Split Bill v2</span>
        </div>

        {/* phase stepper — each label sits centred under its own dot */}
        <div className="px-1.5 pt-3">
          <div className="flex items-start">
            {PHASES.map((p, i) => (
              <React.Fragment key={p}>
                <div className="flex flex-col items-center w-[58px] shrink-0">
                  <motion.span
                    variants={pop(0.45 + i * 0.35)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${i < 3 ? 'bg-ld-violet text-white' : 'bg-white border-2 border-ld-violet text-ld-violet'}`}
                  >
                    {i < 3 ? <Check size={11} strokeWidth={3} /> : <span className="w-1.5 h-1.5 rounded-full bg-ld-violet" />}
                  </motion.span>
                  <span className="mt-1 text-[8px] text-ld-slate whitespace-nowrap">{p}</span>
                </div>
                {i < PHASES.length - 1 && (
                  <span className="relative flex-1 h-0.5 mt-[9px] -mx-2 bg-ld-frost overflow-hidden">
                    <motion.span variants={fill(0.6 + i * 0.35)} className="absolute inset-0 bg-ld-violet origin-left" />
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* current task */}
        <div className="m-3 rounded-lg border border-ld-frost">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-ld-frost">
            <span className="text-[9px] font-semibold text-ld-onyx">Tugas 2 · Tulis test case</span>
            <span className="px-1.5 py-px rounded bg-emerald-50 text-emerald-700 text-[8px] font-semibold">Submitted</span>
          </div>
          <ul className="m-0 p-0 list-none">
            {CASES.map((c, i) => (
              <motion.li key={c} variants={rise(0.9 + i * 0.15, 6)} className="flex items-center gap-2 px-2.5 py-1.5 border-b last:border-b-0 border-ld-frost">
                <span className="w-3 h-3 rounded-[3px] bg-ld-violet text-white flex items-center justify-center shrink-0"><Check size={8} strokeWidth={3.5} /></span>
                <span className="text-[9px] text-ld-graphite truncate">{c}</span>
                <span className="ml-auto px-1 rounded bg-ld-lilac text-ld-violet text-[7px] font-semibold shrink-0">P1</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* bug found — right-aligned, below the workspace */}
      <motion.div variants={pop(1.6)} className={`relative z-[1] w-[66%] self-end rounded-lg origin-top-right bg-white border border-ld-frost p-2.5 ${SHADOW}`}>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16"><rect width="16" height="16" rx="3" fill="#e2483d" /><circle cx="8" cy="8" r="3.5" fill="#fff" /></svg>
          <span className="text-[9px] font-semibold text-ld-slate">SB-3</span>
          <span className="ml-auto px-1.5 py-px rounded bg-red-50 text-red-600 text-[8px] font-semibold">Major</span>
          <svg width="11" height="11" viewBox="0 0 16 16"><path d="M3 9l5-5 5 5M3 13l5-5 5 5" fill="none" stroke="#c9372c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <p className="m-0 mt-1.5 text-[10.5px] font-semibold text-ld-onyx leading-snug">Pajak dihitung sebelum service charge</p>
        <p className="m-0 mt-1 text-[8.5px] text-ld-slate">Expected Rp 103.950 · Actual Rp 103.500</p>
      </motion.div>

    </motion.div>
  );
};

export default SimulatorShowcase;
