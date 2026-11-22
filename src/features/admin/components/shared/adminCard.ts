// Shared card shell for every admin tab (list view) and form view — each
// screen owns its own bg-white/border/rounded card instead of relying on a
// shared padded wrapper in AdminDashboard, so a form's header can sit flush
// against the card edge without fighting outer padding.
export const ADMIN_CARD = 'bg-white rounded-xl border border-ld-frost/70 overflow-hidden shadow-[0_4px_18px_rgba(30,27,75,0.035)]';
export const ADMIN_CARD_HEADER = 'flex items-center gap-3 px-4 md:px-6 py-4 border-b border-ld-frost/60';
export const ADMIN_CARD_BODY = 'p-4 md:p-6';

// Admin-variant form footer + buttons (MentorForm, PortfolioForm). The member
// variant uses FORM_FOOTER_STICKY_MOBILE / CARD_ACTION_* instead.
export const ADMIN_FORM_FOOTER = 'flex justify-end gap-2 pt-5 border-t border-ld-frost/60';
export const ADMIN_BTN_SECONDARY =
  'px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite cursor-pointer';
export const ADMIN_BTN_PRIMARY =
  'px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed';

// Shared "add item" button for list editors (Experience/Project/Endorsement,
// etc.) — dashed outline in the primary color rather than a filled button,
// since these sit inside an already-busy form and don't need full button
// weight like the tab-level "Tambah X" actions do.
export const ADD_ITEM_BUTTON =
  'mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-ld-violet text-xs font-medium text-ld-violet hover:bg-ld-lilac/30 cursor-pointer bg-transparent transition-colors';
