import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { C, draw, pop, useLoop } from '../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame, Shadow } from '../../../components/illustration/IllustrationParts';

// "Tugas terkirim!" art for the self-assessment popup: the assignment sheet
// rises and fills, a dashed "sent" trail draws, a check badge springs in with
// a one-off ring pulse, and confetti bursts out. Plays once when the popup
// opens; afterwards only the confetti twinkles. Same flat-vector kit as the
// other illustrations (docs/DESIGN.md → Mentor.QA Adaptations).

// Confetti: [x, y, burst-from dx, dy, shape, color]
const CONFETTI: [number, number, number, number, 'dot' | 'bar', string][] = [
  [178, 58, -22, 26, 'dot', C.blue],
  [192, 84, -36, 0, 'bar', C.wash],
  [184, 112, -28, -26, 'dot', C.wash],
  [150, 120, 6, -34, 'bar', C.blue],
  [128, 64, 22, 22, 'dot', C.wash],
  [160, 44, -4, 42, 'bar', C.blue],
];

const SubmittedIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const loop = useLoop();
  const reduce = useReducedMotion();

  return (
    <IllustrationFrame className={className}>
      <defs><Shadow id="sh-sub" /></defs>
      <motion.circle variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }} cx="110" cy="84" r="62" fill={C.whisper} />

      {/* sent trail */}
      <motion.path
        variants={draw(0.55, 0.6)}
        d="M58 132 C 40 120, 40 96, 56 84"
        stroke={C.ash} strokeWidth="1.8" strokeDasharray="3 4" strokeLinecap="round"
      />

      {/* assignment sheet */}
      <motion.g
        variants={{
          hidden: { opacity: 0, y: 24, rotate: 0 },
          show: { opacity: 1, y: 0, rotate: -4, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 } },
        }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <g filter="url(#sh-sub)">
          <rect x="62" y="28" width="92" height="112" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <rect x="74" y="40" width="36" height="5" rx="2.5" fill={C.blue} />
        <Bar delay={0.35} x="74" y="54" width="66" height="4" rx="2" fill={C.graphite} opacity="0.6" />
        <Bar delay={0.42} x="74" y="64" width="54" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.49} x="74" y="73" width="62" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.56} x="74" y="88" width="48" height="4" rx="2" fill={C.graphite} opacity="0.6" />
        <Bar delay={0.63} x="74" y="98" width="58" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.7} x="74" y="107" width="40" height="3.5" rx="1.75" fill={C.frost} />
      </motion.g>

      {/* ring pulse (once) */}
      {!reduce && (
        <motion.circle
          cx="152" cy="112" r="20" fill="none" stroke={C.blue} strokeWidth="2"
          style={{ originX: 0.5, originY: 0.5 }}
          variants={{
            hidden: { scale: 0.6, opacity: 0 },
            show: { scale: [0.6, 1.9], opacity: [0.6, 0], transition: { duration: 0.8, delay: 1.05, ease: 'easeOut' } },
          }}
        />
      )}

      {/* check badge */}
      <motion.g
        variants={{
          hidden: { scale: 0, rotate: -30, opacity: 0 },
          show: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 13, delay: 0.9 } },
        }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <circle cx="152" cy="112" r="22" fill={C.white} />
        <circle cx="152" cy="112" r="18" fill={C.blue} />
        <motion.path
          variants={draw(1.15, 0.35)}
          d="M143.5 112.5 l6 6 l11 -12"
          stroke={C.white} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
        />
      </motion.g>

      {/* confetti burst, then twinkle */}
      {CONFETTI.map(([x, y, dx, dy, shape, color], i) => (
        <motion.g
          key={i}
          variants={{
            hidden: { x: dx, y: dy, scale: 0, opacity: 0 },
            show: { x: 0, y: 0, scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 170, damping: 13, delay: 1.15 + (i % 3) * 0.05 } },
          }}
        >
          <motion.g {...loop({ opacity: [1, 0.4, 1] }, 1.8, 2 + i * 0.2)}>
            {shape === 'dot'
              ? <circle cx={x} cy={y} r="3" fill={color} />
              : <rect x={x - 4} y={y - 1.6} width="8" height="3.2" rx="1.6" fill={color} transform={`rotate(${i * 35} ${x} ${y})`} />}
          </motion.g>
        </motion.g>
      ))}
    </IllustrationFrame>
  );
};

export default SubmittedIllustration;
