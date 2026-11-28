// QA Simulator — TokoKita "Performance & Release Readiness" phase.
//
// Staging build v5.2.0-rc3 (/qa-simulator/sandbox/tokokita?build=rc3).
// Functionally this is the release candidate from PRD v1.3:
// - VP-01 to VP-07 are FIXED: the page uses the correct rules from spec.ts
//   (voucherSaving, inclusive min spend, auto-release, one order per Bayar).
// - VP-08 is still OPEN on purpose (PRD v1.3 "Status fungsional rc3"): with
//   "Kuota voucher habis" on, Bayar still creates the order with the discount.
//
// The Analytics debugger shows the events this build sends. They carry the
// PLANTED analytics bugs AN-01 to AN-05, matching the answer key in
// public/qa-simulator/config/ecommerce.json (phase "release-readiness",
// assignment "rr-analytics") and the static log in PRD v1.3. Do NOT "fix"
// them; if you change one, update the answer key and the PRD log too.
//
// The cart is the original CART from spec.ts (subtotal Rp 588.000), the same
// numbers as the PRD v1.3 log, so a learner's session reproduces it exactly.

import { idr, type Voucher } from './spec';

export const RC3_VERSION = 'v5.2.0-rc3';
export const RC3_USER_ID = 'u_8102';

export type EventProps = Record<string, string | number | null>;

export interface TrackedEvent {
  seq: number;
  time: string;
  name: string;
  props: EventProps;
}

/** Order ids continue from the PRD log (TK-1105-50122). */
export const rc3OrderId = (n: number) => `TK-1105-${50122 + n}`;

// Each builder returns the events one user action sends in rc3 (zero, one, or
// more). The page appends them to the debugger.

export const checkoutViewed = (cartValue: number): [string, EventProps][] => [
  ['checkout_viewed', { user_id: RC3_USER_ID, platform: 'android', cart_value: cartValue }],
];

/** PLANTED AN-04: opening the voucher list sends nothing (should be voucher_sheet_opened). */
export const voucherSheetOpened = (): [string, EventProps][] => [];

/** PLANTED AN-02: voucher_failed is sent without the required `reason`. */
export const voucherFailed = (code: string): [string, EventProps][] => [
  ['voucher_failed', { user_id: RC3_USER_ID, voucher_code: code.trim().toUpperCase() }],
];

/** PLANTED AN-03: discount_amount is formatted text ("50.000"), not a number. */
export const voucherApplied = (v: Voucher, discount: number): [string, EventProps][] => [
  ['voucher_applied', { user_id: RC3_USER_ID, voucher_code: v.code, discount_amount: idr(discount).replace('Rp ', '') }],
];

export const payClicked = (total: number): [string, EventProps][] => [
  ['pay_clicked', { user_id: RC3_USER_ID, total }],
];

/** PLANTED AN-01: order_created is sent twice for one order (same order_id). */
export const orderCreated = (orderId: string, total: number, voucherCode: string | null): [string, EventProps][] => {
  const props = { user_id: RC3_USER_ID, order_id: orderId, total, voucher_code: voucherCode };
  return [['order_created', props], ['order_created', { ...props }]];
};

/** PLANTED AN-05: the success page fires checkout_viewed again, with no user and an empty cart. */
export const successViewed = (): [string, EventProps][] => [
  ['checkout_viewed', { user_id: null, platform: 'android', cart_value: 0 }],
];
