import React, { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type Variants } from 'framer-motion';
import { Download } from 'lucide-react';

// Scaled-down replica of the real case-study document
// (/qa-simulator/splitbill/portfolio, PortfolioDocument.tsx): brand bar,
// title + overall score, author, meta strip, "… ditulis" stat tiles, then a
// peek at chapter 01 fading out. Plays once when scrolled into view (rise in,
// numbers count up); the only idle loop is the Download PDF arrow nudging.
// Decorative (aria-hidden); the section copy carries the meaning.

const EASE = [0.4, 0, 0.2, 1] as const;

const rise = (delay: number, y = 12): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } },
});
const popIn = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.7 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 20, delay } },
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

// Same labels and order as the real document (SplitBill project config).
const META = [
  { label: 'Peran', value: 'QA Engineer' },
  { label: 'Produk', value: 'SplitBill' },
  { label: 'Domain', value: 'Fintech / Consumer App' },
  { label: 'Level', value: 'Pemula · ±4 jam' },
];

const STATS = [
  { label: 'Gap', count: 8 },
  { label: 'Scenario', count: 12 },
  { label: 'Test case', count: 10 },
  { label: 'Bug', count: 6 },
];

const GAPS = [
  { loc: 'US-03 Biaya tambahan', kind: 'Ambiguitas', q: 'Pajak dihitung sebelum atau sesudah diskon?' },
  { loc: 'US-04 Pembagian', kind: 'Edge case', q: 'Sisa pembulatan Rp1 dibebankan ke siapa?' },
  { loc: 'Contoh perhitungan', kind: 'Kontradiksi', q: 'Total di contoh beda dengan rumus di AC-2.' },
];

const TEAM = ['rani-prameswari', 'dimas-arya', 'sari-wulandari'];

