import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, PenTool, RotateCcw } from 'lucide-react';
import Seo from '../../../components/common/Seo';
import { CheckoutScreen, VoucherSheet, ActionButton } from '../sandbox/tokokita/CheckoutUI';
import {
  CART, RC1_SPEC, SERVICE_FEE, SHIPPING, VOUCHERS, findVoucher, idr, subtotalOf, voucherSaving, type CartItem,
} from '../sandbox/tokokita/spec';

// ─────────────────────────────────────────────────────────────────────────────
// QA Simulator practice target for phase "design-review": TokoKita checkout,
// staging build v5.2.0-rc1. Rendered from RC1_SPEC, which deviates from the
// design file on purpose (see sandbox/tokokita/spec.ts, PLANTED DR-xx).
// Behaviour not covered by the design (e.g. the "Memproses…" loading state on
// Bayar) is a design gap the learner should raise, not a planted bug.
// ─────────────────────────────────────────────────────────────────────────────

const spec = RC1_SPEC;
const initialCart = () => CART.map((it) => ({ ...it }));

const TokoKitaAppSandboxPage: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>(initialCart);
  const [voucherCode, setVoucherCode] = useState<string | null>(VOUCHERS[0].code);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState<{ total: number; va: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const subtotal = subtotalOf(items);
  const voucher = voucherCode ? findVoucher(voucherCode) : null;

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600);
  };

  const reset = () => {
    setItems(initialCart());
    setVoucherCode(VOUCHERS[0].code);
    setSheetOpen(false);
    setCode('');
    setCodeError(false);
    setPaying(false);
    setOrder(null);
    window.scrollTo(0, 0);
  };

  const openSheet = () => {
    setSelected(voucherCode);
    setCode('');
    setCodeError(false);
    setSheetOpen(true);
  };

  const submitCode = () => {
    if (!code.trim()) return;
    const v = findVoucher(code);
    if (!v) {
      setCodeError(true);
      if (!spec.inlineCodeError) flash('Terjadi kesalahan.'); // PLANTED DR-13 (see spec.ts)
      return;
    }
    setCodeError(false);
    setCode('');
    setSelected(v.code);
  };

  const apply = () => {
    const v = selected ? findVoucher(selected) : null;
    if (v && subtotal < v.minSpend) {
      flash('Voucher tidak dapat digunakan.'); // reachable only because DR-12 lets ineligible vouchers be picked
      return;
    }
    setVoucherCode(v?.code ?? null);
    setSheetOpen(false);
    if (v) flash(`Voucher ${v.code} dipakai`);
  };

  const pay = () => {
    setPaying(true);
    window.setTimeout(() => {
      const total = subtotal + SHIPPING.fee + SERVICE_FEE - voucherSaving(voucher, subtotal);
      setPaying(false);
      setOrder({ total, va: '3901 0812 3456 7890' });
      window.scrollTo(0, 0);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#E2E8F0] font-ld-sans">
      <Seo path="/qa-simulator/sandbox/tokokita" title="TokoKita Staging (Simulasi) | QA Simulator" description="Environment latihan design review QA Simulator." noindex />

      <div className="sticky top-0 z-50 bg-amber-400 text-amber-950 text-xs">
        <div className="max-w-[420px] mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="font-semibold tracking-wide">STAGING · v5.2.0-rc1</span>
          <span className="flex items-center gap-3">
            <button onClick={reset} className="inline-flex items-center gap-1 bg-transparent border-none p-0 text-amber-950 font-medium cursor-pointer hover:underline"><RotateCcw size={11} /> Reset</button>
            <a href="/qa-simulator/sandbox/tokokita-design" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-amber-950 no-underline font-medium hover:underline">
              <PenTool size={12} /> Desain
            </a>
            <Link to="/qa-simulator/ecommerce?phase=design-review" className="inline-flex items-center gap-1 text-amber-950 no-underline font-medium hover:underline">
              <ArrowLeft size={12} /> QA Simulator
            </Link>
          </span>
        </div>
      </div>

      <div className="max-w-[420px] mx-auto bg-[#F1F5F9] min-h-[calc(100vh-32px)] shadow-[0_0_0_1px_rgba(15,23,42,0.06)]">
        <p className="m-0 px-4 py-2 text-[11px] text-slate-500 bg-white border-b border-slate-100">
          Aplikasi simulasi untuk latihan design review, bukan toko asli. Tidak ada pembayaran sungguhan.
        </p>

        {order ? (
          <div className="px-4 py-10 text-center bg-white min-h-[70vh]">
            <CheckCircle2 size={48} className="mx-auto text-[#15803D]" />
            <h1 className="m-0 mt-3 text-[18px] font-semibold text-[#0F172A]">Pesanan dibuat</h1>
            <p className="m-0 mt-1 text-[13px] text-[#64748B]">Selesaikan pembayaran ke BCA Virtual Account berikut.</p>
            <p className="m-0 mt-5 text-[12px] text-[#64748B]">Nomor VA</p>
            <p className="m-0 text-[20px] font-bold tracking-wide text-[#0F172A] tabular-nums">{order.va}</p>
            <p className="m-0 mt-3 text-[12px] text-[#64748B]">Total tagihan</p>
            <p className="m-0 text-[18px] font-bold text-[#0F172A] tabular-nums">{idr(order.total)}</p>
            <div className="mt-8">
              <ActionButton spec={spec} onClick={reset} width="100%">Belanja lagi</ActionButton>
            </div>
          </div>
        ) : (
          <CheckoutScreen
            spec={spec}
            items={items}
            voucher={voucher}
            paying={paying}
            onQty={(id, qty) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)))}
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

      {toast && (
        <div role="status" className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] rounded-md bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">{toast}</div>
      )}
    </div>
  );
};

export default TokoKitaAppSandboxPage;
