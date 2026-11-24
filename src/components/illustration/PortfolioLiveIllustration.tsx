import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { C, draw, fadeUp, pop, slide, useLoop } from './illustrationKit';
import { Bar, IllustrationFrame, Shadow } from './IllustrationParts';

// "Portfolio kamu sudah live!" art: a mini browser window rises, the URL
// types into the address bar, then the portfolio page builds itself section
// by section (profile, experience, project cards). A "Live" badge springs
// onto the window corner with a broadcast ring, and confetti bursts out.
// Idle afterwards: the window floats, the live dot pulses, confetti twinkles.
// Same flat-vector kit as the other illustrations (docs/DESIGN.md →
// Mentor.QA Adaptations); emerald is the allowed success-status exception.

const EMERALD = '#10b981';
const EMERALD_DEEP = '#059669';

// Confetti: [x, y, burst-from dx, dy, shape, color]
const CONFETTI: [number, number, number, number, 'dot' | 'bar', string][] = [
  [24, 46, 22, 14, 'bar', C.blue],
  [18, 92, 26, 0, 'dot', C.wash],
  [28, 128, 18, -16, 'bar', C.wash],
  [200, 58, -20, 10, 'dot', C.blue],
  [204, 104, -24, 0, 'bar', C.blue],
  [192, 138, -16, -14, 'dot', C.wash],
  [110, 10, 0, 16, 'dot', C.wash],
];

interface Props {
  className?: string;
  /** The learner's photo for the avatar; falls back to a drawn avatar. */
  photoUrl?: string;
}

