import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowLeft, ArrowUpRight, CheckCircle2, ChevronRight, Clock, Loader2, LogOut, Plus, RotateCcw, Send, Star,
} from 'lucide-react';
import Seo from '../../../components/common/Seo';
import DompetKuLogo from '../components/DompetKuLogo';
import BalanceCardIllustration from '../components/BalanceCardIllustration';
import { callMockApi, ME, ME_PIN, resetMock, type Txn } from '../sandbox/dompetkuMockApi';

// ─────────────────────────────────────────────────────────────────────────────
// QA Simulator practice target for phase "regression": DompetKu app staging
// build v3.4.0-rc2 over the in-browser mock API (build "app-rc2").
//
// THIS COMPONENT IS INTENTIONALLY BUGGY. UI-side planted regressions are
// tagged `// PLANTED REG-xx`; API-side ones live in sandbox/dompetkuMockApi.ts.
// They match the answer key in public/qa-simulator/config/ewallet.json
// (phase "regression", assignment "rg-bugs"). Do NOT "fix" them.
// ─────────────────────────────────────────────────────────────────────────────

const BUILD = 'app-rc2' as const;
const TOKEN_KEY = 'qa-sim:dompetku:app-rc2:token';

type Screen = 'home' | 'topup' | 'transfer' | 'history';
type TransferStep = 'recipient' | 'amount' | 'confirm' | 'success';

