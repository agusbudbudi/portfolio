import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { CalendarCheck, Check, MessageSquareText } from 'lucide-react';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import CartoonAvatar from '../../../../components/illustration/CartoonAvatar';

// Hero composition for the mentoring homepage: a live 1-on-1 session told in
// ~3.5s. Booking confirmed → call window opens (mentor speaking) → session
// agenda ticks off → mentor's feedback note lands. Follows the QA Simulator
// hero rules (docs/DESIGN.md → Mentor.QA Adaptations): blue pixel mosaic,
// one main surface, max two floating cards that stay still after entering.
// Decorative only (aria-hidden); the hero copy carries the meaning.

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

const AGENDA = ['Review CV QA', 'Latihan test case', 'Mock interview'];

const MentoringHeroIllustration: React.FC = () => {
  const reduce = !!useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[500px] mx-auto aspect-[1/0.92] select-none"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      <PixelMosaic variant="blue" className="absolute -top-6 -right-4 sm:-right-10" style={{ width: 'min(60%, 290px)' }} />

      {/* Call window */}
      <motion.div variants={rise(0.15, 28)} className={`absolute left-[6%] top-[20%] w-[82%] ${CARD} overflow-hidden`}>
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-ld-frost bg-ld-cloud">
          <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <span className="w-2 h-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[10px] font-medium text-ld-steel">Sesi mentoring · 60 menit</span>
        </div>

        <div className="p-3 sm:p-4">
          {/* video tiles */}
          <div className="grid grid-cols-[1.6fr_1fr] gap-2">
            <motion.div variants={popIn(0.45)} className="relative h-[108px] sm:h-[124px] rounded-lg bg-ld-midnight overflow-hidden flex items-center justify-center">
              <img
                src="/personal-portfolio/img/profile/profile-agus.webp"
                alt=""
                width={64}
                height={64}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white/20"
              />
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
                <span className="text-[9px] font-medium text-white">Mentor</span>
              </span>
            </motion.div>
            <motion.div variants={popIn(0.6)} className="relative h-[108px] sm:h-[124px] rounded-lg bg-ld-lilac flex items-center justify-center">
              <CartoonAvatar size={44} className="ring-2 ring-white rounded-full" />
              <span className="absolute left-2 bottom-2 rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-medium text-ld-graphite">Kamu</span>
            </motion.div>
          </div>

          {/* agenda */}
          <motion.div variants={rise(0.8, 8)} className="mt-3 rounded-lg border border-ld-frost p-2.5 sm:p-3">
            <p className="m-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ld-steel">Agenda sesi</p>
            <ul className="m-0 p-0 list-none space-y-1.5">
              {AGENDA.map((item, i) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="relative w-4 h-4 shrink-0">
                    <span className="absolute inset-0 rounded-full border border-ld-ash" />
                    <motion.span
                      variants={popIn(1.3 + i * 0.35)}
                      className="absolute inset-0 rounded-full bg-ld-violet text-white flex items-center justify-center"
                    >
                      <Check size={10} strokeWidth={3} />
                    </motion.span>
                  </span>
                  <span className="text-[11px] sm:text-xs text-ld-graphite">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Booking confirmed */}
      <motion.div variants={popIn(0.9)} style={{ originX: 0, originY: 1 }} className="absolute left-0 top-0 sm:-top-2">
        <div className={`${CARD} flex items-center gap-2.5 px-3 py-2.5`}>
          <span className="w-8 h-8 rounded-lg bg-ld-lilac text-ld-violet flex items-center justify-center shrink-0">
            <CalendarCheck size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold text-ld-graphite leading-tight">Sesi dikonfirmasi</span>
            <span className="block text-[10px] text-ld-steel leading-tight pt-0.5">Sabtu · 10.00 WIB</span>
          </span>
        </div>
      </motion.div>

      {/* Mentor feedback */}
      <motion.div variants={popIn(2.5)} style={{ originX: 1, originY: 1 }} className="absolute right-0 -bottom-6 sm:-bottom-8 w-[62%] sm:w-[56%]">
        <div className="rounded-xl bg-ld-midnight px-3.5 py-3 shadow-[0_18px_40px_-12px_rgba(39,40,53,0.45)]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-6 h-6 rounded-full bg-ld-violet text-white flex items-center justify-center shrink-0">
              <MessageSquareText size={12} />
            </span>
            <span className="text-[11px] font-semibold text-white">Catatan mentor</span>
          </div>
          <p className="m-0 text-[11px] text-ld-fog leading-snug">
            Test case-mu sudah rapi. Tambah negative case &amp; boundary, ya!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MentoringHeroIllustration;
