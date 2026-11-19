import React from 'react';
import { motion } from 'framer-motion';
import { C, draw, fadeUp, pop, useLoop } from '../../../../components/illustration/illustrationKit';
import { IllustrationFrame, Shadow } from '../../../../components/illustration/IllustrationParts';

// Animated art for the mentoring "Lebih dari Sekadar Belajar" benefit cards.
// Same flat-vector kit and no-panel + Whisper-circle treatment as the
// /portfolio cards (docs/DESIGN.md → Mentor.QA Adaptations); each card has
// its own composition: video call, kanban, calendar, growth chart.

const Blob: React.FC = () => (
  <motion.circle variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }} cx="110" cy="84" r="60" fill={C.whisper} />
);

const Avatar: React.FC<{ cx: number; cy: number; r: number; tone: string; bg: string }> = ({ cx, cy, r, tone, bg }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={bg} />
    <circle cx={cx} cy={cy - r * 0.25} r={r * 0.36} fill={tone} />
    <path d={`M${cx - r * 0.65} ${cy + r * 0.62} a${r * 0.65} ${r * 0.55} 0 0 1 ${r * 1.3} 0`} fill={tone} />
  </g>
);

// ── Fokus 1-on-1: video call, mentor speaking, a chat bubble pops ──
const OneOnOne: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-b1" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-b1)">
          <rect x="40" y="30" width="122" height="88" rx="12" fill={C.graphite} />
        </g>
        <Avatar cx={101} cy={70} r={22} tone={C.blue} bg="#4a4d63" />
      </motion.g>
      {/* speaking bars */}
      <motion.g variants={pop(0.6)} style={{ originX: 0.5, originY: 0.5 }}>
        <rect x="48" y="38" width="26" height="14" rx="7" fill="#000" opacity="0.35" />
        {[54, 60, 66].map((x, i) => (
          <motion.rect
            key={x}
            x={x} y="41" width="3" height="8" rx="1.5" fill={C.wash}
            style={{ originX: 0.5, originY: 0.5 }}
            {...loop({ scaleY: [0.4, 1, 0.5, 0.9, 0.4] }, 0.9, i * 0.15)}
          />
        ))}
      </motion.g>
      {/* self view (PiP) */}
      <motion.g variants={pop(0.45)} style={{ originX: 1, originY: 1 }}>
        <rect x="128" y="86" width="44" height="34" rx="8" fill={C.white} stroke={C.ash} />
        <Avatar cx={150} cy={103} r={11} tone={C.graphite} bg={C.wash} />
      </motion.g>
      {/* controls */}
      <motion.g variants={fadeUp(0.7)}>
        <rect x="68" y="124" width="66" height="18" rx="9" fill={C.white} stroke={C.ash} />
        <circle cx="84" cy="133" r="5" fill={C.frost} />
        <circle cx="101" cy="133" r="5" fill={C.frost} />
        <circle cx="118" cy="133" r="5" fill={C.blue} />
      </motion.g>
      {/* chat bubble */}
      <motion.g variants={pop(1.2)} style={{ originX: 1, originY: 1 }}>
        <motion.g {...loop({ y: [0, -3, 0] }, 2.4, 1.8)}>
          <path d="M150 22 h30 a8 8 0 0 1 8 8 v8 a8 8 0 0 1 -8 8 h-20 l-8 7 v-7 h-2 a8 8 0 0 1 -8 -8 v-8 a8 8 0 0 1 8 -8 z" fill={C.blue} />
          <rect x="150" y="30" width="26" height="3.5" rx="1.75" fill={C.white} />
          <rect x="150" y="37" width="16" height="3" rx="1.5" fill={C.wash} />
        </motion.g>
      </motion.g>
    </>
  );
};

