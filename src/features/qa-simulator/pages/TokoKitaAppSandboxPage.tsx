import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Activity, ArrowLeft, CheckCircle2, FlaskConical, PenTool, RotateCcw, Trash2, X } from 'lucide-react';
import Seo from '../../../components/common/Seo';
import { CheckoutScreen, VoucherSheet, ActionButton } from '../sandbox/tokokita/CheckoutUI';
import {
  CART, DESIGN_SPEC, RC1_SPEC, SERVICE_FEE, SHIPPING, VOUCHERS, findVoucher, idr, subtotalOf, voucherSaving, type CartItem,
} from '../sandbox/tokokita/spec';
import {
  CART_RC2, PAY_LOCK_DELAY_MS, RC2_VERSION, VOUCHERS_RC2, eligibilityRc2, findVoucherRc2, pricingRc2,
} from '../sandbox/tokokita/rc2';
import {
  RC3_VERSION, checkoutViewed, orderCreated, payClicked, rc3OrderId, successViewed, voucherApplied, voucherFailed,
  voucherSheetOpened, type EventProps, type TrackedEvent,
} from '../sandbox/tokokita/rc3';

// ─────────────────────────────────────────────────────────────────────────────
// QA Simulator practice target for TokoKita checkout.
//
// Default (no query): staging build v5.2.0-rc1 for phase "design-review".
// Rendered from RC1_SPEC, which deviates from the design file on purpose (see
// sandbox/tokokita/spec.ts, PLANTED DR-xx). Behaviour not covered by the design
// (e.g. the "Memproses…" loading state on Bayar) is a design gap the learner
// should raise, not a planted bug.
//
// ?build=rc2: staging build v5.2.0-rc2 for phase "voucher-testing". Design
// deviations are fixed (DESIGN_SPEC); voucher & pricing logic carries PLANTED
// VP-xx bugs (see sandbox/tokokita/rc2.ts).
//
// ?build=rc3: staging build v5.2.0-rc3 for phase "release-readiness". VP-01 to
// VP-07 fixed, VP-08 still open, plus an Analytics debugger with PLANTED AN-xx
// bugs and the checkout_v2 feature flag (off = checkout v1). See rc3.ts.
// ─────────────────────────────────────────────────────────────────────────────

type Build = 'rc1' | 'rc2' | 'rc3';

interface Order {
  id: string;
  va: string;
  total: number;
  voucher: string | null;
}

const VA_BASE = '3901 0812 3456 78';
const VERSION: Record<Build, string> = { rc1: 'v5.2.0-rc1', rc2: RC2_VERSION, rc3: RC3_VERSION };
const PHASE: Record<Build, string> = { rc1: 'design-review', rc2: 'voucher-testing', rc3: 'release-readiness' };
const PURPOSE: Record<Build, string> = { rc1: 'design review', rc2: 'testing voucher & harga', rc3: 'release readiness' };

const clock = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

const Switch: React.FC<{ label: string; on: boolean; onToggle: () => void }> = ({ label, on, onToggle }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onToggle}
    className="inline-flex items-center gap-2 bg-transparent border-none p-0 text-white text-[12px] cursor-pointer"
  >
    {label}
    <span className={`relative w-8 h-[18px] rounded-full transition-colors ${on ? 'bg-amber-400' : 'bg-slate-600'}`}>
      <span className={`absolute top-0.5 w-[14px] h-[14px] rounded-full bg-white transition-all ${on ? 'left-[16px]' : 'left-0.5'}`} />
    </span>
  </button>
);

/** Strings are quoted so the learner can spot a wrong type ("50.000" vs 50000). */
const PropValue: React.FC<{ value: string | number | null }> = ({ value }) => {
  if (value === null) return <span className="italic text-slate-500">null</span>;
  if (typeof value === 'number') return <span className="text-sky-300">{value}</span>;
  return <span className="text-amber-200">"{value}"</span>;
};

