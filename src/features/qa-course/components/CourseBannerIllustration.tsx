import React from 'react';
import { motion } from 'framer-motion';
import { C, draw, fadeUp, pop, useLoop } from '../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame } from '../../../components/illustration/IllustrationParts';

// Dashboard banner art for QA Course: Materi → Kurikulum → Portfolio as three
// white mini-cards on the blue banner, linked by flowing dashed arrows. Same
// flat-vector kit and rhythm as SimulatorBannerIllustration; plays once, with
// light idle loops (none under reduced motion).

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

const CourseBannerIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const loop = useLoop();
  const flow = (delay: number) => loop({ strokeDashoffset: [0, -12] }, 0.9, delay, 'linear');

  return (
    <IllustrationFrame className={className}>
      {/* 1 · Materi: an open book over text lines */}
      <Card x={6} y={44} delay={0}>
        <motion.g variants={pop(0.25)} style={{ originX: 0.5, originY: 0.5 }}>
          <path d="M35 58 c-3 -2.2 -7 -2.8 -11 -2 v15 c4 -0.8 8 -0.2 11 2 c3 -2.2 7 -2.8 11 -2 v-15 c-4 -0.8 -8 -0.2 -11 2 z" fill={C.whisper} stroke={C.graphite} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M35 58 v15" stroke={C.graphite} strokeWidth="1.4" />
          <path d="M39 52.5 h4.5 v7 l-2.25 -1.6 l-2.25 1.6 z" fill={C.blue} />
        </motion.g>
        <Bar delay={0.4} x="14" y="82" width="40" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.45} x="14" y="90" width="32" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.5} x="14" y="98" width="24" height="3.5" rx="1.75" fill={C.blue} opacity="0.55" />
      </Card>

      {/* 2 · Kurikulum: lessons ticking off one by one */}
      <Card x={81} y={30} delay={0.25}>
        <rect x="81" y="30" width="58" height="13" rx="10" fill={C.frost} />
        <rect x="81" y="36" width="58" height="7" fill={C.frost} />
        <Bar delay={0.45} x="89" y="34.5" width="26" height="4" rx="2" fill={C.steel} />
        {[54, 68, 82].map((y, i) => (
          <g key={y}>
            <Check cx={92} cy={y} delay={0.9 + i * 0.3} />
            <Bar delay={0.5 + i * 0.08} x="100" y={y - 3} width="30" height="3.5" rx="1.75" fill={C.graphite} opacity="0.7" />
            <Bar delay={0.55 + i * 0.08} x="100" y={y + 2} width="20" height="3" rx="1.5" fill={C.frost} />
          </g>
        ))}
        <rect x="89" y="93" width="42" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={1.8} x="89" y="93" width="42" height="3.5" rx="1.75" fill={C.blue} />
      </Card>

      {/* 3 · Portfolio: profile card earning a graduation cap */}
      <Card x={156} y={44} delay={0.5}>
        <circle cx="173" cy="62" r="7" fill={C.blue} />
        <Bar delay={0.7} x="184" y="57" width="22" height="4" rx="2" fill={C.graphite} opacity="0.7" />
        <Bar delay={0.75} x="184" y="65" width="14" height="3" rx="1.5" fill={C.frost} />
        <Bar delay={0.8} x="164" y="80" width="42" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.85} x="164" y="88" width="34" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.9} x="164" y="96" width="24" height="3.5" rx="1.75" fill={C.whisper} />
        <motion.g variants={pop(1.6)} style={{ originX: 0.5, originY: 1 }}>
          <motion.g {...loop({ y: [0, -2, 0] }, 2.2, 2.2)}>
            <path d="M200 34 l14 6 l-14 6 l-14 -6 z" fill={C.graphite} />
            <path d="M193 43 v5 c0 2 3.2 3.5 7 3.5 s7 -1.5 7 -3.5 v-5 l-7 3 z" fill={C.blue} />
            <path d="M212 41 v7" stroke={C.graphite} strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="212" cy="49" r="1.6" fill={C.blue} />
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

export default CourseBannerIllustration;
