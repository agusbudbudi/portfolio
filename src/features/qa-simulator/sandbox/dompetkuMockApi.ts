// ─────────────────────────────────────────────────────────────────────────────
// QA Simulator practice target: in-browser mock of the DompetKu API.
//
// THIS MODULE IS INTENTIONALLY BUGGY. Behaviour depends on the build:
//   'api-rc1' → used by the API Console (phase "api-testing"), planted
//               bugs tagged `// PLANTED API-xx`.
//   'app-rc2' → used by the DompetKu App (phase "regression"); API-01..08 are
//               fixed, API-09 is not, and a fix introduced `// PLANTED REG-02`.
// Each tag matches the answer keys in public/qa-simulator/config/ewallet.json
// (assignments "api-bugs" and "rg-bugs"). Do NOT "fix" these — the learner's
// job is to find them. Change behaviour here → update the answer key too.
//
// State lives in localStorage per build so the learner can reload and keep
// their test data (also needed for REG-04). Nothing leaves the browser.
// ─────────────────────────────────────────────────────────────────────────────

export type Build = 'api-rc1' | 'app-rc2';

export interface ApiRequest {
  method: 'GET' | 'POST';
  /** Path with optional query string, e.g. /v1/transactions?limit=20 */
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse {
  status: number;
  body: unknown;
  ms: number;
}

export interface Txn {
  id: string;
  type: 'topup' | 'transfer_out' | 'transfer_in';
  amount: number;
  fee: number;
  status: 'success';
  counterparty?: string;
  method?: string;
  note?: string;
  created_at: string;
}

interface User { phone: string; name: string; pin?: string; balance: number; kyc_level: 'basic' | 'verified' }

interface State {
  users: Record<string, User>;
  tokens: string[];
  transfersThisMonth: number;
  pinFails: number;
  lockedUntil: number;
  /** owner phone → transactions (newest pushed last) */
  txns: Record<string, Txn[]>;
  idem: Record<string, { status: number; body: unknown; at: number }>;
}

export const ME = '081200001111';
export const ME_PIN = '123456';
const BASIC_LIMIT = 2_000_000;
const TOPUP_MIN = 10_000;
const TOPUP_MAX = 10_000_000;
const TRF_MIN = 1_000;
const TRF_MAX = 5_000_000;
const DAILY_MAX = 20_000_000;
const FEE = 2_500;
const METHODS = ['va_bca', 'va_mandiri', 'debit_card'];

const seed = (): State => ({
  users: {
    [ME]: { phone: ME, name: 'Kamu Tester', pin: ME_PIN, balance: 250_000, kyc_level: 'basic' },
    '081234567890': { phone: '081234567890', name: 'Budi Santoso', balance: 100_000, kyc_level: 'verified' },
    '085711112222': { phone: '085711112222', name: 'Citra Lestari', balance: 50_000, kyc_level: 'basic' },
  },
  tokens: [],
  transfersThisMonth: 0,
  pinFails: 0,
  lockedUntil: 0,
  txns: {
    [ME]: [
      { id: 'TXN-0001', type: 'topup', amount: 200_000, fee: 0, status: 'success', method: 'va_bca', created_at: '2026-11-02T09:12:00+07:00' },
      { id: 'TXN-0002', type: 'transfer_in', amount: 50_000, fee: 0, status: 'success', counterparty: '085711112222', created_at: '2026-11-05T19:40:00+07:00' },
    ],
  },
  idem: {},
});

const key = (build: Build) => `qa-sim:dompetku:${build}`;

function load(build: Build): State {
  try {
    const raw = localStorage.getItem(key(build));
    if (raw) return JSON.parse(raw) as State;
  } catch {
    /* blocked storage → fresh seed */
  }
  return seed();
}
function save(build: Build, s: State) {
  try {
    localStorage.setItem(key(build), JSON.stringify(s));
  } catch {
    /* ignore */
  }
}
export function resetMock(build: Build) {
  try {
    localStorage.removeItem(key(build));
  } catch {
    /* ignore */
  }
}

const err = (status: number, code: string, message: string) => ({ status, body: { error: { code, message } } });
const ok = (status: number, data: unknown, extra: Record<string, unknown> = {}) => ({ status, body: { data, ...extra } });
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

/** PRD v1.1: "+628…" and "08…" are the same number. */
export const normalizePhone = (raw: string) => {
  const p = String(raw ?? '').replace(/[\s-]/g, '');
  return p.startsWith('+62') ? `0${p.slice(3)}` : p;
};
/** "Budi Santoso" → "Bu** Sa*****" */
export const maskName = (name: string) =>
  name.split(' ').map((w) => (w.length <= 2 ? w : w.slice(0, 2) + '*'.repeat(w.length - 2))).join(' ');

const isPosInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n);

