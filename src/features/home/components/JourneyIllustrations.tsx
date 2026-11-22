import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Looping mini illustrations for the home "Alur belajar" steps. Same palette
// and rules as the mentoring StatsIllustration set (80×80 viewBox, lilac
// disc, motion off under prefers-reduced-motion). Transform origins use
// fractions (0–1) because framer resolves SVG origins against each
// element's own box.

const VIOLET = '#3b9eff';
const LAVENDER = '#c9e4ff';
const LILAC = '#e3f2ff';
const ONYX = '#1a1b25';

const Svg: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
    <circle cx="40" cy="40" r="36" fill={LILAC} />
    {children}
  </svg>
);

/** 01 Mulai — a course card: lessons tick off in order while the progress
 *  bar fills, then the graduation cap perched on the card hops. */
export const CourseIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  const rows = [{ y: 31, w: 20 }, { y: 40, w: 15 }, { y: 49, w: 18 }];
  const tick = (i: number) => ({
    duration: 4, times: [0, 0.1, 0.85, 1], repeat: Infinity, delay: 0.3 + i * 0.45,
  });
  return (
    <Svg className={className}>
      <rect x="16" y="20" width="46" height="46" rx="6" fill="#fff" stroke={LAVENDER} />
      {rows.map((r, i) => (
        <g key={i}>
          <motion.circle
            cx="25" cy={r.y} r="3.8"
            initial={{ fill: still ? '#10b981' : LILAC }}
            animate={still ? undefined : { fill: [LILAC, '#10b981', '#10b981', LILAC] }}
            transition={tick(i)}
          />
          <motion.path
            d={`M23.2 ${r.y}l1.3 1.3 2.4-2.6`} fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
            initial={{ opacity: still ? 1 : 0 }}
            animate={still ? undefined : { opacity: [0, 1, 1, 0] }}
            transition={tick(i)}
          />
          <rect x="32" y={r.y - 1.3} width={r.w} height="2.6" rx="1.3" fill={i === 0 ? ONYX : LAVENDER} />
        </g>
      ))}
      <rect x="22" y="57" width="34" height="3" rx="1.5" fill={LILAC} />
      <motion.rect
        x="22" y="57" height="3" rx="1.5" fill={VIOLET}
        initial={{ width: still ? 34 : 0 }}
        animate={still ? undefined : { width: [0, 34, 34, 0] }}
        transition={{ duration: 4, times: [0, 0.45, 0.85, 1], repeat: Infinity, delay: 0.3 }}
      />
      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        animate={still ? undefined : { y: [0, 0, -4, 0, 0], rotate: [0, 0, -8, 0, 0] }}
        transition={{ duration: 4, times: [0, 0.48, 0.56, 0.64, 1], repeat: Infinity, delay: 0.3 }}
      >
        <path d="M60 10L46 17l14 7 14-7z" fill={ONYX} />
        <path d="M53 20.5v4.5c0 1.6 3.1 3 7 3s7-1.4 7-3v-4.5L60 24z" fill={VIOLET} />
        <path d="M72 18v7" stroke={ONYX} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="72" cy="26.5" r="2" fill={VIOLET} />
      </motion.g>
    </Svg>
  );
};

