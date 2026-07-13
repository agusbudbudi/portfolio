import React from 'react';

// Shared dot+line+card shell for the Experience/Education timelines.
// Content (badges, expand behavior, field layout) differs enough between
// the two that it stays in each section — only this structural wrapper
// is byte-identical between them (see docs/ASSESSMENT_public_portfolio_page_split.md Phase 3).
const TimelineRail: React.FC<{
  isCurrent: boolean;
  isLast: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ isCurrent, isLast, onClick, children }) => (
  <div className="flex gap-4 relative">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full z-10 mt-6 ${isCurrent ? 'bg-ld-violet' : 'bg-ld-ash border-2 border-ld-canvas'}`} />
      {!isLast && <div className="flex-grow w-0.5 bg-ld-frost my-1" />}
    </div>

    <div
      className={`flex-grow bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-6 mb-6 relative overflow-hidden hover:shadow-ld-subtle-3 transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  </div>
);

export default TimelineRail;