function authed(s: State, headers: Record<string, string>) {
  const h = Object.entries(headers).find(([k]) => k.toLowerCase() === 'authorization')?.[1] ?? '';
  const tok = h.replace(/^Bearer\s+/i, '').trim();
  return !!tok && s.tokens.includes(tok);
}
const header = (headers: Record<string, string>, name: string) =>
  Object.entries(headers).find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1]?.trim() ?? '';

const todayOut = (s: State) => {
  const today = new Date().toISOString().slice(0, 10);
  return (s.txns[ME] ?? []).filter((t) => t.type === 'transfer_out' && t.created_at.slice(0, 10) === today).reduce((n, t) => n + t.amount, 0);
};

function route(build: Build, s: State, req: ApiRequest): { status: number; body: unknown } {
  const rc1 = build === 'api-rc1';
  const [pathname, qs = ''] = req.path.trim().split('?');
  const headers = req.headers ?? {};
  const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
  const me = s.users[ME];

  // ── Auth ──
  if (req.method === 'POST' && pathname === '/v1/auth/login') {
    const phone = normalizePhone(String(body.phone ?? ''));
    if (phone !== ME || String(body.pin ?? '') !== ME_PIN) return err(401, 'INVALID_PIN', 'Nomor HP atau PIN salah.');
    const token = `tok_${Math.random().toString(36).slice(2, 14)}`;
    s.tokens = [...s.tokens.slice(-9), token];
    return ok(200, { token, expires_in: 3600 });
  }

  // ── Balance ──
  if (req.method === 'GET' && pathname === '/v1/wallet/balance') {
    // PLANTED API-01 (rc1): balance is served without checking the token.
    if (!rc1 && !authed(s, headers)) return err(401, 'UNAUTHORIZED', 'Token tidak valid atau tidak ada.');
    return ok(200, { balance: me.balance, currency: 'IDR', kyc_level: me.kyc_level });
  }

  if (!authed(s, headers)) return err(401, 'UNAUTHORIZED', 'Token tidak valid atau tidak ada.');

  // ── Top up ──
  if (req.method === 'POST' && pathname === '/v1/topup') {
    const amount = body.amount;
    const method = String(body.method ?? '');
    if (!METHODS.includes(method)) {
      // PLANTED API-11 (rc1): this error skips the standard { error: { code, message } } envelope.
      if (rc1) return { status: 422, body: { message: 'Metode top up tidak dikenal.' } };
      return err(422, 'INVALID_METHOD', 'Metode top up tidak dikenal.');
    }
    if (!isPosInt(amount)) return err(422, 'INVALID_AMOUNT', 'Nominal harus bilangan bulat.');
    if (rc1) {
      // PLANTED API-02: only positive amounts are range-checked, so 0 and negatives pass.
      // PLANTED API-03: minimum is 1.000 instead of 10.000.
      if (amount > 0 && (amount < 1_000 || amount > TOPUP_MAX)) return err(422, 'INVALID_AMOUNT', 'Nominal top up di luar batas.');
    } else {
      // PLANTED REG-02 (rc2): the API-03 fix made the minimum exclusive (<=), so exactly 10.000 is rejected.
      if (amount <= TOPUP_MIN || amount > TOPUP_MAX) return err(422, 'INVALID_AMOUNT', 'Minimal top up Rp 10.000, maksimal Rp 10.000.000.');
    }
    if (me.kyc_level === 'basic' && me.balance + amount > BASIC_LIMIT) {
      return err(422, 'BALANCE_LIMIT_EXCEEDED', 'Saldo akun basic maksimal Rp 2.000.000.');
    }
    me.balance += amount;
    const t: Txn = { id: uid('TOP'), type: 'topup', amount, fee: 0, status: 'success', method, created_at: new Date().toISOString() };
    s.txns[ME] = [...(s.txns[ME] ?? []), t];
    return ok(201, { id: t.id, status: t.status, amount, balance_after: me.balance });
  }

  // ── Transfer inquiry ──
  const lookup = (raw: unknown) => {
    // PLANTED REG-06 (rc2): phone normalisation was dropped, so "+628…" no longer resolves.
    const phone = rc1 ? normalizePhone(String(raw ?? '')) : String(raw ?? '').trim();
    return { phone, user: s.users[phone] };
  };
  // PLANTED API-09 (rc1 + rc2): admin fee is charged from the first transfer of the month.
  // Correct rule (PRD v1.1): first 5 transfers per calendar month are free → s.transfersThisMonth < 5 ? 0 : FEE.
  const feeFor = () => FEE;

  if (req.method === 'POST' && pathname === '/v1/transfer/inquiry') {
    const { phone, user } = lookup(body.to_phone);
    if (!user) return err(404, 'RECIPIENT_NOT_FOUND', 'Nomor belum terdaftar di DompetKu.');
    // PLANTED API-07 (rc1): transferring to yourself is not blocked.
    if (!rc1 && phone === ME) return err(422, 'SELF_TRANSFER', 'Tidak bisa transfer ke nomor sendiri.');
    const amount = isPosInt(body.amount) ? body.amount : 0;
    const fee = feeFor();
    // PLANTED API-08 (rc1): full recipient name is returned unmasked.
    return ok(200, { recipient_name: rc1 ? user.name : maskName(user.name), fee, total: amount + fee });
  }

  // ── Transfer ──
  if (req.method === 'POST' && pathname === '/v1/transfer') {
    const idemKey = header(headers, 'Idempotency-Key');
    if (!rc1) {
      if (!idemKey) return err(422, 'MISSING_IDEMPOTENCY_KEY', 'Header Idempotency-Key wajib diisi.');
      const prev = s.idem[idemKey];
      if (prev && Date.now() - prev.at < 24 * 3600 * 1000) return { status: 200, body: prev.body };
    }
    // PLANTED API-06 (rc1): Idempotency-Key is ignored entirely — repeats create new transfers.

    if (s.lockedUntil > Date.now()) return err(423, 'PIN_LOCKED', 'Transfer dikunci 1 jam karena PIN salah 3x.');
    if (String(body.pin ?? '') !== ME_PIN) {
      if (rc1) {
        // PLANTED API-05: wrong PIN crashes the handler (500 + internals leak) and never locks.
        return { status: 500, body: { error: { code: 'INTERNAL_ERROR', message: "TypeError: Cannot read properties of undefined (reading 'attempts') at PinService.verify (pin.service.ts:42)" } } };
      }
      s.pinFails += 1;
      if (s.pinFails >= 3) {
        s.pinFails = 0;
        s.lockedUntil = Date.now() + 3600 * 1000;
        return err(423, 'PIN_LOCKED', 'PIN salah 3x. Transfer dikunci 1 jam.');
      }
      return err(401, 'INVALID_PIN', `PIN salah. Sisa ${3 - s.pinFails} percobaan.`);
    }
    s.pinFails = 0;

    const { phone, user } = lookup(body.to_phone);
    if (!user) return err(404, 'RECIPIENT_NOT_FOUND', 'Nomor belum terdaftar di DompetKu.');
    if (!rc1 && phone === ME) return err(422, 'SELF_TRANSFER', 'Tidak bisa transfer ke nomor sendiri.');
    const amount = body.amount;
    if (!isPosInt(amount) || amount < TRF_MIN || amount > TRF_MAX) return err(422, 'INVALID_AMOUNT', 'Nominal transfer Rp 1.000 – Rp 5.000.000.');
    if (todayOut(s) + amount > DAILY_MAX) return err(422, 'DAILY_LIMIT_EXCEEDED', 'Melebihi batas transfer harian Rp 20.000.000.');
    // PLANTED REG-07 (rc2, together with the app input): note length (max 50, PRD v1.1) isn't validated.
    const note = body.note == null || body.note === '' ? undefined : String(body.note);
    const fee = feeFor();
    // PLANTED API-04 (rc1): no balance check — the sender can go negative.
    if (!rc1 && me.balance < amount + fee) return err(422, 'INSUFFICIENT_BALANCE', 'Saldo tidak cukup untuk nominal + biaya.');

    me.balance -= amount + fee;
    user.balance += amount;
    s.transfersThisMonth += 1;
    const now = new Date().toISOString();
    const t: Txn = { id: uid('TRF'), type: 'transfer_out', amount, fee, status: 'success', counterparty: phone, note, created_at: now };
    s.txns[ME] = [...(s.txns[ME] ?? []), t];
    s.txns[phone] = [...(s.txns[phone] ?? []), { ...t, id: uid('TRF'), type: 'transfer_in', fee: 0, counterparty: ME }];
    const res = ok(201, { id: t.id, status: t.status, amount, fee, balance_after: me.balance });
    if (!rc1) s.idem[idemKey] = { status: 200, body: res.body, at: Date.now() };
    return res;
  }

  // ── Transactions ──
  if (req.method === 'GET' && pathname === '/v1/transactions') {
    const q = new URLSearchParams(qs);
    const page = Math.max(1, parseInt(q.get('page') ?? '1', 10) || 1);
    const rawLimit = parseInt(q.get('limit') ?? '20', 10) || 20;
    // PLANTED API-10 (rc1): limit isn't capped at 50.
    const limit = rc1 ? Math.max(1, rawLimit) : Math.min(50, Math.max(1, rawLimit));
    const all = [...(s.txns[ME] ?? [])].reverse(); // newest first (API is correct; REG-05 is in the app)
    return ok(200, all.slice((page - 1) * limit, page * limit), { meta: { page, limit, total: all.length } });
  }

  return err(404, 'NOT_FOUND', `Endpoint ${req.method} ${pathname} tidak ada.`);
}

/** Simulates a network round trip; state persists per build. */
export async function callMockApi(build: Build, req: ApiRequest): Promise<ApiResponse> {
  const started = performance.now();
  const s = load(build);
  const res = route(build, s, req);
  save(build, s);
  const latency = 120 + Math.random() * 260;
  await new Promise((r) => setTimeout(r, latency));
  return { ...res, ms: Math.round(performance.now() - started) };
}
