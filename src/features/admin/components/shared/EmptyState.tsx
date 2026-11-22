import React from 'react';

// Shared empty state for dashboard cards: small illustration, display-font
// title, short description. No CTA on purpose — the card header already
// carries the primary action.

interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ illustration, title, description }) => (
  <div className="flex flex-col items-center text-center py-2 md:py-4">
    <div className="w-full max-w-[140px] [&>svg]:w-full [&>svg]:h-auto">{illustration}</div>
    <p className="m-0 mt-3 font-ld-display text-base font-semibold tracking-[-0.01em] text-ld-onyx">{title}</p>
    <p className="m-0 mt-1 text-sm text-ld-slate max-w-sm">{description}</p>
  </div>
);

export default EmptyState;