const AnalyticsDebugger: React.FC<{ events: TrackedEvent[]; flagOn: boolean; onClear: () => void; onClose?: () => void }> = ({
  events, flagOn, onClear, onClose,
}) => (
  <div className="h-full flex flex-col bg-slate-950 text-slate-200 text-[12px] font-mono">
    <div className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-slate-800 font-ld-sans">
      <Activity size={14} className="text-emerald-400" />
      <span className="font-semibold text-white text-[13px]">Analytics debugger</span>
      <span className="text-slate-500">· {events.length} event</span>
      <span className="ml-auto flex items-center gap-1">
        <button type="button" onClick={onClear} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-transparent border-none text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer text-[11px]">
          <Trash2 size={12} /> Clear
        </button>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Tutup analytics debugger" className="p-1 rounded bg-transparent border-none text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X size={15} />
          </button>
        )}
      </span>
    </div>
    <p className="shrink-0 m-0 px-3 py-2 text-[11px] leading-relaxed text-slate-400 border-b border-slate-800 font-ld-sans">
      Event yang dikirim build ini, urut dari yang paling baru. Cocokkan dengan tracking plan di PRD v1.3.
      {!flagOn && <span className="block mt-1 text-amber-300">checkout_v2 OFF: checkout v1 tidak mengirim event tracking plan v2.</span>}
    </p>
    <ol className="flex-1 min-h-0 overflow-y-auto m-0 p-0 list-none">
      {events.length === 0 && <li className="px-3 py-6 text-center text-slate-500 font-ld-sans">Belum ada event.</li>}
      {[...events].reverse().map((e) => (
        <li key={e.seq} className="px-3 py-2.5 border-b border-slate-900">
          <div className="flex items-baseline gap-2">
            <span className="text-slate-500 tabular-nums">#{e.seq}</span>
            <span className="font-semibold text-emerald-300">{e.name}</span>
            <span className="ml-auto text-slate-500 tabular-nums">{e.time}</span>
          </div>
          <dl className="m-0 mt-1 pl-6 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
            {Object.entries(e.props).map(([k, v]) => (
              <React.Fragment key={k}>
                <dt className="text-slate-400">{k}:</dt>
                <dd className="m-0 break-all"><PropValue value={v} /></dd>
              </React.Fragment>
            ))}
          </dl>
        </li>
      ))}
    </ol>
  </div>
);

