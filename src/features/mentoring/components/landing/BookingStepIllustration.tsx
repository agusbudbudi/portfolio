import React from 'react';
import { motion } from 'framer-motion';
import { C, draw, fadeUp, pop, slide, useLoop } from '../../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame, Shadow } from '../../../../components/illustration/IllustrationParts';

// Animated art for the mentoring "3 Langkah Mudah" booking steps:
// pick topic & schedule → fill the booking form → WhatsApp confirmation.
// Same flat-vector kit and no-panel + Whisper-circle treatment as the
// /portfolio step art (docs/DESIGN.md → Mentor.QA Adaptations).

const Blob: React.FC = () => (
  <motion.circle variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }} cx="110" cy="84" r="60" fill={C.whisper} />
);

// ── 1. Pick topic & schedule: topics get selected, a day + time are picked ──
const Schedule: React.FC = () => {
  const loop = useLoop();
  const topics = [
    { x: 42, w: 44, on: true },
    { x: 92, w: 36, on: false },
    { x: 134, w: 44, on: true },
  ];
  const days = [46, 72, 98, 124, 150];
  const picked = 2;
  return (
    <>
      <defs><Shadow id="sh-m1" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-m1)">
          <rect x="32" y="30" width="156" height="104" rx="12" fill={C.white} stroke={C.ash} />
        </g>
      </motion.g>
      {topics.map((t, i) => (
        <motion.g key={t.x} variants={pop(0.3 + i * 0.12)} style={{ originX: 0.5, originY: 0.5 }}>
          <rect x={t.x} y="40" width={t.w} height="14" rx="7" fill={t.on ? C.blue : C.white} stroke={t.on ? C.blue : C.ash} />
          <rect x={t.x + 8} y="45" width={t.w - 16} height="4" rx="2" fill={t.on ? C.white : C.steel} />
        </motion.g>
      ))}
      <Bar delay={0.55} x="42" y="64" width="40" height="3.5" rx="1.75" fill={C.steel} />
      {days.map((x, i) => (
        <motion.g key={x} variants={fadeUp(0.6 + i * 0.05)}>
          <rect x={x - 10} y="72" width="20" height="26" rx="6" fill={i === picked ? 'transparent' : '#f6f8fa'} />
          <rect x={x - 5} y="77" width="10" height="3" rx="1.5" fill={C.ash} />
          <rect x={x - 4} y="85" width="8" height="6" rx="2" fill={C.frost} />
        </motion.g>
      ))}
      <motion.g variants={pop(1.0)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.rect
          x={days[picked] - 12} y="70" width="24" height="30" rx="7" fill={C.blue} opacity="0.25"
          style={{ originX: 0.5, originY: 0.5 }}
          {...loop({ scale: [1, 1.18, 1], opacity: [0.3, 0, 0.3] }, 1.8, 1.6)}
        />
        <rect x={days[picked] - 10} y="72" width="20" height="26" rx="6" fill={C.blue} />
        <rect x={days[picked] - 5} y="77" width="10" height="3" rx="1.5" fill={C.wash} />
        <rect x={days[picked] - 4} y="85" width="8" height="6" rx="2" fill={C.white} />
      </motion.g>
      {[44, 84, 124].map((x, i) => (
        <motion.g key={x} variants={pop(1.3 + i * 0.1)} style={{ originX: 0.5, originY: 0.5 }}>
          <rect x={x} y="108" width="34" height="14" rx="5" fill={i === 1 ? C.graphite : C.white} stroke={i === 1 ? C.graphite : C.ash} />
          <rect x={x + 8} y="113" width="18" height="4" rx="2" fill={i === 1 ? C.white : C.ash} />
        </motion.g>
      ))}
    </>
  );
};