/** 02 Belajar — open book whose text lines write themselves in. */
export const LearnIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  const lines = [
    { x: 18, y: 32, w: 16 }, { x: 18, y: 38, w: 13 }, { x: 18, y: 44, w: 15 },
    { x: 45, y: 32, w: 16 }, { x: 45, y: 38, w: 12 }, { x: 45, y: 44, w: 14 },
  ];
  return (
    <Svg className={className}>
      <path d="M12 24c8-3 18-3 28 2v32c-10-5-20-5-28-2z" fill="#fff" stroke={LAVENDER} />
      <path d="M68 24c-8-3-18-3-28 2v32c10-5 20-5 28-2z" fill="#fff" stroke={LAVENDER} />
      <path d="M40 26v32" stroke={LAVENDER} strokeWidth="1.5" />
      {lines.map((l, i) => (
        <motion.rect
          key={i} x={l.x} y={l.y} height="2.4" rx="1.2" fill={i % 3 === 0 ? VIOLET : LAVENDER}
          initial={{ width: still ? l.w : 0 }}
          animate={still ? undefined : { width: [0, l.w, l.w, 0] }}
          transition={{ duration: 4, times: [0, 0.15, 0.85, 1], repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
      <motion.path
        d="M56 18h7v14l-3.5-2.5L56 32z" fill={ONYX}
        animate={still ? undefined : { y: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </Svg>
  );
};

/** 03 Praktik — a magnifier scans an app screen and a bug pops up on a row. */
export const PracticeIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  return (
    <Svg className={className}>
      <rect x="24" y="14" width="32" height="52" rx="6" fill={ONYX} />
      <rect x="27" y="19" width="26" height="42" rx="3" fill="#fff" />
      {[24, 33, 42, 51].map((y, i) => (
        <g key={y}>
          <rect x="30" y={y} width="20" height="6" rx="1.5" fill={i === 2 ? '#fee2e2' : LILAC} />
          <rect x="32" y={y + 2} width={i % 2 ? 9 : 12} height="2" rx="1" fill={i === 2 ? '#f87171' : LAVENDER} />
        </g>
      ))}
      <motion.g
        animate={still ? undefined : { x: [0, 0, -2, 0], y: [-16, 2, 2, -16] }}
        transition={{ duration: 4, times: [0, 0.35, 0.8, 1], repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="54" cy="44" r="7.5" fill="#fff" fillOpacity="0.6" stroke={VIOLET} strokeWidth="3" />
        <path d="M59.5 49.5l6 6" stroke={VIOLET} strokeWidth="3.5" strokeLinecap="round" />
      </motion.g>
      <motion.g
        style={{ originX: 0.5, originY: 0.5 }}
        initial={{ scale: still ? 1 : 0 }}
        animate={still ? undefined : { scale: [0, 0, 1.3, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.38, 0.46, 0.52, 0.8, 0.9], repeat: Infinity }}
      >
        <circle cx="20" cy="45" r="7" fill="#ef4444" stroke="#fff" strokeWidth="2" />
        <path d="M17 45h6M20 42v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" transform="rotate(45 20 45)" />
      </motion.g>
    </Svg>
  );
};

/** 04 Tunjukkan — portfolio card whose tiles fill in, then a check. */
export const ShowcaseIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  const tiles = [{ x: 20 }, { x: 34 }, { x: 48 }];
  return (
    <Svg className={className}>
      <rect x="14" y="18" width="52" height="44" rx="6" fill="#fff" stroke={LAVENDER} />
      <circle cx="25" cy="29" r="5.5" fill="#fbbf24" />
      <rect x="34" y="25" width="20" height="3" rx="1.5" fill={ONYX} />
      <rect x="34" y="31" width="13" height="2.4" rx="1.2" fill={LAVENDER} />
      {tiles.map((t, i) => (
        <motion.rect
          key={i} x={t.x} y="42" width="12" height="12" rx="2.5"
          style={{ originX: 0.5, originY: 0.5 }}
          initial={{ fill: still ? VIOLET : LILAC }}
          animate={still ? undefined : { fill: [LILAC, VIOLET, VIOLET, LILAC], scale: [1, 1.12, 1, 1] }}
          transition={{ duration: 4, times: [0, 0.12, 0.85, 1], repeat: Infinity, delay: i * 0.35 }}
        />
      ))}
      <motion.g
        style={{ originX: 0.5, originY: 0.5 }}
        initial={{ scale: still ? 1 : 0 }}
        animate={still ? undefined : { scale: [0, 0, 1.3, 0.9, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.45, 0.53, 0.58, 0.63, 0.85, 0.95], repeat: Infinity }}
      >
        <circle cx="62" cy="20" r="8" fill="#10b981" stroke="#fff" strokeWidth="2" />
        <path d="M58.5 20l2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </Svg>
  );
};

/** 05 Dibimbing — mentee and mentor trading chat bubbles. */
export const GuidedIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  const pop = (delay: number, originX: number) =>
    still
      ? {}
      : {
          style: { originX, originY: 1 },
          initial: { scale: 0, opacity: 0 },
          animate: { scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] },
          transition: { duration: 3.2, times: [0, 0.12, 0.85, 1], repeat: Infinity, delay, repeatDelay: 0.4 },
        };
  return (
    <Svg className={className}>
      <circle cx="24" cy="50" r="7" fill={VIOLET} />
      <path d="M12 68a12 10 0 0 1 24 0z" fill={VIOLET} />
      <circle cx="56" cy="50" r="7" fill={ONYX} />
      <path d="M44 68a12 10 0 0 1 24 0z" fill={ONYX} />
      <motion.g {...pop(0, 0.25)}>
        <rect x="10" y="18" width="26" height="15" rx="7" fill="#fff" stroke={LAVENDER} />
        <circle cx="17" cy="25.5" r="1.6" fill={VIOLET} /><circle cx="23" cy="25.5" r="1.6" fill={VIOLET} /><circle cx="29" cy="25.5" r="1.6" fill={VIOLET} />
      </motion.g>
      <motion.g {...pop(1.6, 0.75)}>
        <rect x="44" y="18" width="26" height="15" rx="7" fill={VIOLET} />
        <rect x="49" y="23" width="16" height="2" rx="1" fill="#fff" />
        <rect x="49" y="27" width="10" height="2" rx="1" fill="#fff" opacity="0.7" />
      </motion.g>
    </Svg>
  );
};