/** Checkout v1 (feature flag checkout_v2 OFF): the old, stable flow without vouchers. */
const CheckoutV1: React.FC<{ items: CartItem[]; paying: boolean; onPay: () => void }> = ({ items, paying, onPay }) => {
  const subtotal = subtotalOf(items);
  const total = subtotal + SHIPPING.fee + SERVICE_FEE;
  return (
    <div className="bg-white min-h-[70vh] text-[#1F2937] text-[14px]">
      <div className="px-4 py-3 border-b border-[#E5E7EB] font-semibold">Checkout</div>
      <p className="m-0 px-4 py-2 text-[11px] text-[#6B7280] bg-[#F9FAFB] border-b border-[#E5E7EB]">Checkout v1 · voucher belum tersedia di halaman ini</p>
      <ul className="m-0 p-0 list-none">
        {items.map((it) => (
          <li key={it.id} className="px-4 py-3 border-b border-[#F3F4F6] flex justify-between gap-3">
            <span>{it.name} <span className="text-[#6B7280]">×{it.qty}</span></span>
            <span className="tabular-nums">{idr(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="m-0 px-4 py-3 space-y-1.5 text-[13px]">
        <div className="flex justify-between"><dt className="text-[#6B7280]">Subtotal</dt><dd className="m-0 tabular-nums">{idr(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-[#6B7280]">Ongkir</dt><dd className="m-0 tabular-nums">{idr(SHIPPING.fee)}</dd></div>
        <div className="flex justify-between"><dt className="text-[#6B7280]">Biaya layanan</dt><dd className="m-0 tabular-nums">{idr(SERVICE_FEE)}</dd></div>
        <div className="flex justify-between pt-2 border-t border-[#E5E7EB] font-semibold"><dt>Total</dt><dd className="m-0 tabular-nums">{idr(total)}</dd></div>
      </dl>
      <div className="px-4 pb-6">
        <button
          type="button"
          onClick={onPay}
          disabled={paying}
          className="w-full h-11 rounded-md border-none bg-[#2563EB] text-white font-semibold cursor-pointer disabled:opacity-60"
        >
          {paying ? 'Memproses…' : 'Bayar'}
        </button>
      </div>
    </div>
  );
};

const TokoKitaAppSandboxPage: React.FC = () => {
  const [params] = useSearchParams();
  const raw = params.get('build');
  const build: Build = raw === 'rc2' || raw === 'rc3' ? raw : 'rc1';
  const rc2 = build === 'rc2';
  const rc3 = build === 'rc3';
  const spec = build === 'rc1' ? RC1_SPEC : DESIGN_SPEC;
  const baseCart = rc2 ? CART_RC2 : CART;
  const initialCart = () => baseCart.map((it) => ({ ...it }));
  const initialVoucher = build === 'rc1' ? VOUCHERS[0].code : null;
  const lookup = build === 'rc1' ? findVoucher : findVoucherRc2;

  const [items, setItems] = useState<CartItem[]>(initialCart);
  const [voucherCode, setVoucherCode] = useState<string | null>(initialVoucher);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [paying, setPaying] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [quotaOut, setQuotaOut] = useState(false);
  const [flagOn, setFlagOn] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  const [debuggerOpen, setDebuggerOpen] = useState(false);
  const pendingRef = useRef<Order[]>([]);
  const orderSeqRef = useRef(0);
  const payLockRef = useRef(false);
  const eventSeqRef = useRef(0);
  // Bumped on Reset and when the flag is switched back on, so checkout_viewed
  // fires once per visit of the v2 checkout (and once under StrictMode).
  const [visit, setVisit] = useState(0);
  const viewedRef = useRef<string | null>(null);

  const subtotal = subtotalOf(items);
  const voucher = voucherCode ? lookup(voucherCode) : null;
  const pricing = rc2 ? pricingRc2(items, voucher) : undefined;

  const track = useCallback((batch: [string, EventProps][]) => {
    if (!batch.length) return;
    const time = clock();
    // Numbered outside the updater: StrictMode runs updaters twice.
    const added = batch.map(([name, props]) => ({ seq: ++eventSeqRef.current, time, name, props }));
    setEvents((prev) => [...prev, ...added]);
  }, []);

  useEffect(() => {
    if (!rc3 || !flagOn || orders) return;
    const key = `${visit}`;
    if (viewedRef.current === key) return;
    viewedRef.current = key;
    track(checkoutViewed(subtotalOf(items)));
    // Only a new visit fires the event, not every cart change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rc3, flagOn, orders, visit, track]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  };

  const reset = () => {
    setItems(initialCart());
    setVoucherCode(initialVoucher);
    setSheetOpen(false);
    setCode('');
    setCodeError(false);
    setPaying(false);
    payLockRef.current = false;
    setOrders(null);
    setQuotaOut(false);
    setFlagOn(true);
    pendingRef.current = [];
    setVisit((v) => v + 1);
    window.scrollTo(0, 0);
  };

  const toggleFlag = () => {
    const next = !flagOn;
    setFlagOn(next);
    setSheetOpen(false);
    if (next) {
      setVisit((v) => v + 1);
      flash('checkout_v2 ON: kembali ke checkout v2');
    } else {
      setVoucherCode(null);
      flash('checkout_v2 OFF: semua user kembali ke checkout v1');
    }
  };

  const openSheet = () => {
    setSelected(voucherCode);
    setCode('');
    setCodeError(false);
    setSheetOpen(true);
    if (rc3) track(voucherSheetOpened());
  };

  const changeQty = (id: string, qty: number) => {
    const next = items.map((it) => (it.id === id ? { ...it, qty } : it));
    setItems(next);
    // rc3: VP-01 fixed. A voucher that no longer qualifies is released (PRD v1.2).
    if (rc3 && voucher && subtotalOf(next) < voucher.minSpend) {
      setVoucherCode(null);
      flash(`Voucher ${voucher.code} dilepas: belanja ${idr(voucher.minSpend - subtotalOf(next))} lagi untuk memakainya`);
    }
  };

  const submitCode = () => {
    if (!code.trim()) return;
    const v = lookup(code);
    if (!v) {
      setCodeError(true);
      if (!spec.inlineCodeError) flash('Terjadi kesalahan.'); // PLANTED DR-13 (see spec.ts)
      if (rc3) track(voucherFailed(code));
      return;
    }
    setCodeError(false);
    setCode('');
    if (rc2) {
      // PLANTED VP-06 (see rc2.ts): applied without checking min spend.
      setVoucherCode(v.code);
      setSheetOpen(false);
      flash(`Voucher ${v.code} dipakai`);
      return;
    }
    setSelected(v.code);
  };

  const apply = () => {
    const v = selected ? lookup(selected) : null;
    if (v && subtotal < v.minSpend) {
      if (rc3) {
        track(voucherFailed(v.code));
        flash(`Belanja ${idr(v.minSpend - subtotal)} lagi untuk memakai ${v.code}`);
      } else {
        flash('Voucher tidak dapat digunakan.'); // rc1: reachable only because DR-12 lets ineligible vouchers be picked
      }
      return;
    }
    setVoucherCode(v?.code ?? null);
    setSheetOpen(false);
    if (v) {
      flash(`Voucher ${v.code} dipakai`);
      if (rc3) track(voucherApplied(v, voucherSaving(v, subtotal)));
    }
  };

  const totalNow = () => pricing?.total ?? subtotal + SHIPPING.fee + SERVICE_FEE - voucherSaving(voucher, subtotal);

  const finishOrders = (list: Order[]) => {
    payLockRef.current = false;
    setPaying(false);
    setOrders(list);
    window.scrollTo(0, 0);
  };

  const pay = () => {
    if (build === 'rc1') {
      setPaying(true);
      window.setTimeout(() => finishOrders([{ id: 'TK-1105-48213', va: `${VA_BASE}90`, total: totalNow(), voucher: voucher?.code ?? null }]), 1500);
      return;
    }
    if (rc3) {
      // VP-07 fixed: the button locks on the first tap (a ref, so a second tap
      // in the same frame can't slip past a stale `paying`).
      if (payLockRef.current) return;
      payLockRef.current = true;
      const v2 = flagOn;
      const total = v2 ? totalNow() : subtotal + SHIPPING.fee + SERVICE_FEE;
      const voucherUsed = v2 ? voucher?.code ?? null : null;
      setPaying(true);
      if (v2) track(payClicked(total));
      window.setTimeout(() => {
        // PLANTED VP-08 still open (see rc3.ts): quotaOut is ignored, the order keeps the discount.
        const n = ++orderSeqRef.current;
        const order = { id: rc3OrderId(n), va: `${VA_BASE}${String(90 + n).padStart(2, '0')}`, total, voucher: voucherUsed };
        if (v2) track(orderCreated(order.id, total, voucherUsed));
        finishOrders([order]);
        if (v2) window.setTimeout(() => track(successViewed()), 600);
      }, 1500);
      return;
    }
    // PLANTED VP-08 (see rc2.ts): quotaOut is ignored, the order keeps the discount.
    // PLANTED VP-07 (see rc2.ts): every tap before the loading state kicks in creates an order.
    const n = pendingRef.current.length + 1;
    pendingRef.current = [
      ...pendingRef.current,
      { id: `TK-1105-4821${2 + n}`, va: `${VA_BASE}${String(89 + n).padStart(2, '0')}`, total: totalNow(), voucher: voucher?.code ?? null },
    ];
    if (n > 1) return;
    window.setTimeout(() => setPaying(true), PAY_LOCK_DELAY_MS);
    window.setTimeout(() => {
      finishOrders(pendingRef.current);
      pendingRef.current = [];
    }, PAY_LOCK_DELAY_MS + 1300);
  };

  const version = VERSION[build];
  const phase = PHASE[build];
  const showTestData = (rc2 || rc3) && !orders;
  const debuggerPanel = (onClose?: () => void) => (
    <AnalyticsDebugger events={events} flagOn={flagOn} onClear={() => setEvents([])} onClose={onClose} />
  );

  return (
    <div className={`min-h-screen bg-[#E2E8F0] font-ld-sans ${rc3 ? 'lg:pr-[360px]' : ''}`}>
      <Seo
        path="/qa-simulator/sandbox/tokokita"
        title="TokoKita Staging (Simulasi) | QA Simulator"
        description={`Environment latihan ${PURPOSE[build]} QA Simulator.`}
        noindex
      />

      <div className="sticky top-0 z-50 bg-amber-400 text-amber-950 text-xs">
        <div className="max-w-[420px] mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="font-semibold tracking-wide">STAGING · {version}</span>
          <span className="flex items-center gap-3">
            <button onClick={reset} className="inline-flex items-center gap-1 bg-transparent border-none p-0 text-amber-950 font-medium cursor-pointer hover:underline"><RotateCcw size={11} /> Reset</button>
            <a href="/qa-simulator/sandbox/tokokita-design" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-amber-950 no-underline font-medium hover:underline">
              <PenTool size={12} /> Desain
            </a>
            <Link to={`/qa-simulator/ecommerce?phase=${phase}`} className="inline-flex items-center gap-1 text-amber-950 no-underline font-medium hover:underline">
              <ArrowLeft size={12} /> QA Simulator
            </Link>
          </span>
        </div>
      </div>

      <div className="max-w-[420px] mx-auto bg-[#F1F5F9] min-h-[calc(100vh-32px)] shadow-[0_0_0_1px_rgba(15,23,42,0.06)]">
        <p className="m-0 px-4 py-2 text-[11px] text-slate-500 bg-white border-b border-slate-100">
          Aplikasi simulasi untuk latihan {PURPOSE[build]}, bukan toko asli. Tidak ada pembayaran sungguhan.
        </p>

        {showTestData && (
          <div className="px-4 py-2.5 bg-slate-900 text-white text-[12px] space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 font-medium"><FlaskConical size={14} /> Test data staging</span>
              <Switch
                label="Kuota voucher habis"
                on={quotaOut}
                onToggle={() => { setQuotaOut((q) => !q); flash(quotaOut ? 'Kuota voucher dipulihkan' : 'Simulasi: kuota voucher yang dipakai sudah habis'); }}
              />
            </div>
            {rc3 && (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setDebuggerOpen(true)}
                  className="lg:invisible inline-flex items-center gap-1.5 bg-transparent border-none p-0 text-emerald-300 text-[12px] font-medium cursor-pointer"
                >
                  <Activity size={14} /> Analytics ({events.length})
                </button>
                <Switch label="Feature flag checkout_v2" on={flagOn} onToggle={toggleFlag} />
              </div>
            )}
          </div>
        )}

        {orders ? (
          <div className="px-4 py-10 text-center bg-white min-h-[70vh]">
            <CheckCircle2 size={48} className="mx-auto text-[#15803D]" />
            <h1 className="m-0 mt-3 text-[18px] font-semibold text-[#0F172A]">Pesanan dibuat</h1>
            <p className="m-0 mt-1 text-[13px] text-[#64748B]">Selesaikan pembayaran ke BCA Virtual Account berikut.</p>
            <div className="mt-5 flex flex-col gap-3">
              {orders.map((o) => (
                <div key={o.id} className={orders.length > 1 ? 'rounded-[12px] border border-solid border-[#E2E8F0] p-4' : ''}>
                  {(orders.length > 1 || rc3) && <p className="m-0 mb-2 text-[12px] font-semibold text-[#0F172A]">Pesanan {o.id}</p>}
                  <p className="m-0 text-[12px] text-[#64748B]">Nomor VA</p>
                  <p className="m-0 text-[20px] font-bold tracking-wide text-[#0F172A] tabular-nums">{o.va}</p>
                  <p className="m-0 mt-3 text-[12px] text-[#64748B]">Total tagihan</p>
                  <p className="m-0 text-[18px] font-bold text-[#0F172A] tabular-nums">{idr(o.total)}</p>
                  {build !== 'rc1' && o.voucher && <p className="m-0 mt-1 text-[12px] text-[#15803D] font-medium">Voucher {o.voucher} dipakai</p>}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <ActionButton spec={spec} onClick={reset} width="100%">Belanja lagi</ActionButton>
            </div>
            {rc3 && (
              <button type="button" onClick={() => setDebuggerOpen(true)} className="lg:hidden mt-4 inline-flex items-center gap-1.5 bg-transparent border-none p-0 text-[13px] font-medium text-[#0F172A] underline cursor-pointer">
                <Activity size={14} /> Lihat Analytics ({events.length})
              </button>
            )}
          </div>
        ) : rc3 && !flagOn ? (
          <CheckoutV1 items={items} paying={paying} onPay={pay} />
        ) : (
          <CheckoutScreen
            spec={spec}
            pricing={pricing}
            items={items}
            voucher={voucher}
            paying={paying}
            onQty={changeQty}
            onOpenVoucher={openSheet}
            onPay={pay}
            onBack={() => flash('Belum tersedia di build staging ini.')}
            onToast={flash}
          />
        )}
      </div>

      {sheetOpen && (
        <VoucherSheet
          spec={spec}
          vouchers={build === 'rc1' ? VOUCHERS : VOUCHERS_RC2}
          eligibilityOf={rc2 ? eligibilityRc2 : undefined}
          subtotal={subtotal}
          selected={selected}
          code={code}
          codeError={codeError}
          onSelect={(c) => setSelected((cur) => (cur === c ? null : c))}
          onCodeChange={(v) => { setCode(v); setCodeError(false); }}
          onSubmitCode={submitCode}
          onApply={apply}
          onClose={() => setSheetOpen(false)}
        />
      )}

      {rc3 && (
        <aside className="hidden lg:block fixed top-0 right-0 bottom-0 w-[360px] z-[55] border-l border-slate-800" aria-label="Analytics debugger">
          {debuggerPanel()}
        </aside>
      )}
      {rc3 && debuggerOpen && (
        <div className="lg:hidden fixed inset-0 z-[70] flex items-end bg-slate-950/60" onMouseDown={(e) => { if (e.target === e.currentTarget) setDebuggerOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-label="Analytics debugger" className="w-full h-[75dvh] rounded-t-xl overflow-hidden">
            {debuggerPanel(() => setDebuggerOpen(false))}
          </div>
        </div>
      )}

      {toast && (
        <div role="status" className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] rounded-md bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">{toast}</div>
      )}
    </div>
  );
};

export default TokoKitaAppSandboxPage;