const idr = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;
const digits = (s: string) => s.replace(/\D/g, '');
const withDots = (s: string) => (s ? Number(s).toLocaleString('id-ID') : '');
/** One key per confirm attempt — the app itself is idempotency-correct. */
const newIdemKey = () => `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const errMsg = (body: unknown) => (body as { error?: { message?: string } })?.error?.message ?? (body as { message?: string })?.message ?? 'Terjadi kesalahan.';

const QUICK_TOPUP = [10_000, 50_000, 100_000, 250_000];
// PLANTED REG-03: "Kartu Debit" (in PRD v1.0 AC1) was dropped from the method list.
const TOPUP_METHODS = [
  { id: 'va_bca', label: 'Virtual Account BCA' },
  { id: 'va_mandiri', label: 'Virtual Account Mandiri' },
];
// PLANTED REG-06: favourites store numbers as +62… (the rc2 API no longer normalises them).
const FAVORITES = [
  { name: 'Budi', phone: '+6281234567890' },
  { name: 'Citra', phone: '+6285711112222' },
];

const INPUT = 'w-full rounded-md border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';
const PRIMARY = 'w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium border-none cursor-pointer transition-colors';

const readToken = () => {
  try { return sessionStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; }
};
const writeToken = (t: string) => {
  try { if (t) sessionStorage.setItem(TOKEN_KEY, t); else sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

const DompetKuAppSandboxPage: React.FC = () => {
  const [token, setToken] = useState(readToken);
  const [screen, setScreen] = useState<Screen>('home');
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // login
  const [phone, setPhone] = useState(ME);
  const [pin, setPin] = useState('');

  // top up
  const [method, setMethod] = useState(TOPUP_METHODS[0].id);
  const [topupText, setTopupText] = useState('');

  // transfer
  const [step, setStep] = useState<TransferStep>('recipient');
  const [toPhone, setToPhone] = useState('');
  const [recipient, setRecipient] = useState<{ name: string; fee: number } | null>(null);
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [lastNote, setLastNote] = useState('');
  const [trfPin, setTrfPin] = useState('');
  const [sent, setSent] = useState<{ amount: number; fee: number; note: string; to: string } | null>(null);

  // history
  const [txns, setTxns] = useState<Txn[] | null>(null);

  const auth = { Authorization: `Bearer ${token}` };

  // PLANTED REG-04: balance is fetched once per page load; transactions never refresh it.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    callMockApi(BUILD, { method: 'GET', path: '/v1/wallet/balance', headers: { Authorization: `Bearer ${token}` } }).then((r) => {
      if (cancelled) return;
      if (r.status === 401) { setToken(''); writeToken(''); return; }
      setBalance((r.body as { data: { balance: number } }).data.balance);
    });
    return () => { cancelled = true; };
  }, [token]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };
  const go = (s: Screen) => {
    setError(null);
    setScreen(s);
    if (s === 'transfer') {
      setStep('recipient');
      setToPhone('');
      setRecipient(null);
      setAmountText('');
      setNote('');
      setTrfPin('');
    }
    if (s === 'history') loadHistory();
  };

  const login = async () => {
    setBusy(true); setError(null);
    const r = await callMockApi(BUILD, { method: 'POST', path: '/v1/auth/login', body: { phone, pin } });
    setBusy(false);
    if (r.status !== 200) { setError(errMsg(r.body)); return; }
    const t = (r.body as { data: { token: string } }).data.token;
    setToken(t); writeToken(t); setPin(''); setScreen('home');
  };
  const logout = () => { setToken(''); writeToken(''); setBalance(null); };

  const topup = async (amount: number) => {
    setBusy(true); setError(null);
    const r = await callMockApi(BUILD, { method: 'POST', path: '/v1/topup', headers: auth, body: { amount, method } });
    setBusy(false);
    if (r.status !== 201) { setError(errMsg(r.body)); return; }
    setTopupText('');
    flash(`Top up ${idr(amount)} berhasil`);
    go('home');
  };

  const inquiry = async () => {
    setBusy(true); setError(null);
    const r = await callMockApi(BUILD, { method: 'POST', path: '/v1/transfer/inquiry', headers: auth, body: { to_phone: toPhone, amount: 0 } });
    setBusy(false);
    if (r.status !== 200) { setError(errMsg(r.body)); return; }
    const d = (r.body as { data: { recipient_name: string; fee: number } }).data;
    setRecipient({ name: d.recipient_name, fee: d.fee });
    setStep('amount');
  };

  // PLANTED REG-01: only the FIRST thousands separator is stripped, so
  // "50.000" → 50000 but "1.500.000" → "1500.000" → 1500.
  const parsedAmount = Number(amountText.replace('.', ''));

  const transfer = async () => {
    setBusy(true); setError(null);
    const r = await callMockApi(BUILD, {
      method: 'POST',
      path: '/v1/transfer',
      headers: { ...auth, 'Idempotency-Key': newIdemKey() },
      body: { to_phone: toPhone, amount: parsedAmount, pin: trfPin, note: note || undefined },
    });
    setBusy(false);
    setTrfPin('');
    if (r.status !== 201 && r.status !== 200) { setError(errMsg(r.body)); return; }
    const d = (r.body as { data: { amount: number; fee: number } }).data;
    // PLANTED REG-08: falls back to the previous transfer's note when this one has none.
    setSent({ amount: d.amount, fee: d.fee, note: note || lastNote, to: recipient?.name ?? toPhone });
    if (note) setLastNote(note);
    setStep('success');
  };

  const loadHistory = async () => {
    setTxns(null);
    const r = await callMockApi(BUILD, { method: 'GET', path: '/v1/transactions?limit=50', headers: auth });
    const list = r.status === 200 ? (r.body as { data: Txn[] }).data : [];
    // PLANTED REG-05: the new list component reverses the API's newest-first order.
    setTxns([...list].reverse());
  };

  const reset = () => {
    resetMock(BUILD);
    logout();
    setLastNote('');
    flash('Data uji direset');
  };

  // ── UI ─────────────────────────────────────────────────────────────────
  const back = (title: string, to?: () => void) => (
    <div className="flex items-center gap-2 mb-4">
      <button onClick={to ?? (() => go('home'))} aria-label="Kembali" className="w-9 h-9 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 cursor-pointer">
        <ArrowLeft size={16} />
      </button>
      <h1 className="m-0 text-base font-bold text-slate-900">{title}</h1>
    </div>
  );

  const errorBox = (error ? <p role="alert" className="m-0 mb-3 rounded-md bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">{error}</p> : null);

  let content: React.ReactNode;
  if (!token) {
    content = (
      <div className="pt-6">
        <div className="flex items-center gap-2 mb-6">
          <DompetKuLogo size={40} className="shrink-0" />
          <span className="text-xl font-bold text-slate-900">Dompet<span className="text-indigo-600">Ku</span></span>
        </div>
        <h1 className="m-0 mb-1 text-lg font-bold text-slate-900">Masuk</h1>
        <p className="m-0 mb-4 text-xs text-slate-500">Akun uji: {ME} · PIN {ME_PIN}</p>
        {errorBox}
        <label className="block mb-3">
          <span className="block mb-1 text-xs font-medium text-slate-600">Nomor HP</span>
          <input className={INPUT} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
        </label>
        <label className="block mb-4">
          <span className="block mb-1 text-xs font-medium text-slate-600">PIN</span>
          <input className={INPUT} value={pin} onChange={(e) => setPin(digits(e.target.value).slice(0, 6))} type="password" inputMode="numeric" />
        </label>
        <button className={PRIMARY} onClick={login} disabled={busy || pin.length !== 6}>
          {busy && <Loader2 size={15} className="animate-spin" />} Masuk
        </button>
      </div>
    );
  } else if (screen === 'home') {
    content = (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DompetKuLogo size={36} className="shrink-0" />
            <span className="text-lg font-bold text-slate-900">Dompet<span className="text-indigo-600">Ku</span></span>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-white border border-slate-200 cursor-pointer"><LogOut size={12} /> Keluar</button>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-indigo-600 text-white p-5">
          <BalanceCardIllustration className="pointer-events-none absolute right-0 bottom-0 h-full w-auto" />
          <div className="relative">
            <p className="m-0 text-xs text-indigo-100">Saldo DompetKu</p>
            <p className="m-0 mt-1 text-3xl font-bold tabular-nums">{balance === null ? '…' : idr(balance)}</p>
            <p className="m-0 mt-3 inline-flex items-center rounded-sm bg-white/15 px-2 py-0.5 text-[11px] text-indigo-50">Akun basic · {ME}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          {([
            ['topup', 'Top Up', Plus],
            ['transfer', 'Transfer', Send],
            ['history', 'Riwayat', Clock],
          ] as const).map(([s, label, Icon]) => (
            <button key={s} onClick={() => go(s)} className="flex flex-col items-center gap-1.5 py-3.5 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-indigo-300">
              <span className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon size={18} /></span>
              <span className="text-xs font-semibold text-slate-700">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  } else if (screen === 'topup') {
    const topupAmount = Number(digits(topupText));
    content = (
      <div>
        {back('Top Up')}
        {errorBox}
        <p className="m-0 mb-2 text-xs font-semibold text-slate-600">Metode</p>
        <div className="space-y-2 mb-4">
          {TOPUP_METHODS.map((m) => (
            <label key={m.id} className={`flex items-center gap-3 px-3.5 py-3 rounded-md border cursor-pointer ${method === m.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
              <input type="radio" name="method" checked={method === m.id} onChange={() => setMethod(m.id)} />
              <span className="text-sm text-slate-800">{m.label}</span>
            </label>
          ))}
        </div>
        <p className="m-0 mb-2 text-xs font-semibold text-slate-600">Nominal cepat</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {QUICK_TOPUP.map((v) => (
            <button key={v} disabled={busy} onClick={() => topup(v)} className="px-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-800 cursor-pointer hover:border-indigo-400">
              {idr(v)}
            </button>
          ))}
        </div>
        <label className="block mb-4">
          <span className="block mb-1 text-xs font-medium text-slate-600">Atau ketik nominal</span>
          <input className={INPUT} value={withDots(digits(topupText))} onChange={(e) => setTopupText(digits(e.target.value))} inputMode="numeric" placeholder="Min. Rp 10.000" />
        </label>
        <button className={PRIMARY} disabled={busy || !topupAmount} onClick={() => topup(topupAmount)}>
          {busy && <Loader2 size={15} className="animate-spin" />} Top up {topupAmount ? idr(topupAmount) : ''}
        </button>
      </div>
    );
  } else if (screen === 'transfer') {
    if (step === 'recipient') {
      content = (
        <div>
          {back('Transfer')}
          {errorBox}
          <p className="m-0 mb-2 text-xs font-semibold text-slate-600 inline-flex items-center gap-1"><Star size={12} className="text-amber-500" /> Penerima favorit</p>
          <div className="flex gap-2 mb-4">
            {FAVORITES.map((f) => (
              <button key={f.phone} onClick={() => setToPhone(f.phone)} className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer hover:border-indigo-400">
                {f.name}
              </button>
            ))}
          </div>
          <label className="block mb-4">
            <span className="block mb-1 text-xs font-medium text-slate-600">Nomor HP penerima</span>
            <input className={INPUT} value={toPhone} onChange={(e) => setToPhone(e.target.value)} inputMode="tel" placeholder="08…" />
          </label>
          <button className={PRIMARY} disabled={busy || !toPhone.trim()} onClick={inquiry}>
            {busy && <Loader2 size={15} className="animate-spin" />} Cek penerima
          </button>
        </div>
      );
    } else if (step === 'amount' && recipient) {
      content = (
        <div>
          {back('Transfer', () => setStep('recipient'))}
          {errorBox}
          <div className="flex items-center gap-3 mb-4 rounded-md bg-white border border-slate-200 px-3.5 py-3">
            <span className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">{recipient.name.charAt(0)}</span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-900">{recipient.name}</span>
              <span className="block text-xs text-slate-500">{toPhone}</span>
            </span>
          </div>
          <label className="block mb-3">
            <span className="block mb-1 text-xs font-medium text-slate-600">Nominal</span>
            <input className={INPUT} value={withDots(digits(amountText))} onChange={(e) => setAmountText(withDots(digits(e.target.value)))} inputMode="numeric" placeholder="Min. Rp 1.000" />
          </label>
          <label className="block mb-4">
            <span className="block mb-1 text-xs font-medium text-slate-600">Catatan (opsional)</span>
            {/* PLANTED REG-07: no maxLength / counter (PRD v1.1: max 50 characters). */}
            <input className={INPUT} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Mis. patungan makan" />
          </label>
          <button className={PRIMARY} disabled={!amountText} onClick={() => { setError(null); setStep('confirm'); }}>
            Lanjut
          </button>
        </div>
      );
    } else if (step === 'confirm' && recipient) {
      content = (
        <div>
          {back('Konfirmasi', () => setStep('amount'))}
          {errorBox}
          <dl className="m-0 rounded-md bg-white border border-slate-200 divide-y divide-slate-100 text-sm mb-4">
            {[
              ['Penerima', recipient.name],
              ['Nominal', idr(parsedAmount)],
              ['Biaya admin', recipient.fee ? idr(recipient.fee) : 'Gratis'],
              ['Total', idr(parsedAmount + recipient.fee)],
              ...(note ? [['Catatan', note]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-slate-500">{k}</dt>
                <dd className="m-0 font-semibold text-slate-900 text-right break-all">{v}</dd>
              </div>
            ))}
          </dl>
          <label className="block mb-4">
            <span className="block mb-1 text-xs font-medium text-slate-600">PIN</span>
            <input className={INPUT} value={trfPin} onChange={(e) => setTrfPin(digits(e.target.value).slice(0, 6))} type="password" inputMode="numeric" />
          </label>
          <button className={PRIMARY} disabled={busy || trfPin.length !== 6} onClick={transfer}>
            {busy && <Loader2 size={15} className="animate-spin" />} Kirim
          </button>
        </div>
      );
    } else if (step === 'success' && sent) {
      content = (
        <div className="pt-6 text-center">
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
          <h1 className="m-0 mt-3 text-lg font-bold text-slate-900">Transfer berhasil</h1>
          <p className="m-0 mt-1 text-3xl font-bold text-slate-900 tabular-nums">{idr(sent.amount)}</p>
          <p className="m-0 mt-1 text-sm text-slate-500">ke {sent.to} · biaya {sent.fee ? idr(sent.fee) : 'gratis'}</p>
          {sent.note && <p className="m-0 mt-3 inline-block rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700">“{sent.note}”</p>}
          <div className="mt-6 space-y-2">
            <button className={PRIMARY} onClick={() => go('home')}>Kembali ke beranda</button>
            <button onClick={() => go('transfer')} className="w-full px-4 py-3 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-700 cursor-pointer">Transfer lagi</button>
          </div>
        </div>
      );
    }
  } else if (screen === 'history') {
    content = (
      <div>
        {back('Riwayat')}
        {!txns ? (
          <p className="m-0 py-10 text-center text-sm text-slate-500"><Loader2 size={16} className="inline animate-spin mr-1" /> Memuat…</p>
        ) : txns.length === 0 ? (
          <p className="m-0 py-10 text-center text-sm text-slate-500">Belum ada transaksi.</p>
        ) : (
          <ul className="m-0 p-0 list-none rounded-md bg-white border border-slate-200 divide-y divide-slate-100">
            {txns.map((t) => {
              const out = t.type === 'transfer_out';
              const Icon = t.type === 'topup' ? Plus : out ? ArrowUpRight : ArrowDownLeft;
              return (
                <li key={t.id} className="flex items-center gap-3 px-3.5 py-3">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${out ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600'}`}><Icon size={16} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 truncate">
                      {t.type === 'topup' ? `Top up · ${t.method === 'va_bca' ? 'VA BCA' : t.method === 'va_mandiri' ? 'VA Mandiri' : 'Kartu debit'}` : out ? `Transfer ke ${t.counterparty}` : `Diterima dari ${t.counterparty}`}
                    </span>
                    <span className="block text-[11px] text-slate-500 truncate">
                      {new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}{t.note ? ` · “${t.note}”` : ''}
                    </span>
                  </span>
                  <span className={`text-sm font-bold tabular-nums ${out ? 'text-rose-600' : 'text-emerald-600'}`}>{out ? '−' : '+'}{idr(t.amount + (out ? t.fee : 0))}</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-ld-sans">
      <Seo path="/qa-simulator/sandbox/dompetku" title="DompetKu Staging (Simulasi) | QA Simulator" description="Environment latihan regression testing QA Simulator." noindex />

      <div className="sticky top-0 z-50 bg-amber-400 text-amber-950 text-xs">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="font-semibold tracking-wide">STAGING · v3.4.0-rc2</span>
          <span className="flex items-center gap-3">
            <button onClick={reset} className="inline-flex items-center gap-1 bg-transparent border-none p-0 text-amber-950 font-medium cursor-pointer hover:underline"><RotateCcw size={11} /> Reset</button>
            <Link to="/qa-simulator/ewallet?phase=regression" className="inline-flex items-center gap-1 text-amber-950 no-underline font-medium hover:underline">
              <ArrowLeft size={12} /> QA Simulator
            </Link>
          </span>
        </div>
      </div>
      <p className="m-0 max-w-md mx-auto px-4 pt-2 text-[11px] text-slate-500">
        Aplikasi simulasi untuk latihan testing, bukan e-wallet asli. Data hanya tersimpan di browser ini.
      </p>

      <main className="max-w-md mx-auto px-4 py-4 relative">
        {content}
        {toast && (
          <div role="status" className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50 rounded-md bg-slate-900 text-white text-sm px-4 py-2">{toast}</div>
        )}
      </main>
    </div>
  );
};

export default DompetKuAppSandboxPage;
