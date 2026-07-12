// Shared card shell for every admin tab (list view) and form view — each
// screen owns its own bg-white/border/rounded card instead of relying on a
// shared padded wrapper in AdminDashboard, so a form's header can sit flush
// against the card edge without fighting outer padding.
export const ADMIN_CARD = 'bg-white rounded-xl border border-ld-frost/70 overflow-hidden';
export const ADMIN_CARD_HEADER = 'flex items-center gap-3 px-5 md:px-6 py-4 border-b border-ld-frost/60';
export const ADMIN_CARD_BODY = 'p-5 md:p-6';

// Shared "add item" button for list editors (Experience/Project/Endorsement,
// etc.) — dashed outline in the primary color rather than a filled button,
// since these sit inside an already-busy form and don't need full button
// weight like the tab-level "Tambah X" actions do.
export const ADD_ITEM_BUTTON =
  'mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-ld-violet text-xs font-medium text-ld-violet hover:bg-ld-lilac/30 cursor-pointer bg-transparent transition-colors';
