import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { grow } from './illustrationKit';

export const Shadow: React.FC<{ id: string }> = ({ id }) => (
  <filter id={id} x="-20%" y="-20%" width="140%" height="150%">
    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#272835" floodOpacity="0.08" />
  </filter>
);

/** Text-line placeholder that grows in from the left. */
export const Bar: React.FC<React.SVGProps<SVGRectElement> & { delay: number }> = ({ delay, ...rest }) => (
  <motion.rect variants={grow(delay)} style={{ originX: 0 }} {...(rest as object)} />
);

/** 220×160 svg that plays its children's entrance once when scrolled into view. */
export const IllustrationFrame: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 220 160"
      className={className}
      fill="none"
      aria-hidden="true"
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
    >
      {children}
    </motion.svg>
  );
};
