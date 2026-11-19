import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Bug, FileText, ShieldAlert } from 'lucide-react';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';

// Hero composition for /qa-simulator: one sprint told in ~3.5s, kept to two
// floating cards so it stays calm next to the headline.
//   PM sends the PRD → a bug is boxed on the staging app → release
//   recommendation lands.
// Brand (docs/DESIGN.md): white 12px cards, hairline Ash borders, slate-tinted
// shadows, a single Sky Blue accent, and the blue pixel-mosaic hero ornament
// anchored top-right. Entrance plays once on mount; floating cards stay still afterwards.
// Purely decorative — aria-hidden; the hero copy carries the meaning.

const EASE = [0.4, 0, 0.2, 1] as const;
const CARD = 'bg-white border border-ld-frost rounded-xl shadow-[0_18px_40px_-12px_rgba(39,40,53,0.18)]';

const rise = (delay: number, y = 18): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } },
});
const popIn = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 18, delay } },
});
const growX = (delay: number): Variants => ({
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.5, ease: EASE, delay } },
});

const ROWS = [
  { name: 'Rani', amount: 'Rp85.000', w: '62%' },
  { name: 'Dimas', amount: 'Rp72.500', w: '48%' },
  { name: 'Kamu', amount: 'Rp79.000', w: '55%' },
];

const HeroIllustration: React.FC = () => {
  const reduce = !!useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[520px] mx-auto aspect-[1/0.9] select-none"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      <PixelMosaic variant="blue" className="absolute -top-6 -right-4 sm:-right-10" style={{ width: 'min(62%, 300px)' }} />

      {/* Staging app window */}
      <motion.div variants={rise(0.15, 28)} className={`absolute left-[8%] top-[22%] w-[78%] ${CARD} overflow-hidden`}>
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-ld-frost bg-ld-cloud">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 truncate rounded-md bg-white border border-ld-frost px-2 py-0.5 text-[10px] font-ld-mono text-ld-steel">
            staging.splitbill.my.id
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-ld-steel">Split Bill · Makan malam</p>
          <p className="m-0 mt-1 text-base sm:text-lg font-semibold text-ld-onyx">Ringkasan tagihan</p>
          <ul className="m-0 mt-3 p-0 list-none space-y-2">
            {ROWS.map((r, i) => (
              <li key={r.name} className="flex items-center gap-2.5">
                <span className="w-6 h-6 shrink-0 rounded-full bg-ld-lilac text-ld-violet text-[10px] font-semibold flex items-center justify-center">
                  {r.name[0]}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[11px] font-medium text-ld-graphite leading-none">{r.name}</span>
                  <motion.span variants={growX(0.6 + i * 0.12)} style={{ originX: 0, width: r.w }} className="block mt-1.5 h-1 rounded-full bg-ld-frost" />
                </span>
                <span className="text-[11px] font-ld-mono text-ld-slate">{r.amount}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-3 pt-3 border-t border-dashed border-ld-ash flex items-center justify-between">
            <span className="text-xs font-semibold text-ld-graphite">Total</span>
            <span className="text-sm font-ld-mono font-semibold text-ld-onyx">Rp236.500</span>
            {/* bug selection box */}
            <motion.svg
              variants={popIn(2.5)}
              className="absolute -inset-x-2 -top-0.5 -bottom-1.5 w-[calc(100%+16px)] h-[calc(100%+8px)] overflow-visible"
              preserveAspectRatio="none"
            >
              <motion.rect
                x="1" y="1" width="99%" height="92%" rx="6" fill="rgba(59,158,255,0.06)" stroke="#3b9eff" strokeWidth="1.5" strokeDasharray="5 4"
                {...(reduce ? {} : { animate: { strokeDashoffset: [0, -18] }, transition: { duration: 1.2, repeat: Infinity, ease: 'linear' } })}
              />
            </motion.svg>
            <motion.span
              variants={popIn(2.7)}
              className="absolute -right-3 -top-4 w-6 h-6 rounded-full bg-ld-violet text-white flex items-center justify-center shadow-[0_4px_10px_rgba(59,158,255,0.45)]"
            >
              <Bug size={13} />
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* PM message: typing → PRD shared */}
      <motion.div variants={popIn(0.9)} style={{ originX: 0, originY: 1 }} className="absolute left-0 -top-8 sm:-top-10 w-[56%] sm:w-[50%]">
        <div className={`${CARD} p-3`}>
          <div className="flex items-start gap-2.5">
            <span className="w-7 h-7 shrink-0 rounded-full bg-rose-400 text-white text-[10px] font-semibold flex items-center justify-center">RP</span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[10px] text-ld-steel leading-none"><span className="font-semibold text-ld-graphite">Rani</span> · Product Manager</p>
              <div className="grid mt-1.5">
                <motion.span
                  className="[grid-area:1/1] flex items-center gap-1 h-5"
                  initial={reduce ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 1.9, duration: 0.2 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-ld-fog"
                      {...(reduce ? {} : { animate: { y: [0, -3, 0] }, transition: { duration: 0.6, delay: 1 + i * 0.12, repeat: 2 } })}
                    />
                  ))}
                </motion.span>
                <motion.span
                  className="[grid-area:1/1] text-[11px] sm:text-xs text-ld-graphite leading-snug"
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.0, duration: 0.35 }}
                >
                  PRD Split Bill v2 siap. Tolong review ya!
                </motion.span>
              </div>
              <motion.div
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-ld-lilac px-2 py-1"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.35 }}
              >
                <FileText size={11} className="text-ld-violet" />
                <span className="text-[10px] font-medium text-ld-violet">PRD-split-bill-v2.md</span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Release recommendation */}
      <motion.div variants={popIn(3.2)} style={{ originX: 1, originY: 1 }} className="absolute right-0 -bottom-8 sm:-bottom-12">
        <div className="flex items-center gap-2.5 rounded-xl bg-ld-midnight px-3.5 py-2.5 shadow-[0_18px_40px_-12px_rgba(39,40,53,0.45)]">
          <span className="w-7 h-7 rounded-full bg-ld-violet text-white flex items-center justify-center"><ShieldAlert size={15} /></span>
          <span>
            <span className="block text-[12px] font-semibold text-white leading-tight">Rekomendasi: No-Go</span>
            <span className="block text-[10px] text-ld-fog leading-tight pt-0.5">1 bug high belum fix</span>
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroIllustration;
