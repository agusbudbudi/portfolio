import React from 'react';
import { motion } from 'framer-motion';
import { C, fadeUp, pop, useLoop } from '../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame } from '../../../components/illustration/IllustrationParts';

// Dashboard banner art for Mentoring: a 1:1 video-call window (mentor tile
// talking, mentee tile listening, call controls) with floating chips around
// it — an insight bubble, the scheduled session and a star rating. Same
// flat-vector kit as the other banner art, but its own composition so it
// doesn't read as the QA Simulator's card flow.

const star = (cx: number, cy: number, R = 3.6, r = 1.5) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}z`;
};

const Person: React.FC<{ cx: number; tileBottom: number; fill: string }> = ({ cx, tileBottom, fill }) => (
  <g>
    <circle cx={cx} cy={tileBottom - 30} r="8" fill={fill} />
    <path d={`M${cx - 14} ${tileBottom}a14 11 0 0 1 28 0z`} fill={fill} />
  </g>
);

const MentoringBannerIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const loop = useLoop();
  const float = (delay: number) => loop({ y: [0, -2.5, 0] }, 2.6, delay);

  return (
    <IllustrationFrame className={className}>
      {/* video-call window */}
      <motion.g variants={fadeUp(0)}>
        <rect x="30" y="37" width="160" height="96" rx="12" fill="#1a4f9c" opacity="0.18" />
        <rect x="30" y="34" width="160" height="96" rx="12" fill={C.white} />

        {/* mentor tile — talking */}
        <rect x="38" y="42" width="70" height="62" rx="8" fill={C.blue} />
        <Person cx={73} tileBottom={104} fill={C.white} />
        <g>
          {[0, 1, 2].map((i) => (
            <motion.rect
              key={i}
              x={93 + i * 4}
              y="48"
              width="2.4"
              height="8"
              rx="1.2"
              fill={C.white}
              style={{ originY: 1 }}
              {...loop({ scaleY: [0.4, 1, 0.55, 0.9, 0.4] }, 1.1, i * 0.15, 'linear')}
            />
          ))}
        </g>
        <Bar delay={0.35} x="43" y="47" width="22" height="4.5" rx="2.25" fill={C.white} opacity="0.85" />

        {/* mentee tile — listening */}
        <rect x="112" y="42" width="70" height="62" rx="8" fill={C.whisper} />
        <Person cx={147} tileBottom={104} fill={C.wash} />
        <Bar delay={0.4} x="117" y="47" width="18" height="4.5" rx="2.25" fill={C.white} />

        {/* call controls */}
        <circle cx="96" cy="117" r="6" fill={C.frost} />
        <rect x="94.6" y="113.2" width="2.8" height="5.2" rx="1.4" fill={C.steel} />
        <circle cx="110" cy="117" r="6" fill={C.frost} />
        <rect x="106.6" y="114.6" width="5.2" height="4.8" rx="1.2" fill={C.steel} />
        <path d="M112.2 116.2l1.8-1v4.6l-1.8-1z" fill={C.steel} />
        <rect x="119" y="111" width="18" height="12" rx="6" fill={C.graphite} />
        <path d="M123.5 117.6c2.8-2 6.2-2 9 0" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>

      {/* insight bubble — lightbulb with rays */}
      <motion.g variants={pop(0.6)} style={{ originX: 0.3, originY: 1 }}>
        <motion.g {...float(0.8)}>
          <path d="M10 2h26a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8h-3l-5 5.5-2-5.5H10a8 8 0 0 1-8-8V10a8 8 0 0 1 8-8z" fill={C.white} />
          <path d="M23 9.5a6.5 6.5 0 0 0-3.9 11.7c.8.6 1.3 1.5 1.3 2.5h5.2c0-1 .5-1.9 1.3-2.5A6.5 6.5 0 0 0 23 9.5z" fill={C.blue} />
          <path d="M19.8 14.6a3.4 3.4 0 0 1 2.6-2.4" stroke={C.white} strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
          <rect x="20.4" y="24.6" width="5.2" height="1.8" rx="0.9" fill={C.graphite} />
          <rect x="21.2" y="27.2" width="3.6" height="1.6" rx="0.8" fill={C.graphite} />
          <path d="M14.5 12.9L12.2 12.1M17.8 8.6L16.4 6.6M23.0 7.0L23.0 4.5M28.2 8.6L29.6 6.6M31.5 12.9L33.8 12.1" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </motion.g>
      </motion.g>

      {/* scheduled session chip */}
      <motion.g variants={pop(0.85)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...float(1.4)}>
          <rect x="160" y="13" width="52" height="22" rx="8" fill={C.white} />
          <rect x="166" y="18.5" width="11" height="11" rx="2.5" fill={C.blue} />
          <rect x="166" y="18.5" width="11" height="3.5" rx="1.5" fill={C.graphite} />
          <rect x="169" y="24" width="5" height="2.4" rx="1" fill={C.white} />
          <Bar delay={1} x="181" y="19.5" width="24" height="3.5" rx="1.75" fill={C.graphite} opacity="0.7" />
          <Bar delay={1.05} x="181" y="25.5" width="16" height="3" rx="1.5" fill={C.ash} />
        </motion.g>
      </motion.g>

      {/* star rating chip */}
      <motion.g variants={pop(1.1)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...float(2)}>
          <rect x="158" y="120" width="52" height="20" rx="10" fill={C.white} />
          {[170, 182, 194].map((cx) => (
            <path key={cx} d={star(cx, 130)} fill={C.blue} />
          ))}
          <path d={star(204, 130, 2.6, 1.1)} fill={C.ash} />
        </motion.g>
      </motion.g>
    </IllustrationFrame>
  );
};

export default MentoringBannerIllustration;
