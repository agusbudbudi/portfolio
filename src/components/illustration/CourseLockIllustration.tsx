import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { C, draw, fadeUp, pop, slide, useLoop } from './illustrationKit';
import { Bar, IllustrationFrame, Shadow } from './IllustrationParts';

// "Lanjutan artikel ini ada di course" art: the article's pages stack up,
// the lower ones dimmed (locked), a padlock drops onto them and its shackle
// snaps shut, then a graduation-cap badge pops onto the lock: the rest lives
// in the course. Idle: the lock gives a small shake now and then, a glint
// crosses its body, pixels twinkle. Same flat-vector kit as the other
// illustrations (docs/DESIGN.md → Mentor.QA Adaptations).

// Pixel squares around the scene: [x, y, size, color, twinkle delay]
const PIXELS: [number, number, number, string, number][] = [
  [26, 34, 7, C.wash, 0.2],
  [36, 24, 5, C.blue, 1.1],
  [182, 40, 6, C.wash, 0.6],
  [192, 28, 4, C.blue, 1.7],
  [190, 122, 7, C.wash, 1.3],
  [22, 118, 5, C.wash, 2.0],
];

const CourseLockIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const loop = useLoop();
  const uid = useId().replace(/:/g, '');
  const shadowId = `cl-sh-${uid}`;
  const bodyClip = `cl-body-${uid}`;

  return (
    <IllustrationFrame className={className}>
      <defs>
        <Shadow id={shadowId} />
        <clipPath id={bodyClip}><rect x="88" y="78" width="44" height="38" rx="8" /></clipPath>
      </defs>

      <motion.circle variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }} cx="110" cy="84" r="64" fill={C.whisper} />

      {PIXELS.map(([x, y, s, fill, d]) => (
        <motion.g key={`${x}-${y}`} variants={pop(0.9 + d * 0.1)} style={{ originX: 0.5, originY: 0.5 }}>
          <motion.rect x={x} y={y} width={s} height={s} rx="1" fill={fill} {...loop({ opacity: [1, 0.35, 1] }, 2.6, d)} />
        </motion.g>
      ))}

      {/* article pages: back two dimmed (locked part), front one readable */}
      <motion.g {...loop({ y: [0, -2, 0] }, 4.2, 1.6)}>
        <motion.g variants={slide(0, 14, 0.15)}>
          <rect x="70" y="40" width="96" height="100" rx="9" fill={C.frost} stroke={C.ash} />
        </motion.g>
        <motion.g variants={slide(0, 14, 0.25)}>
          <rect x="62" y="34" width="96" height="100" rx="9" fill={C.white} stroke={C.ash} opacity="0.9" />
          <rect x="74" y="98" width="58" height="4" rx="2" fill={C.frost} />
          <rect x="74" y="108" width="70" height="4" rx="2" fill={C.frost} />
          <rect x="74" y="118" width="46" height="4" rx="2" fill={C.frost} />
        </motion.g>
        <motion.g variants={slide(0, 14, 0.35)}>
          <g filter={`url(#${shadowId})`}>
            <rect x="54" y="26" width="96" height="100" rx="9" fill={C.white} stroke={C.ash} />
          </g>
          <Bar delay={0.55} x="66" y="38" width="44" height="6" rx="3" fill={C.blue} />
          <Bar delay={0.62} x="66" y="52" width="72" height="4" rx="2" fill={C.ash} />
          <Bar delay={0.68} x="66" y="61" width="64" height="4" rx="2" fill={C.ash} />
          {/* the fade where the preview ends */}
          <rect x="66" y="70" width="56" height="4" rx="2" fill={C.ash} opacity="0.45" />
          <rect x="66" y="79" width="40" height="4" rx="2" fill={C.ash} opacity="0.2" />
        </motion.g>
      </motion.g>

      {/* padlock: drops in, shackle snaps shut, then an occasional shake */}
      <motion.g
        variants={{
          hidden: { opacity: 0, y: -30 },
          show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 14, delay: 0.75 } },
        }}
      >
        <motion.g
          style={{ originX: '110px', originY: '64px' }}
          {...loop({ rotate: [0, 0, -7, 6, -4, 2, 0] }, 4.5, 2.2)}
        >
          <motion.path
            d="M98 80 V68 a12 12 0 0 1 24 0 V80"
            stroke={C.graphite}
            strokeWidth="6"
            strokeLinecap="round"
            variants={{
              hidden: { y: -8 },
              show: { y: 0, transition: { type: 'spring', stiffness: 500, damping: 12, delay: 1.1 } },
            }}
          />
          <g filter={`url(#${shadowId})`}>
            <rect x="88" y="78" width="44" height="38" rx="8" fill={C.blue} />
          </g>
          {/* glint sweeping across the body */}
          <g clipPath={`url(#${bodyClip})`}>
            <motion.rect
              x="70" y="70" width="10" height="56" fill={C.white} opacity="0.35"
              style={{ skewX: -18 }}
              {...loop({ x: [0, 0, 80] }, 3.6, 2.6, 'linear')}
            />
          </g>
          <motion.path variants={draw(1.25, 0.3)} d="M110 92 v8" stroke={C.white} strokeWidth="4" strokeLinecap="round" />
          <motion.circle variants={pop(1.2)} style={{ originX: 0.5, originY: 0.5 }} cx="110" cy="91" r="4.5" fill={C.white} />
        </motion.g>
      </motion.g>

      {/* graduation cap badge: the way in is the course */}
      <motion.g variants={pop(1.5)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...loop({ y: [0, -3, 0] }, 2.8, 2)}>
          <circle cx="142" cy="112" r="15" fill={C.white} stroke={C.wash} strokeWidth="2" />
          <path d="M142 104 l11 5 -11 5 -11 -5 z" fill={C.graphite} />
          <path d="M135 112 v4.5 c3.5 2.6 10.5 2.6 14 0 V112" stroke={C.graphite} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M153 109 v6" stroke={C.blue} strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      </motion.g>

      <motion.g variants={fadeUp(1.7)}>
        <rect x="84" y="140" width="52" height="6" rx="3" fill={C.wash} opacity="0.6" />
      </motion.g>
    </IllustrationFrame>
  );
};

export default CourseLockIllustration;
