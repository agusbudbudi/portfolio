import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check, Link2 } from 'lucide-react';
import { QaLibraryIcon, QaPortfolioIcon, QaSimulatorIcon } from '../../../components/illustration/ProductIcons';

// Course hero illustration, shared by every course (no course- or
// product-specific copy). One course told in ~3s: the three steps tick off
// one by one while the progress bar fills, then the portfolio card pops up
// below it (right-aligned, never overlapping) and stays still. Brand (docs/DESIGN.md): white 12px cards, hairline
// borders, slate-tinted shadows, one Sky Blue accent. Decorative: aria-hidden,
// the hero copy carries the meaning. Reduced motion = the finished state.

const EASE = [0.4, 0, 0.2, 1] as const;
const CARD = 'bg-white border border-ld-frost rounded-xl shadow-[0_18px_40px_-12px_rgba(39,40,53,0.18)]';

const rise = (delay: number, y = 18): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } },
});
const popIn = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.4 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 360, damping: 18, delay } },
});

// Brand product icons: each step is the product it uses.
const STEPS = [
  { icon: QaLibraryIcon, label: 'Belajar', body: 'Baca materi singkat' },
  { icon: QaSimulatorIcon, label: 'Praktik', body: 'Kerjakan misi simulator' },
  { icon: QaPortfolioIcon, label: 'Bukti', body: 'Susun portfolio' },
];

// Each step ticks this long after the previous one; the bar fills in lockstep.
const FIRST_TICK = 0.9;
const TICK_GAP = 0.55;

const CourseJourneyIllustration: React.FC = () => {
  const reduce = !!useReducedMotion();
  const lastTick = FIRST_TICK + TICK_GAP * (STEPS.length - 1);

  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[380px] mx-auto flex flex-col gap-7 select-none"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      {/* Course window */}
      <motion.div variants={rise(0.1, 24)} className={`relative z-10 ${CARD} overflow-hidden`}>
        <div className="flex items-center gap-1.5 px-3.5 h-9 border-b border-ld-frost bg-ld-cloud">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2.5 px-2 py-0.5 rounded-md bg-white border border-ld-frost text-[10px] font-semibold uppercase tracking-[0.1em] text-ld-violet">
            QA Course
          </span>
        </div>

        <div className="p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.06em] text-ld-steel">
            <span>Progress belajar</span>
            <motion.span variants={popIn(lastTick + 0.1)} className="normal-case tracking-normal font-semibold text-emerald-600">
              Selesai
            </motion.span>
          </div>
          <div className="h-1.5 rounded-full bg-ld-frost overflow-hidden">
            <motion.div
              className="h-full bg-ld-violet origin-left"
              variants={{
                hidden: { scaleX: 0.04 },
                show: {
                  scaleX: 1,
                  transition: { duration: lastTick - FIRST_TICK + 0.5, ease: 'linear', delay: FIRST_TICK - 0.2 },
                },
              }}
            />
          </div>

          <ul className="m-0 p-0 list-none flex flex-col gap-2 mt-1">
            {STEPS.map(({ icon: Icon, label, body }, i) => (
              <motion.li
                key={label}
                variants={rise(0.3 + i * 0.12, 10)}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ld-frost"
              >
                <Icon size={32} className="shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold text-ld-graphite">{label}</span>
                  <span className="block mt-0.5 text-xs text-ld-slate">{body}</span>
                </span>
                <span className="relative w-5 h-5 shrink-0">
                  <span className="absolute inset-0 rounded-full border-2 border-ld-frost" />
                  <motion.span
                    variants={popIn(FIRST_TICK + i * TICK_GAP)}
                    className="absolute inset-0 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                  >
                    <Check size={12} strokeWidth={3} />
                  </motion.span>
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Portfolio card: below the window, right-aligned (no overlap); pops
          in after the last tick and then stays still */}
      <motion.div
        variants={popIn(lastTick + 0.35)}
        className={`relative z-20 self-end origin-top-right ${CARD} flex items-center gap-2.5 px-3.5 py-2.5`}
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-ld-violet text-white shrink-0"><Link2 size={15} /></span>
        <span>
          <span className="block text-[11px] text-ld-steel">Portfolio publik</span>
          <span className="block text-[13px] font-semibold text-ld-onyx">Siap dibagikan ke recruiter</span>
        </span>
      </motion.div>
    </motion.div>
  );
};

export default CourseJourneyIllustration;