const PortfolioLiveIllustration: React.FC<Props> = ({ className, photoUrl }) => {
  const loop = useLoop();
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const avatarClip = `pl-avatar-${uid}`;
  const shadowId = `pl-sh-${uid}`;

  return (
    <IllustrationFrame className={className}>
      <defs>
        <Shadow id={shadowId} />
        <clipPath id={avatarClip}><circle cx="62" cy="64" r="11" /></clipPath>
      </defs>

      <motion.circle variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }} cx="110" cy="82" r="66" fill={C.whisper} />

      {/* browser window: rises in, then floats */}
      <motion.g
        variants={{
          hidden: { opacity: 0, y: 26 },
          show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.05 } },
        }}
      >
        <motion.g {...loop({ y: [0, -2, 0] }, 4, 2.4)}>
          <g filter={`url(#${shadowId})`}>
            <rect x="34" y="24" width="152" height="118" rx="12" fill={C.white} stroke={C.ash} />
          </g>

          {/* chrome: dots + address bar with the URL typing in */}
          <path d="M34 36 a12 12 0 0 1 12 -12 h128 a12 12 0 0 1 12 12 v4 h-152 z" fill={C.frost} />
          <circle cx="45" cy="32" r="2.2" fill={C.ash} />
          <circle cx="52" cy="32" r="2.2" fill={C.ash} />
          <circle cx="59" cy="32" r="2.2" fill={C.ash} />
          <rect x="70" y="27.5" width="82" height="9" rx="4.5" fill={C.white} />
          <motion.path
            variants={draw(0.4, 0.25)}
            d="M75.5 31 v-1 a1.8 1.8 0 0 1 3.6 0 v1 M74.8 31 h5 v3.3 h-5 z"
            stroke={C.graphite} strokeWidth="1" strokeLinejoin="round"
          />
          <Bar delay={0.5} x="83" y="30.5" width="48" height="3" rx="1.5" fill={C.steel} />

          {/* profile header */}
          <motion.circle variants={pop(0.75)} style={{ originX: 0.5, originY: 0.5 }} cx="62" cy="64" r="13" fill={C.wash} />
          <motion.g variants={pop(0.8)} style={{ originX: 0.5, originY: 0.5 }}>
            {photoUrl ? (
              <image href={photoUrl} x="51" y="53" width="22" height="22" clipPath={`url(#${avatarClip})`} preserveAspectRatio="xMidYMid slice" />
            ) : (
              <g clipPath={`url(#${avatarClip})`}>
                <circle cx="62" cy="61" r="4.6" fill={C.blue} />
                <path d="M53 76 a9 7.5 0 0 1 18 0 z" fill={C.blue} />
              </g>
            )}
          </motion.g>
          <Bar delay={0.9} x="82" y="57" width="58" height="5" rx="2.5" fill={C.graphite} />
          <Bar delay={0.97} x="82" y="66" width="40" height="3.5" rx="1.75" fill={C.ash} />
          <motion.g variants={pop(1.05)} style={{ originX: 0, originY: 0.5 }}>
            <rect x="126" y="64.5" width="30" height="7" rx="3.5" fill={C.whisper} />
            <rect x="130" y="67.2" width="22" height="1.8" rx="0.9" fill={C.blue} />
          </motion.g>

          {/* experience rows */}
          <Bar delay={1.15} x="50" y="86" width="26" height="3.5" rx="1.75" fill={C.blue} />
          <motion.g variants={fadeUp(1.2)}>
            <rect x="50" y="93" width="7" height="7" rx="2" fill={C.frost} />
            <rect x="61" y="94" width="44" height="2.6" rx="1.3" fill={C.graphite} opacity="0.55" />
            <rect x="61" y="98.2" width="30" height="2" rx="1" fill={C.frost} />
          </motion.g>
          <motion.g variants={fadeUp(1.28)}>
            <rect x="114" y="93" width="7" height="7" rx="2" fill={C.frost} />
            <rect x="125" y="94" width="40" height="2.6" rx="1.3" fill={C.graphite} opacity="0.55" />
            <rect x="125" y="98.2" width="26" height="2" rx="1" fill={C.frost} />
          </motion.g>

          {/* project cards */}
          {[50, 90, 130].map((x, i) => (
            <motion.g key={x} variants={slide(0, 10, 1.38 + i * 0.09)}>
              <rect x={x} y="108" width="36" height="26" rx="5" fill={C.white} stroke={C.frost} />
              <path d={`M${x} 113 a5 5 0 0 1 5 -5 h26 a5 5 0 0 1 5 5 v4 h-36 z`} fill={i === 1 ? C.wash : C.whisper} />
              <rect x={x + 4} y="122" width="22" height="2.4" rx="1.2" fill={C.graphite} opacity="0.5" />
              <rect x={x + 4} y="127" width="15" height="2" rx="1" fill={C.frost} />
            </motion.g>
          ))}
        </motion.g>
      </motion.g>

      {/* broadcast ring from the live dot */}
      {!reduce && (
        <motion.circle
          cx="176" cy="22" r="8" fill="none" stroke={EMERALD} strokeWidth="1.8"
          style={{ originX: 0.5, originY: 0.5 }}
          variants={{
            hidden: { scale: 0.6, opacity: 0 },
            show: {
              scale: [0.6, 2.6], opacity: [0.55, 0],
              transition: { duration: 1.4, delay: 1.95, repeat: Infinity, repeatDelay: 1.2, ease: 'easeOut' },
            },
          }}
        />
      )}

      {/* "Live" badge on the window corner */}
      <motion.g
        variants={{
          hidden: { scale: 0, rotate: -12, opacity: 0 },
          show: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 14, delay: 1.7 } },
        }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <rect x="158" y="13" width="44" height="18" rx="9" fill={C.white} />
        <rect x="160" y="15" width="40" height="14" rx="7" fill={EMERALD} />
        <motion.circle
          cx="168" cy="22" r="2.4" fill={C.white}
          style={{ originX: 0.5, originY: 0.5 }}
          {...loop({ scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }, 1.3, 2.2)}
        />
        <text x="174" y="25.2" fontSize="8.5" fontWeight="700" fill={C.white} fontFamily="Inter, ui-sans-serif, system-ui, sans-serif" letterSpacing="0.3">
          Live
        </text>
        <rect x="160" y="15" width="40" height="14" rx="7" fill="none" stroke={EMERALD_DEEP} strokeOpacity="0.25" />
      </motion.g>

      {/* confetti burst, then twinkle */}
      {CONFETTI.map(([x, y, dx, dy, shape, color], i) => (
        <motion.g
          key={i}
          variants={{
            hidden: { x: dx, y: dy, scale: 0, opacity: 0 },
            show: { x: 0, y: 0, scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 170, damping: 13, delay: 1.8 + (i % 3) * 0.05 } },
          }}
        >
          <motion.g {...loop({ opacity: [1, 0.4, 1] }, 1.8, 2.6 + i * 0.2)}>
            {shape === 'dot'
              ? <circle cx={x} cy={y} r="3" fill={color} />
              : <rect x={x - 4} y={y - 1.6} width="8" height="3.2" rx="1.6" fill={color} transform={`rotate(${i * 35} ${x} ${y})`} />}
          </motion.g>
        </motion.g>
      ))}
    </IllustrationFrame>
  );
};

export default PortfolioLiveIllustration;
