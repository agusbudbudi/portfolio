import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Smooth expand/collapse for workspace sections (brief, materi, mobile PRD):
// animates height 0 ↔ auto with a short fade, instead of content popping in.
// Padding lives on the inner div so the measured height includes it.
// Instant under prefers-reduced-motion.
const Collapse: React.FC<{ open: boolean; className?: string; children: React.ReactNode }> = ({ open, className = '', children }) => {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="collapse"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={reduce ? { duration: 0 } : { height: { duration: 0.32, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.22 } }}
          style={{ overflow: 'hidden' }}
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Collapse;
