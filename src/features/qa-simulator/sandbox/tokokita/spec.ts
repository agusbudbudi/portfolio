// QA Simulator — TokoKita "Design Review" phase.
//
// The design file (/qa-simulator/sandbox/tokokita-design) and the staging build
// (/qa-simulator/sandbox/tokokita) render the SAME checkout components, driven
// by a BuildSpec. DESIGN_SPEC is the source of truth (what the designer drew);
// RC1_SPEC is what engineering shipped. Every field where the two differ is a
// PLANTED deviation (DR-xx) that matches the answer key in
// public/qa-simulator/config/ecommerce.json (phase "design-review",
// assignment "dr-findings"). Do NOT "fix" RC1_SPEC — the learner's job is to
// find the differences. If you change either spec, update the answer key too.

export interface BuildSpec {
  /** Primary action fill (Bayar / Pakai Voucher buttons). */
  ctaColor: string;
  ctaHeight: number;
  ctaRadius: number;
  /** Vertical gap between the section cards. */
  sectionGap: number;
  /** Inner padding of the section cards. */
  cardPadding: number;
  /** Grand total in the bottom bar. */
  totalFontSize: number;
  totalFontWeight: number;
  /** Discount rows rendered as "−Rp 50.000" (true) or "Rp 50.000" (false). */
  discountMinus: boolean;
  /** Label of the voucher entry row on the checkout page. */
  voucherEntryLabel: string;
  /** Long address clamped to 2 lines with an ellipsis. */
  addressClamp: boolean;
  /** Original (struck-through) price + discount badge for discounted items. */
  strikePrice: boolean;
  /** Bottom bar pinned to the viewport bottom. */
  stickyBar: boolean;
  /** Qty stepper button size (px, square). */
  stepperSize: number;
  /** Order of the payment summary rows. */
  summaryOrder: SummaryRow[];
  /** Ineligible vouchers greyed out with the reason, not selectable. */
  ineligibleState: boolean;
  /** Invalid voucher code: inline error under the input (true) or a generic toast (false). */
  inlineCodeError: boolean;
}

export type SummaryRow = 'subtotal' | 'shipping' | 'service' | 'discount';

export const DESIGN_SPEC: BuildSpec = {
  ctaColor: '#C2410C',
  ctaHeight: 48,
  ctaRadius: 12,
  sectionGap: 12,
  cardPadding: 16,
  totalFontSize: 18,
  totalFontWeight: 700,
  discountMinus: true,
  voucherEntryLabel: 'Pilih Voucher',
  addressClamp: true,
  strikePrice: true,
  stickyBar: true,
  stepperSize: 32,
  summaryOrder: ['subtotal', 'shipping', 'service', 'discount'],
  ineligibleState: true,
  inlineCodeError: true,
};

export const RC1_SPEC: BuildSpec = {
  ctaColor: '#F97316', // PLANTED DR-01: brand orange instead of the accessible action orange (white text contrast 2.8:1)
  ctaHeight: 44, // PLANTED DR-02: 44 instead of 48
  ctaRadius: 8, // PLANTED DR-02: 8 instead of 12
  sectionGap: 8, // PLANTED DR-04: 8 instead of 12
  cardPadding: 12, // PLANTED DR-04: 12 instead of 16
  totalFontSize: 16, // PLANTED DR-03: 16/600 instead of 18/700
  totalFontWeight: 600,
  discountMinus: false, // PLANTED DR-06: discount shown without the minus sign
  voucherEntryLabel: 'Gunakan Promo', // PLANTED DR-05: copy differs from the design (and from the sheet title)
  addressClamp: false, // PLANTED DR-07: full address wraps instead of 2-line ellipsis
  strikePrice: false, // PLANTED DR-08: original price + "-23%" badge missing
  stickyBar: false, // PLANTED DR-09: bottom bar scrolls with the page
  stepperSize: 24, // PLANTED DR-10: 24×24 tap target instead of 32×32
  summaryOrder: ['subtotal', 'discount', 'shipping', 'service'], // PLANTED DR-11: discount row moved up
  ineligibleState: false, // PLANTED DR-12: ineligible voucher looks selectable
  inlineCodeError: false, // PLANTED DR-13: generic toast instead of inline error
};

// ── Fixture data (fictional) ────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  variant: string;
  price: number;
  originalPrice?: number;
  qty: number;
  /** Product thumbnail tint. */
  tint: string;
}

export interface Voucher {
  code: string;
  title: string;
  detail: string;
  minSpend: number;
  kind: 'discount' | 'shipping' | 'percent';
  /** Flat amount (discount) or cap (shipping, percent). */
  amount: number;
  /** Percentage for kind 'percent'. */
  percent?: number;
  expires: string;
}

export const ADDRESS = {
  label: 'Rumah',
  name: 'Andini Putri',
  phone: '0812-3456-7890',
  line: 'Jl. Melati Raya No. 27, RT 04/RW 09, Kel. Cempaka Putih Timur, Kec. Cempaka Putih, Jakarta Pusat, DKI Jakarta 10510 (pagar hitam, sebelah warung Bu Sri)',
};

export const SELLER = 'SportZone Official';

export const CART: CartItem[] = [
  { id: 'shoe', name: 'Sepatu Lari Pro Glide 3', variant: 'Hitam, 42', price: 459_000, originalPrice: 599_000, qty: 1, tint: '#FED7AA' },
  { id: 'tee', name: 'Kaos Dry-Fit Training', variant: 'Navy, L', price: 129_000, qty: 1, tint: '#BAE6FD' },
];

export const SHIPPING = { name: 'Reguler', courier: 'KitaExpress', fee: 18_000, eta: 'Estimasi tiba 13 – 15 Nov' };
export const SERVICE_FEE = 1_000;
export const MAX_QTY = 10;

export const VOUCHERS: Voucher[] = [
  { code: '1111HEMAT', title: 'Diskon Rp 50.000', detail: 'Min. belanja Rp 500.000', minSpend: 500_000, kind: 'discount', amount: 50_000, expires: 'Berlaku s.d. 11 Nov, 23:59' },
  { code: 'ONGKIR20', title: 'Gratis Ongkir s.d. Rp 20.000', detail: 'Min. belanja Rp 100.000', minSpend: 100_000, kind: 'shipping', amount: 20_000, expires: 'Berlaku s.d. 30 Nov' },
  { code: 'SUPER11', title: 'Diskon Rp 150.000', detail: 'Min. belanja Rp 1.000.000', minSpend: 1_000_000, kind: 'discount', amount: 150_000, expires: 'Berlaku s.d. 11 Nov, 23:59' },
];

export const idr = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;

export const subtotalOf = (items: CartItem[]) => items.reduce((s, it) => s + it.price * it.qty, 0);

/** Correct rules (PRD v1.1): min spend inclusive, shipping capped at the real fee, percent floored and capped. */
export function voucherSaving(v: Voucher | null, subtotal: number): number {
  if (!v || subtotal < v.minSpend) return 0;
  if (v.kind === 'shipping') return Math.min(v.amount, SHIPPING.fee);
  if (v.kind === 'percent') return Math.min(Math.floor((subtotal * (v.percent ?? 0)) / 100), v.amount);
  return v.amount;
}

export function findVoucher(code: string): Voucher | null {
  const c = code.trim().toUpperCase();
  return VOUCHERS.find((v) => v.code === c) ?? null;
}
