import React from 'react';
import { ArrowLeft } from 'lucide-react';

// Shared header for member-dashboard section cards (Portfolio, Booking,
// QA Simulator, …): optional back button, optional brand icon + eyebrow
// label, display-font title with an optional badge, and a right-aligned
// actions slot. Sits flush inside an ADMIN_CARD so its bottom border spans
// the card's full width.

const ACTION_BASE =
  'inline-flex items-center gap-2 h-11 rounded-lg text-[15px] font-medium no-underline transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

/** Primary card/form action (dark). */
export const CARD_ACTION_PRIMARY = `${ACTION_BASE} px-[18px] bg-ld-midnight text-white border-none hover:bg-ld-onyx`;
/** Secondary card/form action (outline). */
export const CARD_ACTION_SECONDARY = `${ACTION_BASE} px-4 border border-ld-frost bg-white text-ld-graphite hover:bg-ld-cloud`;
/** Positive state change (e.g. confirm booking). */
export const CARD_ACTION_SUCCESS = `${ACTION_BASE} px-4 border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50`;
/** Destructive action (cancel/delete), always red. */
export const CARD_ACTION_DANGER = `${ACTION_BASE} px-4 border border-red-200 bg-white text-red-600 hover:bg-red-50`;

// Smaller buttons for actions inside list items (booking rows etc.), one
// size for every tone so rows line up.
const LIST_ACTION_BASE =
  'inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border bg-white text-sm font-medium no-underline cursor-pointer transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed';
export const LIST_ACTION_NEUTRAL = `${LIST_ACTION_BASE} border-ld-frost text-ld-graphite hover:bg-ld-cloud`;
export const LIST_ACTION_SUCCESS = `${LIST_ACTION_BASE} border-emerald-200 text-emerald-700 hover:bg-emerald-50`;
export const LIST_ACTION_DANGER = `${LIST_ACTION_BASE} border-red-200 text-red-600 hover:bg-red-50`;

export interface DashboardCardHeaderProps {
  /** Brand icon, rendered at 44px (e.g. `<QaPortfolioIcon size={44} />`). Omit for secondary/sub-section cards. */
  icon?: React.ReactNode;
  eyebrow?: string;
  title: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  /** Renders a back button before the icon (detail views, forms). */
  onBack?: () => void;
  backLabel?: string;
  /**
   * Below md, move `actions` out of the header into a bar fixed to the
   * bottom of the viewport (detail pages). The page should reserve space at
   * its bottom on mobile (e.g. `max-md:pb-24`) so content isn't covered.
   */
  stickyActionsOnMobile?: boolean;
}

const DashboardCardHeader: React.FC<DashboardCardHeaderProps> = ({ icon, eyebrow, title, badge, actions, onBack, backLabel = 'Kembali', stickyActionsOnMobile = false }) => (
  <>
  <div className="flex flex-wrap items-center gap-3.5 px-4 py-4 md:px-6 border-b border-ld-frost">
    {onBack && (
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="-ml-1.5 -mr-1.5 w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-ld-steel hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
      >
        <ArrowLeft size={18} />
      </button>
    )}
    {icon && <span className="shrink-0 flex">{icon}</span>}
    <div className="flex-1 min-w-[180px] flex flex-col gap-0.5">
      {eyebrow && <span className="text-[13px] text-ld-slate">{eyebrow}</span>}
      <span className="flex flex-wrap items-center gap-2">
        <h2 className={`m-0 font-ld-display font-semibold tracking-[-0.02em] text-ld-onyx ${icon ? 'text-xl' : 'text-lg'}`}>{title}</h2>
        {badge}
      </span>
    </div>
    {actions && <div className={`${stickyActionsOnMobile ? 'hidden md:flex' : 'flex'} flex-wrap items-center gap-2`}>{actions}</div>}
  </div>
  {actions && stickyActionsOnMobile && (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-30 flex gap-2 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-white border-t border-ld-frost shadow-[0_-8px_24px_rgba(30,27,75,0.08)] [&>*]:flex-1 [&>*]:justify-center">
      {actions}
    </div>
  )}
  </>
);

/**
 * Form footer that becomes a bar fixed to the viewport bottom below md, so
 * Save/Cancel stay reachable on long mobile forms. The form needs
 * `max-md:pb-24` so its last fields aren't covered.
 */
export const FORM_FOOTER_STICKY_MOBILE =
  'flex justify-end gap-2 pt-5 border-t border-ld-frost/60 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:m-0 max-md:px-4 max-md:pt-3 max-md:pb-[max(12px,env(safe-area-inset-bottom))] max-md:bg-white max-md:border-ld-frost max-md:shadow-[0_-8px_24px_rgba(30,27,75,0.08)] max-md:[&>*]:flex-1 max-md:[&>*]:justify-center';

export default DashboardCardHeader;