// ── 2. Booking form: intro gets typed, char bar fills + ticks, submit pressed ──
const Form: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-m2" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-m2)">
          <rect x="44" y="24" width="132" height="120" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <rect x="56" y="36" width="40" height="4" rx="2" fill={C.steel} />
        <rect x="56" y="46" width="108" height="50" rx="7" fill={C.white} stroke={C.blue} strokeWidth="1.5" />
      </motion.g>
      {/* intro typed line by line */}
      {[[56, 0.4], [64, 0.7], [72, 1.0], [80, 1.3]].map(([y, d], i) => (
        <Bar key={y} delay={d} x="63" y={y} width={[86, 78, 90, 46][i]} height="3.5" rx="1.75" fill={C.graphite} opacity="0.6" />
      ))}
      <motion.rect variants={fadeUp(1.5)} x="111" y="78" width="1.5" height="8" fill={C.blue} {...loop({ opacity: [1, 0, 1] }, 1, 1.8)} />
      {/* character progress */}
      <motion.g variants={fadeUp(0.3)}>
        <rect x="56" y="104" width="86" height="5" rx="2.5" fill={C.frost} />
      </motion.g>
      <Bar delay={0.45} x="56" y="104" width="86" height="5" rx="2.5" fill={C.blue} />
      <motion.g variants={pop(1.5)} style={{ originX: 0.5, originY: 0.5 }}>
        <circle cx="156" cy="106.5" r="7" fill={C.blue} />
        <motion.path variants={draw(1.65, 0.25)} d="M153 106.5 l2.2 2.2 l4 -4.4" stroke={C.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      {/* submit */}
      <motion.g variants={pop(1.7)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...loop({ scale: [1, 1, 0.94, 1] }, 2.6, 2.2)} style={{ originX: 0.5, originY: 0.5 }}>
          <rect x="56" y="118" width="108" height="16" rx="8" fill={C.blue} />
          <rect x="92" y="124" width="36" height="4" rx="2" fill={C.white} />
        </motion.g>
      </motion.g>
    </>
  );
};

// ── 3. WhatsApp: booking sent, ticks turn blue, mentor types then confirms ──
const Whatsapp: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-m3" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-m3)">
          <rect x="66" y="18" width="88" height="132" rx="16" fill={C.graphite} />
        </g>
        <rect x="71" y="23" width="78" height="122" rx="12" fill="#f6f8fa" />
        <rect x="71" y="23" width="78" height="20" rx="12" fill={C.white} />
        <rect x="71" y="35" width="78" height="8" fill={C.white} />
        <circle cx="82" cy="33" r="5" fill={C.wash} />
        <rect x="91" y="30" width="30" height="3.5" rx="1.75" fill={C.graphite} opacity="0.8" />
        <rect x="91" y="36" width="18" height="2.5" rx="1.25" fill={C.steel} />
        <rect x="100" y="20" width="20" height="3" rx="1.5" fill="#1a1b25" />
      </motion.g>
      {/* outgoing booking message */}
      <motion.g variants={slide(16, 0, 0.5)}>
        <rect x="96" y="52" width="48" height="26" rx="8" fill={C.blue} />
        <rect x="101" y="57" width="36" height="3" rx="1.5" fill={C.white} />
        <rect x="101" y="63" width="28" height="3" rx="1.5" fill={C.wash} />
        <motion.g
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.8 } } }}
        >
          <motion.path
            variants={{ hidden: { stroke: C.wash }, show: { stroke: C.white, transition: { delay: 1.3, duration: 0.3 } } }}
            d="M128 72 l1.6 1.6 l3 -3.2 M131.5 72 l1.6 1.6 l3 -3.2"
            strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
        </motion.g>
      </motion.g>
      {/* typing → reply */}
      <motion.g
        variants={{ hidden: { opacity: 0 }, show: { opacity: [0, 1, 1, 0], transition: { delay: 1.3, duration: 1.1, times: [0, 0.15, 0.8, 1] } } }}
      >
        <rect x="76" y="86" width="30" height="14" rx="7" fill={C.white} />
        {[84, 91, 98].map((cx, i) => (
          <motion.circle key={cx} cx={cx} cy="93" r="2" fill={C.steel} {...loop({ y: [0, -2, 0] }, 0.6, i * 0.12)} />
        ))}
      </motion.g>
      <motion.g variants={slide(-16, 0, 2.4)}>
        <rect x="76" y="86" width="56" height="30" rx="8" fill={C.white} />
        <rect x="81" y="92" width="40" height="3" rx="1.5" fill={C.graphite} opacity="0.75" />
        <rect x="81" y="98" width="30" height="3" rx="1.5" fill={C.steel} />
        <rect x="81" y="106" width="22" height="5" rx="2.5" fill={C.whisper} />
      </motion.g>
      <motion.g variants={pop(2.8)} style={{ originX: 0.5, originY: 0.5 }}>
        <circle cx="134" cy="88" r="7" fill={C.blue} stroke={C.white} strokeWidth="2" />
        <motion.path variants={draw(2.95, 0.25)} d="M131 88 l2.2 2.2 l4 -4.4" stroke={C.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </>
  );
};

export type BookingStepIllustrationName = 'schedule' | 'form' | 'whatsapp';

const ART: Record<BookingStepIllustrationName, React.FC> = { schedule: Schedule, form: Form, whatsapp: Whatsapp };

const BookingStepIllustration: React.FC<{ name: BookingStepIllustrationName; className?: string }> = ({ name, className }) => {
  const Art = ART[name];
  return <IllustrationFrame className={className}><Art /></IllustrationFrame>;
};

export default BookingStepIllustration;
