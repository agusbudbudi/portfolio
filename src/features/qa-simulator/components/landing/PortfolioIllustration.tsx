import React, { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type Variants } from 'framer-motion';
import { Check, Download } from 'lucide-react';

// Animated mock of the auto-generated QA case-study document. Plays once when
// scrolled into view, telling "it assembles itself": sheet rises → header
// fills → score ring draws and counts up → stats count up → phase bars grow →
// PDF chip lands, ready to send. Only idle loop: the download arrow nudging.
// Decorative (aria-hidden); the section copy carries the meaning.

const EASE = [0.4, 0, 0.2, 1] as const;

const rise = (delay: number, y = 16): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});
const popIn = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 18, delay } },
});
const growX = (delay: number): Variants => ({
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.7, ease: EASE, delay } },
});

const CountUp: React.FC<{ to: number; delay: number; duration?: number; suffix?: string }> = ({ to, delay, duration = 1.1, suffix = '' }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(mv, to, { duration, delay, ease: 'easeOut' });
    return () => controls.stop();
  }, [inView, reduce, mv, to, delay, duration]);

  return <motion.span ref={ref}>{text}</motion.span>;
};

const STATS = [
  { value: 14, label: 'Pertanyaan' },
  { value: 22, label: 'Test case' },
  { value: 6, label: 'Bug report' },
];

const PHASES: [string, number][] = [
  ['Requirement Analysis', 90],
  ['Test Case Design', 84],
  ['Bug Reporting', 83],
];

const SCORE = 86;
const R = 27;
const CIRC = 2 * Math.PI * R;

const PortfolioIllustration: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="relative select-none"
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {/* sheet behind */}
      <motion.div
        variants={{
          hidden: { opacity: 0, rotate: 0, y: 12 },
          show: { opacity: 1, rotate: 2.5, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.25 } },
        }}
        className="absolute inset-x-8 -bottom-3 top-6 rounded-2xl bg-white/70 border border-ld-frost"
      />

      <motion.div
        variants={rise(0, 24)}
        className="relative rounded-2xl bg-white border border-ld-frost/70 shadow-[0_24px_60px_rgba(59,158,255,0.16)] p-6 sm:p-7"
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-ld-frost">
          <div className="min-w-0">
            <motion.p variants={rise(0.3, 6)} className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-ld-steel">
              QA Case Study · SplitBill
            </motion.p>
            <motion.p variants={rise(0.4, 6)} className="m-0 mt-2 text-xl font-semibold text-ld-onyx leading-snug">
              Split Bill v2: Biaya Tambahan &amp; Metode Pembagian
            </motion.p>
            <motion.div variants={rise(0.5, 6)} className="mt-3 flex items-center gap-2">
              <motion.span
                variants={popIn(0.55)}
                className="w-7 h-7 rounded-full bg-ld-violet text-white text-[10px] font-semibold flex items-center justify-center"
              >
                KM
              </motion.span>
              <span className="text-xs leading-tight">
                <span className="block font-semibold text-ld-graphite">Nama Kamu</span>
                <span className="text-ld-steel">QA Engineer · Squad SplitBill</span>
              </span>
            </motion.div>
          </div>

          {/* score ring */}
          <motion.div variants={popIn(0.6)} className="shrink-0 flex flex-col items-center">
            <div className="relative w-[76px] h-[76px]">
              <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r={R} strokeWidth="5" className="stroke-ld-frost" fill="none" />
                <motion.circle
                  cx="32" cy="32" r={R} strokeWidth="5" strokeLinecap="round" className="stroke-ld-violet" fill="none"
                  strokeDasharray={CIRC}
                  variants={{
                    hidden: { strokeDashoffset: CIRC },
                    show: { strokeDashoffset: CIRC * (1 - SCORE / 100), transition: { duration: 1.2, ease: 'easeOut', delay: 0.75 } },
                  }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative text-xl font-semibold text-ld-onyx tabular-nums leading-none">
                  <CountUp to={SCORE} delay={0.75} duration={1.2} />
                  <span className="absolute left-full top-0 ml-px text-[10px] font-semibold text-ld-steel">%</span>
                </span>
              </span>
            </div>
            <span className="mt-1.5 text-[10px] text-ld-steel whitespace-nowrap">Skor self-assessment</span>
          </motion.div>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 border-b border-ld-frost">
          {STATS.map((s, i) => (
            <motion.div key={s.label} variants={rise(0.9 + i * 0.12, 8)} className="py-4 text-center">
              <p className="m-0 text-xl font-semibold text-ld-onyx leading-none tabular-nums">
                <CountUp to={s.value} delay={0.95 + i * 0.12} duration={0.9} />
              </p>
              <p className="m-0 mt-1 text-[10px] text-ld-steel">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* phase bars */}
        <div className="pt-5 space-y-2.5">
          {PHASES.map(([label, pct], i) => (
            <motion.div key={label} variants={rise(1.2 + i * 0.1, 6)}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="font-medium text-ld-graphite">{label}</span>
                <span className="text-ld-steel tabular-nums"><CountUp to={pct} delay={1.3 + i * 0.1} duration={0.7} suffix="%" /></span>
              </div>
              <div className="h-1.5 rounded-full bg-ld-frost overflow-hidden">
                <motion.div
                  variants={growX(1.3 + i * 0.1)}
                  style={{ width: `${pct}%`, originX: 0 }}
                  className="h-full rounded-full bg-ld-violet"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* PDF ready */}
        <motion.div variants={popIn(2.0)} style={{ originX: 0 }} className="mt-5 flex items-center gap-2 rounded-lg bg-ld-cloud px-3 py-2.5">
          <motion.span
            className="text-ld-violet flex"
            {...(reduce ? {} : { animate: { y: [0, 2.5, 0] }, transition: { duration: 1.2, delay: 2.6, repeat: Infinity, ease: 'easeInOut' } })}
          >
            <Download size={14} />
          </motion.span>
          <span className="text-xs font-medium text-ld-graphite truncate">studi-kasus-qa-splitbill.pdf</span>
          <motion.span
            variants={popIn(2.3)}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 shrink-0"
          >
            <Check size={10} strokeWidth={3} /> Siap dikirim
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PortfolioIllustration;
