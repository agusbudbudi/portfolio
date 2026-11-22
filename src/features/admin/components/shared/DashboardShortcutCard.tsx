import React from 'react';
import { ArrowRight } from 'lucide-react';

// Clickable summary card on the member dashboard home (Portfolio, Booking,
// …). Same anatomy as DashboardCard — brand icon, eyebrow, display title +
// badge — then a body slot and a full-width footer CTA, so sibling cards
// line up in height and structure regardless of their state.
// Rendered as role="button" (not <button>) so the body may hold its own
// nested actions; those should call e.stopPropagation().

interface DashboardShortcutCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  ctaLabel: string;
  onOpen: () => void;
}

const DashboardShortcutCard: React.FC<DashboardShortcutCardProps> = ({ icon, eyebrow, title, badge, children, ctaLabel, onOpen }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onOpen}
    onKeyDown={(e) => {
      if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      onOpen();
    }}
    className="group flex flex-col rounded-xl border border-ld-frost/70 bg-white overflow-hidden cursor-pointer text-left shadow-[0_4px_18px_rgba(30,27,75,0.035)] transition-all duration-300 hover:shadow-md hover:border-ld-violet hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ld-violet"
  >
    <div className="flex items-center gap-3.5 px-4 pt-4 md:px-5 md:pt-5">
      <span className="shrink-0 flex">{icon}</span>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[13px] text-ld-slate">{eyebrow}</span>
        <span className="flex items-center gap-2 min-w-0">
          <span className="font-ld-display font-semibold text-lg tracking-[-0.02em] text-ld-onyx truncate group-hover:text-ld-violet transition-colors">{title}</span>
          {badge}
        </span>
      </div>
    </div>
    <div className="flex-1 px-4 py-4 md:px-5">{children}</div>
    <div className="flex items-center justify-between gap-2 px-4 py-3 md:px-5 border-t border-ld-frost text-sm font-semibold text-ld-violet">
      {ctaLabel}
      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
    </div>
  </div>
);

export default DashboardShortcutCard;
