import React from 'react';
import { motion } from 'framer-motion';
import { C, draw, fadeUp, pop, useLoop } from '../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame } from '../../../components/illustration/IllustrationParts';

// Dashboard banner art: the simulator's flow PRD → Test case → Bug as three
// white mini-cards on the blue banner, linked by flowing dashed arrows. Same
// flat-vector kit as the landing illustrations; plays once, light idle loops.

const Card: React.FC<{ x: number; y: number; delay: number; children: React.ReactNode }> = ({ x, y, delay, children }) => (
  <motion.g variants={fadeUp(delay)}>
    <rect x={x} y={y + 3} width="58" height="72" rx="10" fill="#1a4f9c" opacity="0.18" />
    <rect x={x} y={y} width="58" height="72" rx="10" fill={C.white} />
    {children}
  </motion.g>
);

const Check: React.FC<{ cx: number; cy: number; delay: number }> = ({ cx, cy, delay }) => (
  <g>
    <motion.circle variants={pop(delay)} cx={cx} cy={cy} r="4.5" fill={C.blue} />
    <motion.path variants={draw(delay + 0.15, 0.25)} d={`M${cx - 2} ${cy} l1.4 1.4 l2.8 -2.8`} stroke={C.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const SimulatorBannerIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const loop = useLoop();
  const flow = (delay: number) => loop({ strokeDashoffset: [0, -12] }, 0.9, delay, 'linear');

  return (
    <IllustrationFrame className={className}>
      {/* 1 · PRD */}
      <Card x={6} y={44} delay={0}>
        <Bar delay={0.2} x="14" y="54" width="26" height="5" rx="2.5" fill={C.blue} />
        <Bar delay={0.25} x="14" y="66" width="40" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.3} x="14" y="74" width="34" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.35} x="12" y="81" width="44" height="9" rx="3" fill={C.whisper} />
        <Bar delay={0.4} x="14" y="84" width="30" height="3.5" rx="1.75" fill={C.blue} opacity="0.55" />
        <Bar delay={0.45} x="14" y="96" width="38" height="3.5" rx="1.75" fill={C.frost} />
        <motion.g variants={pop(0.7)} style={{ originX: 0, originY: 1 }}>
          <motion.g {...loop({ y: [0, -2, 0] }, 2.2, 1.2)}>
            <path d="M46 34 h16 a6 6 0 0 1 6 6 v6 a6 6 0 0 1 -6 6 h-10 l-5 4 v-4 h-1 a6 6 0 0 1 -6 -6 v-6 a6 6 0 0 1 6 -6 z" fill={C.graphite} />
            <text x="54" y="48.5" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11" fill={C.white}>?</text>
          </motion.g>
        </motion.g>
      </Card>

      {/* 2 · Test case */}
      <Card x={81} y={30} delay={0.25}>
        <rect x="81" y="30" width="58" height="13" rx="10" fill={C.frost} />
        <rect x="81" y="36" width="58" height="7" fill={C.frost} />
        <Bar delay={0.45} x="89" y="34.5" width="22" height="4" rx="2" fill={C.steel} />
        {[54, 68, 82].map((y, i) => (
          <g key={y}>
            <Check cx={92} cy={y} delay={0.9 + i * 0.3} />
            <Bar delay={0.5 + i * 0.08} x="100" y={y - 3} width="30" height="3.5" rx="1.75" fill={C.graphite} opacity="0.7" />
            <Bar delay={0.55 + i * 0.08} x="100" y={y + 2} width="22" height="3" rx="1.5" fill={C.frost} />
          </g>
        ))}
        <circle cx="92" cy="94" r="4" stroke={C.ash} strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
        <Bar delay={0.7} x="100" y="92.5" width="24" height="3" rx="1.5" fill={C.ash} />
      </Card>

      {/* 3 · Bug */}
      <Card x={156} y={44} delay={0.5}>
        <Bar delay={0.7} x="164" y="54" width="30" height="4" rx="2" fill={C.graphite} opacity="0.7" />
        <Bar delay={0.75} x="164" y="62" width="20" height="3" rx="1.5" fill={C.frost} />
        <motion.g variants={pop(1.6)} style={{ originX: 0.5, originY: 0.5 }}>
          <motion.rect
            {...flow(0)}
            x="167" y="70" width="36" height="34" rx="7" fill="none" stroke={C.blue} strokeWidth="1.5" strokeDasharray="4 3"
          />
          <motion.g {...loop({ rotate: [-6, 6, -6] }, 1.2, 2)} style={{ originX: 0.5, originY: 0.5 }}>
            <path d="M178 81 h-4 M178 87 h-4 M178 93 h-4 M192 81 h4 M192 87 h4 M192 93 h4" stroke={C.graphite} strokeWidth="1.6" strokeLinecap="round" />
            <ellipse cx="185" cy="77.5" rx="4" ry="3" fill={C.graphite} />
            <ellipse cx="185" cy="87" rx="7" ry="9" fill={C.blue} />
            <line x1="185" y1="79" x2="185" y2="96" stroke={C.graphite} strokeWidth="1.3" />
          </motion.g>
        </motion.g>
      </Card>

      {/* flowing connectors */}
      <motion.g variants={fadeUp(0.6)}>
        <motion.path {...flow(0)} d="M66 74 C 72 74, 74 66, 80 66" stroke={C.white} strokeWidth="1.8" strokeDasharray="3 3" strokeLinecap="round" />
        <motion.path {...flow(0.3)} d="M140 66 C 146 66, 148 74, 155 74" stroke={C.white} strokeWidth="1.8" strokeDasharray="3 3" strokeLinecap="round" />
      </motion.g>
    </IllustrationFrame>
  );
};

export default SimulatorBannerIllustration;