const PortfolioIllustration: React.FC = () => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="relative select-none font-ld-sans"
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
    >
      {/* page 2 peeking behind */}
      <motion.div
        variants={{
          hidden: { opacity: 0, rotate: 0, y: 12 },
          show: { opacity: 1, rotate: 2.5, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.25 } },
        }}
        className="absolute inset-x-8 -bottom-3 top-6 rounded-lg bg-white/70 border border-ld-frost"
      />

      <motion.div
        variants={rise(0, 24)}
        className="relative rounded-lg bg-white border border-ld-frost shadow-[0_24px_60px_rgba(59,158,255,0.16)] px-5 sm:px-8 pt-5 sm:pt-6 pb-0 overflow-hidden"
      >
        {/* brand bar */}
        <motion.div variants={rise(0.2, 4)} className="flex items-center justify-between gap-3 pb-3 border-b border-ld-frost">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-ld-slate">
            <img src="/shared/img/mentor-logo-96.webp" alt="" width={14} height={14} className="w-3.5 h-3.5 object-contain" />
            Mentor.QA · QA Simulator
          </span>
          <span className="font-ld-mono text-[9px] uppercase tracking-[0.18em] text-ld-violet">QA Case Study</span>
        </motion.div>

        {/* title + overall score */}
        <div className="pt-5 flex items-start justify-between gap-4">
          <motion.div variants={rise(0.3, 6)} className="min-w-0">
            <p className="m-0 text-lg sm:text-[22px] font-semibold text-ld-onyx tracking-[-0.02em] leading-[1.15]">
              Split Bill v2: Biaya Tambahan &amp; Metode Pembagian
            </p>
            <p className="m-0 mt-2 text-[11px] text-ld-slate leading-relaxed line-clamp-2">
              Kamu baru bergabung sebagai QA di tim SplitBill. Sprint ini tim merilis fitur pembagian proporsional dengan pajak, service charge, dan diskon.
            </p>
          </motion.div>
          <motion.div variants={popIn(0.55)} className="text-right shrink-0">
            <p className="m-0 text-3xl font-semibold text-ld-violet tabular-nums leading-none">
              <CountUp to={86} delay={0.7} duration={1.2} suffix="%" />
            </p>
            <p className="m-0 mt-1 text-[9px] text-ld-steel whitespace-nowrap">Skor self-assessment</p>
          </motion.div>
        </div>

        {/* author */}
        <motion.div variants={rise(0.45, 6)} className="mt-4 flex items-center gap-2">
          <motion.span
            variants={popIn(0.5)}
            className="w-7 h-7 rounded-full bg-ld-violet text-white text-[11px] font-semibold flex items-center justify-center"
          >
            N
          </motion.span>
          <span className="text-[11px] leading-tight">
            <span className="block font-semibold text-ld-onyx">Nama Kamu</span>
            <span className="text-ld-steel">QA Engineer · Squad SplitBill</span>
          </span>
          <span className="ml-auto flex -space-x-1.5">
            {TEAM.map((id) => (
              <img key={id} src={`/qa-simulator/team/${id}.webp`} alt="" width={20} height={20} loading="lazy" className="w-5 h-5 rounded-full object-cover ring-2 ring-white bg-ld-cloud" />
            ))}
          </span>
        </motion.div>

        {/* meta strip */}
        <motion.dl variants={rise(0.6, 6)} className="m-0 mt-4 grid grid-cols-2 sm:grid-cols-4 border-y border-ld-frost">
          {META.map((m, i) => (
            <div key={m.label} className={`py-2 pr-2 ${i > 0 ? 'sm:pl-3 sm:border-l sm:border-ld-frost' : ''}`}>
              <dt className="text-[8px] font-semibold uppercase tracking-widest text-ld-fog">{m.label}</dt>
              <dd className="m-0 mt-0.5 text-[10px] font-medium text-ld-graphite truncate">{m.value}</dd>
            </div>
          ))}
        </motion.dl>

        {/* stat tiles */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {STATS.map((s, i) => (
            <motion.div key={s.label} variants={rise(0.8 + i * 0.1, 8)} className="rounded-md border border-ld-frost px-2.5 py-2">
              <p className="m-0 text-lg font-semibold text-ld-onyx tabular-nums leading-none">
                <CountUp to={s.count} delay={0.85 + i * 0.1} duration={0.9} />
              </p>
              <p className="m-0 mt-1 text-[9px] text-ld-steel truncate">{s.label} ditulis</p>
            </motion.div>
          ))}
        </div>

        {/* chapter 01 peek */}
        <motion.div variants={rise(1.25, 10)} className="mt-6">
          <div className="flex items-start justify-between gap-3 pb-2.5 mb-3 border-b border-ld-onyx">
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="text-2xl font-semibold text-ld-violet/40 leading-none tabular-nums">01</span>
              <div className="min-w-0">
                <p className="m-0 text-sm font-semibold text-ld-onyx leading-tight">Requirement Analysis</p>
                <p className="m-0 mt-0.5 text-[10px] text-ld-slate truncate">Pahami PRD, temukan gap, ambiguitas, dan edge case sebelum satu baris kode ditulis.</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="m-0 text-sm font-semibold text-ld-onyx tabular-nums leading-none">
                <CountUp to={90} delay={1.35} duration={0.8} suffix="%" />
              </p>
              <p className="m-0 mt-0.5 text-[8px] text-ld-fog">Skor phase</p>
            </div>
          </div>

          <p className="m-0 mb-2 text-[11px] font-semibold text-ld-onyx">
            <span className="text-ld-fog font-normal mr-1">1.1</span> Temukan gap &amp; tulis pertanyaan klarifikasi
          </p>
          <table className="w-full text-[10px] border-collapse table-fixed">
            <thead>
              <tr className="text-left border-b-2 border-ld-graphite">
                <th className="py-1.5 pr-2 font-semibold text-ld-onyx w-6">#</th>
                <th className="py-1.5 pr-2 font-semibold text-ld-onyx w-[30%]">Lokasi di PRD</th>
                <th className="py-1.5 pr-2 font-semibold text-ld-onyx w-[22%] hidden sm:table-cell">Jenis</th>
                <th className="py-1.5 pr-2 font-semibold text-ld-onyx">Pertanyaan untuk PM</th>
              </tr>
            </thead>
            <tbody>
              {GAPS.map((g, i) => (
                <motion.tr key={g.loc} variants={rise(1.45 + i * 0.12, 4)} className="border-b border-ld-frost align-top">
                  <td className="py-2 pr-2 text-ld-fog font-ld-mono text-[9px]">{String(i + 1).padStart(2, '0')}</td>
                  <td className="py-2 pr-2 text-ld-graphite">{g.loc}</td>
                  <td className="py-2 pr-2 text-ld-graphite hidden sm:table-cell">{g.kind}</td>
                  <td className="py-2 pr-2 text-ld-graphite leading-snug">{g.q}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* page continues: fade out */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/85 to-transparent" />
        <div className="h-8" />
      </motion.div>

      {/* Download PDF chip, same action as the real page toolbar */}
      <motion.div
        variants={popIn(2.0)}
        className="absolute -bottom-4 right-4 sm:right-8 inline-flex items-center gap-1.5 rounded-lg bg-ld-violet text-white px-3 py-2 text-xs font-medium shadow-[0_10px_24px_rgba(59,158,255,0.35)]"
      >
        <motion.span
          className="flex"
          {...(reduce ? {} : { animate: { y: [0, 2.5, 0] }, transition: { duration: 1.2, delay: 2.6, repeat: Infinity, ease: 'easeInOut' } })}
        >
          <Download size={13} />
        </motion.span>
        Download PDF
      </motion.div>
    </motion.div>
  );
};

export default PortfolioIllustration;