// ── Real-world Cases: a ticket travels across the board into Done ──
const Cases: React.FC = () => {
  const cols = [40, 88, 136];
  return (
    <>
      <defs><Shadow id="sh-b2" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.05)}>
        <g filter="url(#sh-b2)">
          <rect x="32" y="30" width="156" height="110" rx="12" fill={C.white} stroke={C.ash} />
        </g>
      </motion.g>
      {cols.map((x, i) => (
        <motion.g key={x} variants={fadeUp(0.2 + i * 0.1)}>
          <rect x={x} y="40" width="44" height="92" rx="7" fill="#f6f8fa" />
          <rect x={x + 6} y="46" width={[18, 26, 16][i]} height="4" rx="2" fill={i === 2 ? C.blue : C.steel} />
          {i === 0 && <rect x={x + 4} y="80" width="36" height="20" rx="5" fill={C.white} stroke={C.ash} />}
          {i === 1 && <rect x={x + 4} y="56" width="36" height="20" rx="5" fill={C.white} stroke={C.ash} />}
          {i === 2 && <rect x={x + 4} y="80" width="36" height="20" rx="5" fill={C.white} stroke={C.ash} opacity="0.7" />}
        </motion.g>
      ))}
      {/* moving ticket: To Do → Done */}
      <motion.g
        variants={{
          hidden: { x: 0, y: 0, opacity: 0 },
          show: {
            x: [0, 0, 48, 96],
            y: [0, 0, -6, 0],
            opacity: [0, 1, 1, 1],
            transition: { duration: 1.6, delay: 0.6, times: [0, 0.15, 0.55, 1], ease: 'easeInOut' },
          },
        }}
      >
        <rect x="44" y="56" width="36" height="20" rx="5" fill={C.white} stroke={C.blue} strokeWidth="1.5" />
        <rect x="49" y="61" width="20" height="3.5" rx="1.75" fill={C.graphite} opacity="0.75" />
        <rect x="49" y="68" width="12" height="3" rx="1.5" fill={C.wash} />
      </motion.g>
      <motion.g variants={pop(2.25)} style={{ originX: 0.5, originY: 0.5 }}>
        <circle cx="172" cy="58" r="6" fill={C.blue} stroke={C.white} strokeWidth="2" />
        <motion.path variants={draw(2.4, 0.25)} d="M169.5 58 l1.8 1.8 l3.4 -3.6" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </>
  );
};

// ── Booking Gampang: date gets picked, time chip pops, booking confirmed ──
const Booking: React.FC = () => {
  const loop = useLoop();
  const cells = Array.from({ length: 15 }, (_, i) => ({ x: 52 + (i % 5) * 20, y: 70 + Math.floor(i / 5) * 18 }));
  const picked = 7;
  return (
    <>
      <defs><Shadow id="sh-b3" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-b3)">
          <rect x="40" y="30" width="112" height="112" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <path d="M40 42 a12 12 0 0 1 12 -12 h88 a12 12 0 0 1 12 12 v14 h-112 z" fill={C.blue} />
        <rect x="64" y="24" width="5" height="12" rx="2.5" fill={C.graphite} />
        <rect x="123" y="24" width="5" height="12" rx="2.5" fill={C.graphite} />
        <rect x="74" y="41" width="44" height="5" rx="2.5" fill={C.white} />
      </motion.g>
      {cells.map((c, i) => (
        <motion.rect
          key={i}
          variants={fadeUp(0.25 + i * 0.025)}
          x={c.x - 6} y={c.y - 4} width="12" height="8" rx="2.5"
          fill={i === picked ? 'transparent' : C.frost}
        />
      ))}
      {/* picked date */}
      <motion.g variants={pop(0.9)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.circle
          cx={cells[picked].x} cy={cells[picked].y} r="9" fill={C.blue} opacity="0.25"
          style={{ originX: 0.5, originY: 0.5 }}
          {...loop({ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }, 1.8, 1.5)}
        />
        <circle cx={cells[picked].x} cy={cells[picked].y} r="8" fill={C.blue} />
        <rect x={cells[picked].x - 3.5} y={cells[picked].y - 1.5} width="7" height="3" rx="1.5" fill={C.white} />
      </motion.g>
      {/* time chip + confirm */}
      <motion.g variants={pop(1.3)} style={{ originX: 0, originY: 0.5 }}>
        <rect x="132" y="96" width="56" height="20" rx="10" fill={C.graphite} />
        <circle cx="144" cy="106" r="5" fill="none" stroke={C.wash} strokeWidth="1.5" />
        <path d="M144 103.5 v2.5 l1.8 1.2" stroke={C.wash} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <rect x="153" y="104" width="26" height="4" rx="2" fill={C.white} />
      </motion.g>
      <motion.g variants={pop(1.7)} style={{ originX: 0.5, originY: 0.5 }}>
        <circle cx="180" cy="128" r="9" fill={C.blue} stroke={C.white} strokeWidth="2.5" />
        <motion.path variants={draw(1.85, 0.25)} d="M176 128 l2.8 2.8 l5 -5.4" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </>
  );
};

