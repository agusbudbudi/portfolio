import { useReducedMotion, type TargetAndTransition, type Variants } from 'framer-motion';

// Shared palette + motion presets for the landing's animated flat-vector
// illustrations (PhaseIllustration, ProblemIllustration). Palette is
// docs/DESIGN.md; motion is an entrance sequence driven by the parent svg's
// `hidden` → `show` variants, plus subtle idle loops.

export const C = {
  blue: '#3b9eff',
  wash: '#c9e4ff',
  whisper: '#e3f2ff',
  white: '#ffffff',
  frost: '#eceff3',
  ash: '#cdd2d9',
  steel: '#818898',
  graphite: '#36394a',
};

const EASE = [0.4, 0, 0.2, 1] as const;

export const fadeUp = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE, delay } },
});
export const grow = (delay: number): Variants => ({
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.45, ease: EASE, delay } },
});
export const pop = (delay: number): Variants => ({
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 420, damping: 16, delay } },
});
export const draw = (delay: number, duration = 0.35): Variants => ({
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration, ease: 'easeOut', delay } },
});
export const slide = (x: number, y: number, delay: number): Variants => ({
  hidden: { x, y, opacity: 0 },
  show: { x: 0, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 180, damping: 18, delay } },
});

/** Idle loop props; empty under prefers-reduced-motion. */
export const useLoop = () => {
  const reduce = useReducedMotion();
  return (animate: TargetAndTransition, duration: number, delay = 0, ease: 'easeInOut' | 'linear' = 'easeInOut') =>
    reduce ? {} : { animate, transition: { duration, delay, repeat: Infinity, ease } };
};
