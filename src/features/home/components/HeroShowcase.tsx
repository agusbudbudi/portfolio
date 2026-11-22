import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import TrophyIllustration from '../../qa-simulator/components/TrophyIllustration';
import { MentoringIcon, QaCourseIcon, QaPortfolioIcon, QaSimulatorIcon } from '../../../components/illustration/ProductIcons';
import CartoonAvatar from '../../../components/illustration/CartoonAvatar';
import { useConfig } from '../../../hooks/useConfig';

// Home hero art: one "QA journey" dashboard that ties the products
// together (Course → Simulator → Portfolio → Mentoring), framed by an
// achievement chip (top-left) and a mentor message (bottom-right) — the same
// stacked, non-overlapping grammar as the product-row showcases, over the
// blue pixel mosaic. Sample numbers; mentor photo/name from the live config.

const EASE = [0.4, 0, 0.2, 1] as const;
const SHADOW = 'shadow-[0_24px_50px_-16px_rgba(39,40,53,0.25)]';
const FALLBACK_PHOTO = '/personal-portfolio/img/profile/profile-agus.webp';

const rise = (delay: number, y = 18): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } },
});
const pop = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 18, delay } },
});
const grow = (delay: number, to: string): Variants => ({
  hidden: { width: '0%' },
  show: { width: to, transition: { duration: 0.9, ease: EASE, delay } },
});

interface Row {
  icon: React.FC<{ size?: number; className?: string }>;
  title: string;
  meta: string;
  progress?: { to: string; bar: string };
  badge?: { text: string; cls: string };
}

const ROWS: Row[] = [
  { icon: QaCourseIcon, title: 'QA Course · Junior QA Ready', meta: '9 / 12 lesson selesai', progress: { to: '75%', bar: 'bg-emerald-500' } },
  { icon: QaSimulatorIcon, title: 'QA Simulator · Split Bill v2', meta: 'Phase 3 / 3 · Bug Hunting', progress: { to: '92%', bar: 'bg-ld-violet' } },
  { icon: QaPortfolioIcon, title: 'Portfolio QA', meta: 'Dilihat 24× minggu ini', badge: { text: '+6', cls: 'bg-emerald-50 text-emerald-700' } },
  { icon: MentoringIcon, title: 'Mentoring 1-on-1', meta: 'Sabtu, 10.00 WIB', badge: { text: 'Terjadwal', cls: 'bg-ld-lilac text-ld-violet' } },
];

const HeroShowcase: React.FC = () => {
  const reduce = !!useReducedMotion();
  const { config } = useConfig();
  const mentor = config?.mentors[0];
  const photo = mentor?.avatar || FALLBACK_PHOTO;
  const firstName = mentor?.name.split(' ')[0] ?? 'Mentor';

  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[500px] mx-auto flex flex-col gap-6 py-4 select-none font-ld-sans"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      {/* achievement — left */}
      <motion.div variants={pop(1.9)} className={`relative w-fit origin-bottom-left flex items-center gap-2.5 rounded-xl bg-white border border-ld-frost pl-2.5 pr-4 py-2 ${SHADOW}`}>
        <TrophyIllustration className="w-12 h-10 shrink-0" />
        <span>
          <span className="block text-[11.5px] font-semibold text-ld-onyx leading-tight">Simulasi selesai!</span>
          <span className="block text-[10px] text-ld-slate leading-tight mt-0.5">Studi kasus masuk ke portfolio-mu</span>
        </span>
      </motion.div>

      {/* journey dashboard — full width */}
      <motion.div variants={rise(0.1, 28)} className={`relative rounded-2xl bg-white border border-ld-frost overflow-hidden ${SHADOW}`}>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ld-frost">
          <CartoonAvatar size={36} className="shrink-0" />
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold text-ld-onyx">Hai, Kamu 👋</span>
            <span className="block text-[10.5px] text-ld-slate">Perjalanan jadi QA Engineer</span>
          </span>
          <span className="text-right shrink-0">
            <span className="block text-[18px] font-semibold text-ld-violet tabular-nums leading-none">72%</span>
            <span className="block text-[9px] text-ld-fog mt-0.5">siap kerja</span>
          </span>
        </div>
        <div className="px-4 pt-3">
          <div className="h-1.5 rounded-full bg-ld-frost overflow-hidden">
            <motion.div variants={grow(0.5, '72%')} className="h-full rounded-full bg-gradient-to-r from-ld-lavender to-ld-violet" />
          </div>
        </div>
        <ul className="m-0 p-3 list-none space-y-2">
          {ROWS.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.li key={r.title} variants={rise(0.55 + i * 0.18, 10)} className="flex items-center gap-3 rounded-xl border border-ld-frost px-3 py-2.5">
                <Icon size={36} className="shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[11.5px] font-semibold text-ld-onyx truncate">{r.title}</span>
                  <span className="block text-[10px] text-ld-slate truncate">{r.meta}</span>
                </span>
                {r.progress && (
                  <span className="w-16 h-1.5 rounded-full bg-ld-frost overflow-hidden shrink-0">
                    <motion.span variants={grow(0.9 + i * 0.18, r.progress.to)} className={`block h-full rounded-full ${r.progress.bar}`} />
                  </span>
                )}
                {r.badge && <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-semibold shrink-0 ${r.badge.cls}`}>{r.badge.text}</span>}
              </motion.li>
            );
          })}
        </ul>
      </motion.div>

      {/* mentor message — right */}
      <motion.div variants={pop(2.3)} className="relative self-end max-w-[82%] origin-bottom-right flex items-end gap-2">
        <span>
          <span className="block mb-1 text-right text-[9.5px] text-ld-slate"><span className="font-semibold text-ld-onyx">{firstName}</span> · Mentor</span>
          <span className="block rounded-2xl rounded-br-sm bg-ld-onyx px-3.5 py-2.5 text-[11.5px] text-white/90 leading-snug shadow-[0_12px_28px_-10px_rgba(26,27,37,0.5)]">
            Bug report-mu rapi banget. Sabtu kita latihan interview, ya!
          </span>
        </span>
        <img src={photo} alt="" className="w-8 h-8 rounded-full object-cover object-top shrink-0" />
      </motion.div>
    </motion.div>
  );
};

export default HeroShowcase;