// ── Career-Oriented: trend line climbs, points pop, level chip bounces ──
const Career: React.FC = () => {
  const loop = useLoop();
  const pts: [number, number][] = [[52, 118], [80, 104], [106, 110], [134, 80], [160, 56]];
  return (
    <>
      <defs><Shadow id="sh-b4" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-b4)">
          <rect x="36" y="34" width="144" height="106" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        {[60, 84, 108].map((y) => (
          <line key={y} x1="46" x2="170" y1={y} y2={y} stroke={C.frost} strokeDasharray="3 3" />
        ))}
        <line x1="46" x2="170" y1="128" y2="128" stroke={C.ash} />
      </motion.g>
      {[52, 80, 106, 134, 160].map((x, i) => (
        <motion.rect
          key={x}
          variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.45, delay: 0.3 + i * 0.08 } } }}
          style={{ originX: 0.5, originY: 1 }}
          x={x - 7} y={pts[i][1] + 6} width="14" height={128 - pts[i][1] - 6} rx="3"
          fill={i === 4 ? C.wash : C.whisper}
        />
      ))}
      <motion.path
        variants={draw(0.7, 1.0)}
        d={`M${pts.map((p) => p.join(' ')).join(' L')} L167 49.5`}
        stroke={C.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      />
      {pts.map(([x, y], i) => (
        <motion.circle key={x} variants={pop(0.8 + i * 0.18)} style={{ originX: 0.5, originY: 0.5 }} cx={x} cy={y} r="3.5" fill={C.white} stroke={C.blue} strokeWidth="2" />
      ))}
      {/* arrowhead past the last point, aligned with the final segment */}
      <motion.path variants={pop(1.7)} style={{ originX: 0.5, originY: 0.5 }} d="M173 44 L169.6 53 L163.6 46.4 Z" fill={C.blue} strokeLinejoin="round" />
      {/* level up chip */}
      <motion.g variants={pop(1.9)} style={{ originX: 0, originY: 1 }}>
        <motion.g {...loop({ y: [0, -4, 0] }, 1.8, 2.3)}>
          <rect x="46" y="22" width="62" height="22" rx="11" fill={C.graphite} />
          <path d="M58 37 v-8 M54.5 32 l3.5 -3.5 l3.5 3.5" stroke={C.wash} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="68" y="29" width="32" height="4" rx="2" fill={C.white} />
          <rect x="68" y="36" width="20" height="3" rx="1.5" fill={C.steel} />
        </motion.g>
      </motion.g>
    </>
  );
};

export type BenefitIllustrationName = 'oneOnOne' | 'cases' | 'booking' | 'career';

const ART: Record<BenefitIllustrationName, React.FC> = { oneOnOne: OneOnOne, cases: Cases, booking: Booking, career: Career };

const BenefitIllustration: React.FC<{ name: BenefitIllustrationName; className?: string }> = ({ name, className }) => {
  const Art = ART[name];
  return <IllustrationFrame className={className}><Art /></IllustrationFrame>;
};

export default BenefitIllustration;
