import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { CalendarCheck, Check } from 'lucide-react';
import { useConfig } from '../../../hooks/useConfig';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import CartoonAvatar from '../../../components/illustration/CartoonAvatar';

// Home "Mentoring 1-on-1" row art, same grammar as the other showcases: three
// stacked, non-overlapping pieces — booking confirmed (left) → live call
// window (full width) → mentor's feedback as a chat bubble (right). The call
// window mirrors the /mentoring hero. Mentor photo/name come from the live
// mentoring config. Plays once on mount (mounted when scrolled into view).

const EASE = [0.4, 0, 0.2, 1] as const;
const SHADOW = 'shadow-[0_18px_40px_-12px_rgba(39,40,53,0.2)]';
const FALLBACK_PHOTO = '/personal-portfolio/img/profile/profile-agus.webp';

const rise = (delay: number, y = 18): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});
const pop = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 18, delay } },
});

const AGENDA = ['Review CV QA', 'Latihan test case', 'Mock interview'];

const MentoringShowcase: React.FC = () => {
  const reduce = !!useReducedMotion();
  const { config } = useConfig();
  const mentor = config?.mentors[0];
  const photo = mentor?.avatar || FALLBACK_PHOTO;
  const firstName = mentor?.name.split(' ')[0] ?? 'Mentor';
  const minutes = config?.bookingRules.sessionDurationMinutes ?? 60;

  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[520px] mx-auto flex flex-col gap-7 py-6 select-none font-ld-sans"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      <PixelMosaic variant="blue" className="absolute -top-6 -right-6" style={{ width: 'min(56%, 280px)' }} />

      {/* booking confirmed — left */}
      <motion.div variants={pop(0.05)} className={`relative w-fit max-w-[78%] origin-bottom-left flex items-center gap-3 rounded-xl bg-white border border-ld-frost pl-3 pr-4 py-2.5 ${SHADOW}`}>
        <span className="relative w-9 h-9 rounded-lg bg-ld-lilac text-ld-violet flex items-center justify-center shrink-0">
          <CalendarCheck size={17} />
          <motion.span variants={pop(0.55)} className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center">
            <Check size={8} strokeWidth={4} />
          </motion.span>
        </span>
        <span className="min-w-0">
          <span className="block text-[11.5px] font-semibold text-ld-onyx leading-tight">Sesi dikonfirmasi</span>
          <span className="block mt-0.5 text-[10px] text-ld-slate leading-tight">Sabtu, 10.00 WIB · {minutes} menit</span>
        </span>
      </motion.div>

      {/* live call — full width */}
      <motion.div variants={rise(0.3, 26)} className={`relative w-full rounded-xl bg-white border border-ld-frost overflow-hidden ${SHADOW}`}>
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-ld-frost bg-ld-cloud">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[10px] font-medium text-ld-steel">Sesi mentoring · {minutes} menit</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-semibold text-red-500">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            LIVE
          </span>
        </div>
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-[1.6fr_1fr] gap-2">
            <motion.div variants={pop(0.6)} className="relative h-[112px] rounded-lg bg-ld-midnight overflow-hidden flex items-center justify-center">
              <img src={photo} alt="" className="w-14 h-14 rounded-full object-cover object-top ring-2 ring-white/20" />
              <span className="absolute left-2 bottom-2 inline-flex items-center gap-1.5 rounded-md bg-black/40 px-1.5 py-0.5">
                <span className="flex items-end gap-[2px] h-2.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-[2px] h-full rounded-full bg-ld-lavender origin-bottom"
                      {...(reduce ? {} : { animate: { scaleY: [0.35, 1, 0.5, 0.9, 0.35] }, transition: { duration: 0.9, delay: 1 + i * 0.15, repeat: Infinity } })}
                    />
                  ))}
                </span>
                <span className="text-[9px] font-medium text-white">{firstName}</span>
              </span>
            </motion.div>
            <motion.div variants={pop(0.75)} className="relative h-[112px] rounded-lg bg-ld-lilac flex items-center justify-center">
              <CartoonAvatar size={44} className="ring-2 ring-white rounded-full" />
              <span className="absolute left-2 bottom-2 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-medium text-ld-graphite">Kamu</span>
            </motion.div>
          </div>
          <div className="mt-3 rounded-lg border border-ld-frost p-2.5">
            <p className="m-0 mb-2 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ld-steel">Agenda sesi</p>
            <ul className="m-0 p-0 list-none space-y-1.5">
              {AGENDA.map((item, i) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="relative w-4 h-4 shrink-0">
                    <span className="absolute inset-0 rounded-full border border-ld-ash" />
                    <motion.span variants={pop(1.1 + i * 0.35)} className="absolute inset-0 rounded-full bg-ld-violet text-white flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </motion.span>
                  </span>
                  <span className="text-[11px] text-ld-graphite">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* mentor feedback — chat bubble, right */}
      <motion.div variants={pop(2.3)} className="relative self-end max-w-[78%] origin-bottom-right flex items-end gap-2">
        <span>
          <span className="block mb-1 text-right text-[9px] text-ld-slate">
            <span className="font-semibold text-ld-onyx">{firstName}</span> · Catatan mentor
          </span>
          <span className="block rounded-2xl rounded-br-sm bg-ld-onyx px-3 py-2 text-[11px] text-white/90 leading-snug shadow-[0_10px_24px_-10px_rgba(26,27,37,0.5)]">
            Test case-mu sudah rapi. Tambah negative case &amp; boundary, ya!
          </span>
        </span>
        <img src={photo} alt="" className="w-7 h-7 rounded-full object-cover object-top shrink-0" />
      </motion.div>
    </motion.div>
  );
};

export default MentoringShowcase;
