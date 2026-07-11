// Shared card shell for every admin tab (list view) and form view — each
// screen owns its own bg-white/border/rounded card instead of relying on a
// shared padded wrapper in AdminDashboard, so a form's header can sit flush
// against the card edge without fighting outer padding.
export const ADMIN_CARD = 'bg-white rounded-xl border border-ld-frost/70 overflow-hidden';
export const ADMIN_CARD_HEADER = 'flex items-center gap-3 px-5 md:px-6 py-4 border-b border-ld-frost/60';
export const ADMIN_CARD_BODY = 'p-5 md:p-6';
