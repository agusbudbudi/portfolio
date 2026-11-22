import React from 'react';
import type { ProgramCatalogEntry } from '../../../types/onboarding';

// Free = brand blue tint; paid = neutral (not red) so it doesn't read as a
// blocker (PRD Section 8). #1f6fc4 instead of brand #3b9eff for 4.5:1 text
// contrast on the light tint.
const PriceBadge: React.FC<{ program: ProgramCatalogEntry; className?: string }> = ({ program, className = '' }) => {
  const paid = program.pricing.model === 'paid';
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        paid ? 'bg-ld-frost text-ld-graphite' : 'bg-ld-lilac text-[#1f6fc4]'
      } ${className}`}
    >
      {program.pricing.label}
    </span>
  );
};

export default PriceBadge;
