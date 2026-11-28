// QA Simulator — TokoKita "Voucher & Pricing Testing" phase.
//
// Staging build v5.2.0-rc2 (/qa-simulator/sandbox/tokokita?build=rc2). The
// design deviations from rc1 are fixed (it renders DESIGN_SPEC), but the
// voucher and pricing logic below carries PLANTED bugs (VP-xx) that match the
// answer key in public/qa-simulator/config/ecommerce.json (phase
// "voucher-testing", assignment "vp-bugs"). Expected behaviour is PRD v1.1 +
// the v1.2 release notes. Do NOT "fix" these functions: the learner's job is to
// find them. If you change one, update the answer key too.
//
// The correct rules live in spec.ts (voucherSaving) for reference.

import { SHIPPING, SERVICE_FEE, VOUCHERS, type CartItem, type Voucher } from './spec';
import type { CheckoutPricing, VoucherEligibility } from './CheckoutUI';

export const RC2_VERSION = 'v5.2.0-rc2';

// Subtotal starts at exactly Rp 500.000 (459.000 + 41.000) so the min-spend
// boundary of 1111HEMAT is reachable without any setup.
export const CART_RC2: CartItem[] = [
  { id: 'shoe', name: 'Sepatu Lari Pro Glide 3', variant: 'Hitam, 42', price: 459_000, originalPrice: 599_000, qty: 1, tint: '#FED7AA' },
  { id: 'socks', name: 'Kaos Kaki Lari Ankle', variant: 'Putih, M', price: 41_000, qty: 1, tint: '#DCFCE7' },
];

export const VOUCHERS_RC2: Voucher[] = [
  ...VOUCHERS,
  {
    code: 'PERSEN11',
    title: 'Diskon 11% s.d. Rp 75.000',
    detail: 'Min. belanja Rp 250.000',
    minSpend: 250_000,
    kind: 'percent',
    percent: 11,
    amount: 75_000,
    expires: 'Berlaku s.d. 11 Nov, 23:59',
  },
];

export const findVoucherRc2 = (code: string): Voucher | null => {
  const c = code.trim().toUpperCase();
  return VOUCHERS_RC2.find((v) => v.code === c) ?? null;
};

const itemCount = (items: CartItem[]) => items.reduce((s, it) => s + it.qty, 0);
const subtotalOf = (items: CartItem[]) => items.reduce((s, it) => s + it.price * it.qty, 0);

/** PLANTED VP-02: min spend is exclusive (`>`), so a subtotal of exactly the minimum is "Belanja Rp 0 lagi". */
export function eligibilityRc2(v: Voucher, subtotal: number): VoucherEligibility {
  return { eligible: subtotal > v.minSpend, short: Math.max(0, v.minSpend - subtotal) };
}

/**
 * PLANTED VP-01: the applied voucher is never re-checked against min spend after the qty changes.
 * PLANTED VP-03: percent discount is not capped at the voucher's maximum.
 * PLANTED VP-04: free shipping always cuts the full cap (Rp 20.000) even when shipping is Rp 18.000.
 */
export function savingRc2(v: Voucher | null, subtotal: number): number {
  if (!v) return 0;
  if (v.kind === 'shipping') return v.amount;
  if (v.kind === 'percent') return Math.floor((subtotal * (v.percent ?? 0)) / 100);
  return v.amount;
}

/** PLANTED VP-05: service fee charged per item (Rp 1.000 × qty) instead of once per transaction. */
export const serviceFeeRc2 = (items: CartItem[]) => SERVICE_FEE * itemCount(items);

export function pricingRc2(items: CartItem[], voucher: Voucher | null): CheckoutPricing {
  const subtotal = subtotalOf(items);
  const service = serviceFeeRc2(items);
  const saving = savingRc2(voucher, subtotal);
  return { subtotal, service, saving, total: subtotal + SHIPPING.fee + service - saving };
}

// PLANTED VP-06 (page): a typed code is applied straight away, skipping the min-spend check.
// PLANTED VP-07 (page): the loading state starts late, so a quick double tap on Bayar creates two orders.
// PLANTED VP-08 (page): voucher quota is not re-checked at Bayar; with "Kuota voucher habis" on, the
// order is still created with the discount.
/** Delay before Bayar shows its loading state (VP-07). */
export const PAY_LOCK_DELAY_MS = 700;
