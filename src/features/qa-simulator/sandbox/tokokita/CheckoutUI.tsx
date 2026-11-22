import React from 'react';
import {
  ArrowLeft, BadgeCheck, Check, ChevronRight, Footprints, Landmark, Loader2, MapPin, Minus, Plus, Shirt, Store, TicketPercent, Truck, X,
} from 'lucide-react';
import {
  ADDRESS, CART, MAX_QTY, SELLER, SERVICE_FEE, SHIPPING, VOUCHERS, idr, subtotalOf, voucherSaving,
  type BuildSpec, type CartItem, type SummaryRow, type Voucher,
} from './spec';

// Shared checkout UI for the TokoKita design file and the staging build.
// Colours are literal hex (arbitrary Tailwind values / inline styles) on
// purpose: the design viewer's inspect panel reads getComputedStyle, and
// Tailwind v4 palette classes would surface as oklch() instead of the hex a
// designer would hand off. Every inspectable element carries data-layer.

const C = {
  text: '#0F172A',
  text2: '#64748B',
  muted: '#94A3B8',
  border: '#E2E8F0',
  bg: '#F1F5F9',
  brand: '#F97316',
  link: '#C2410C',
  success: '#15803D',
  danger: '#DC2626',
  warn: '#B45309',
} as const;

const ITEM_ICON: Record<string, React.ElementType> = { shoe: Footprints, tee: Shirt };

// ── Button ──────────────────────────────────────────────────────────────────

export const ActionButton: React.FC<{
  spec: BuildSpec;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  pressed?: boolean;
  width?: number | string;
  layer?: string;
}> = ({ spec, children, onClick, disabled, busy, pressed, width, layer = 'Button / Primary' }) => (
  <button
    type="button"
    data-layer={layer}
    onClick={onClick}
    disabled={disabled || busy}
    className="inline-flex items-center justify-center gap-2 px-5 text-[15px] leading-5 font-semibold text-white border-none cursor-pointer disabled:cursor-not-allowed transition-[filter] hover:brightness-95"
    style={{
      height: spec.ctaHeight,
      borderRadius: spec.ctaRadius,
      width,
      background: disabled ? '#CBD5E1' : pressed ? '#9A3412' : spec.ctaColor,
    }}
  >
    {busy && <Loader2 size={16} className="animate-spin" />}
    {children}
  </button>
);

// ── Pieces ──────────────────────────────────────────────────────────────────

const Section: React.FC<{ spec: BuildSpec; layer: string; children: React.ReactNode }> = ({ spec, layer, children }) => (
  <section data-layer={layer} className="bg-white" style={{ padding: spec.cardPadding }}>
    {children}
  </section>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 data-layer="Section title" className="m-0 text-[14px] leading-5 font-semibold text-[#0F172A]">{children}</h2>
);

export const QtyStepper: React.FC<{ spec: BuildSpec; qty: number; onChange?: (q: number) => void }> = ({ spec, qty, onChange }) => {
  const s = spec.stepperSize;
  const btn = 'flex items-center justify-center bg-white border border-solid border-[#E2E8F0] rounded-[8px] p-0 cursor-pointer disabled:cursor-not-allowed text-[#0F172A] disabled:text-[#CBD5E1]';
  return (
    <div data-layer="Qty stepper" className="flex items-center">
      <button type="button" data-layer="Stepper / Minus" aria-label="Kurangi" className={btn} style={{ width: s, height: s }} disabled={qty <= 1} onClick={() => onChange?.(qty - 1)}>
        <Minus size={14} />
      </button>
      <span data-layer="Stepper / Qty" className="w-8 text-center text-[14px] leading-5 font-medium text-[#0F172A] tabular-nums">{qty}</span>
      <button type="button" data-layer="Stepper / Plus" aria-label="Tambah" className={btn} style={{ width: s, height: s }} disabled={qty >= MAX_QTY} onClick={() => onChange?.(qty + 1)}>
        <Plus size={14} />
      </button>
    </div>
  );
};

const ItemRow: React.FC<{ spec: BuildSpec; item: CartItem; onQty?: (q: number) => void }> = ({ spec, item, onQty }) => {
  const Icon = ITEM_ICON[item.id] ?? Store;
  const pct = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;
  return (
    <div data-layer="Item row" className="flex gap-3">
      <div data-layer="Item / Thumbnail" className="w-16 h-16 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: item.tint }}>
        <Icon size={26} color="#7C2D12" strokeWidth={1.6} />
      </div>
      <div className="flex-1 min-w-0">
        <p data-layer="Item / Name" className="m-0 text-[14px] leading-5 font-medium text-[#0F172A] line-clamp-2">{item.name}</p>
        <p data-layer="Item / Variant" className="m-0 mt-0.5 text-[12px] leading-4 text-[#64748B]">{item.variant}</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {spec.strikePrice && item.originalPrice && (
              <div className="flex items-center gap-1.5">
                <span data-layer="Item / Original price" className="text-[12px] leading-4 text-[#94A3B8] line-through">{idr(item.originalPrice)}</span>
                <span data-layer="Badge / Discount" className="px-1 rounded-[4px] bg-[#FEE2E2] text-[11px] leading-4 font-semibold text-[#DC2626]">-{pct}%</span>
              </div>
            )}
            <p data-layer="Item / Price" className="m-0 text-[14px] leading-5 font-bold text-[#0F172A] tabular-nums">{idr(item.price)}</p>
          </div>
          <QtyStepper spec={spec} qty={item.qty} onChange={onQty} />
        </div>
      </div>
    </div>
  );
};

const discountText = (spec: BuildSpec, n: number) => `${spec.discountMinus ? '−' : ''}${idr(n)}`;

// ── Checkout screen ─────────────────────────────────────────────────────────

export interface CheckoutScreenProps {
  spec: BuildSpec;
  items?: CartItem[];
  voucher?: Voucher | null;
  /** Rendered as a static frame inside the design file (no sticky/fixed). */
  inFrame?: boolean;
  paying?: boolean;
  onQty?: (id: string, qty: number) => void;
  onOpenVoucher?: () => void;
  onPay?: () => void;
  onBack?: () => void;
  onToast?: (msg: string) => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  spec, items = CART, voucher = VOUCHERS[0], inFrame, paying, onQty, onOpenVoucher, onPay, onBack, onToast,
}) => {
  const subtotal = subtotalOf(items);
  const saving = voucherSaving(voucher, subtotal);
  const total = subtotal + SHIPPING.fee + SERVICE_FEE - saving;
  const count = items.reduce((s, it) => s + it.qty, 0);
  const soon = () => onToast?.('Belum tersedia di build staging ini.');

  const summary: Record<SummaryRow, React.ReactNode> = {
    subtotal: <SummaryLine key="subtotal" label={`Subtotal produk (${count} barang)`} value={idr(subtotal)} />,
    shipping: <SummaryLine key="shipping" label="Ongkos kirim" value={idr(SHIPPING.fee)} />,
    service: <SummaryLine key="service" label="Biaya layanan" value={idr(SERVICE_FEE)} />,
    discount: saving > 0
      ? <SummaryLine key="discount" label={voucher?.kind === 'shipping' ? 'Diskon ongkir' : 'Diskon voucher'} value={discountText(spec, saving)} positive />
      : null,
  };

  return (
    <div data-layer="Checkout" className="bg-[#F1F5F9] font-ld-sans text-[#0F172A]">
      <header data-layer="Top bar" className="h-14 flex items-center gap-3 px-4 bg-white border-b border-solid border-[#E2E8F0] border-x-0 border-t-0">
        <button type="button" aria-label="Kembali" onClick={onBack} className="w-8 h-8 -ml-1.5 flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-[#0F172A]">
          <ArrowLeft size={20} />
        </button>
        <h1 data-layer="Top bar / Title" className="m-0 text-[16px] leading-6 font-semibold">Checkout</h1>
      </header>

      <div data-layer="Sections" className="flex flex-col" style={{ gap: spec.sectionGap, paddingTop: spec.sectionGap, paddingBottom: spec.sectionGap }}>
        <Section spec={spec} layer="Section / Alamat">
          <div className="flex items-start gap-3">
            <MapPin size={18} color={C.brand} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p data-layer="Alamat / Label" className="m-0 text-[12px] leading-4 font-medium text-[#64748B]">Alamat pengiriman</p>
              <p data-layer="Alamat / Penerima" className="m-0 mt-1 text-[14px] leading-5 font-semibold">{ADDRESS.label} · {ADDRESS.name} ({ADDRESS.phone})</p>
              <p data-layer="Alamat / Detail" className={`m-0 mt-0.5 text-[13px] leading-5 text-[#64748B] ${spec.addressClamp ? 'line-clamp-2' : ''}`}>{ADDRESS.line}</p>
            </div>
            <button type="button" data-layer="Alamat / Ubah" onClick={soon} className="shrink-0 bg-transparent border-none p-0 cursor-pointer text-[13px] leading-5 font-semibold text-[#C2410C]">Ubah</button>
          </div>
        </Section>

        <Section spec={spec} layer="Section / Produk">
          <div data-layer="Seller" className="flex items-center gap-1.5 mb-3">
            <Store size={16} color={C.text} />
            <span data-layer="Seller / Name" className="text-[14px] leading-5 font-semibold">{SELLER}</span>
            <BadgeCheck size={15} color="#7C3AED" aria-label="Official store" />
          </div>
          <div data-layer="Item list" className="flex flex-col gap-4">
            {items.map((it) => <ItemRow key={it.id} spec={spec} item={it} onQty={onQty ? (q) => onQty(it.id, q) : undefined} />)}
          </div>
        </Section>

        <Section spec={spec} layer="Section / Pengiriman">
          <SectionTitle>Pengiriman</SectionTitle>
          <button type="button" data-layer="Pengiriman / Opsi" onClick={soon} className="mt-3 w-full flex items-center gap-3 p-3 rounded-[8px] border border-solid border-[#E2E8F0] bg-white cursor-pointer text-left">
            <Truck size={18} color={C.text2} className="shrink-0" />
            <span className="flex-1 min-w-0">
              <span data-layer="Pengiriman / Nama" className="block text-[14px] leading-5 font-semibold text-[#0F172A]">{SHIPPING.name} · {SHIPPING.courier}</span>
              <span data-layer="Pengiriman / Estimasi" className="block text-[12px] leading-4 text-[#64748B]">{SHIPPING.eta}</span>
            </span>
            <span data-layer="Pengiriman / Ongkir" className="text-[14px] leading-5 font-semibold text-[#0F172A] tabular-nums">{idr(SHIPPING.fee)}</span>
            <ChevronRight size={16} color={C.muted} />
          </button>
        </Section>

        <Section spec={spec} layer="Section / Voucher">
          <button type="button" data-layer="Voucher entry" onClick={onOpenVoucher} className="w-full flex items-center gap-3 bg-transparent border-none p-0 cursor-pointer text-left">
            <TicketPercent size={20} color={C.brand} className="shrink-0" />
            <span data-layer="Voucher entry / Label" className="flex-1 text-[14px] leading-5 font-semibold text-[#0F172A]">{spec.voucherEntryLabel}</span>
            {voucher && saving > 0 && (
              <span className="flex flex-col items-end">
                <span data-layer="Voucher entry / Kode" className="px-1.5 rounded-[4px] bg-[#FFF7ED] border border-dashed border-[#FDBA74] text-[11px] leading-4 font-semibold text-[#C2410C]">{voucher.code}</span>
                <span data-layer="Voucher entry / Hemat" className="mt-0.5 text-[12px] leading-4 font-medium text-[#15803D]">Hemat {idr(saving)}</span>
              </span>
            )}
            <ChevronRight size={16} color={C.muted} />
          </button>
        </Section>

        <Section spec={spec} layer="Section / Pembayaran">
          <SectionTitle>Metode pembayaran</SectionTitle>
          <div data-layer="Pembayaran / Opsi" className="mt-3 flex items-center gap-3">
            <span className="w-10 h-7 rounded-[4px] bg-[#EFF6FF] flex items-center justify-center shrink-0"><Landmark size={16} color="#1D4ED8" /></span>
            <span className="flex-1 min-w-0">
              <span data-layer="Pembayaran / Nama" className="block text-[14px] leading-5 font-medium">BCA Virtual Account</span>
              <span data-layer="Pembayaran / Info" className="block text-[12px] leading-4 text-[#64748B]">Dicek otomatis dalam 10 menit</span>
            </span>
            <button type="button" data-layer="Pembayaran / Ubah" onClick={soon} className="shrink-0 bg-transparent border-none p-0 cursor-pointer text-[13px] leading-5 font-semibold text-[#C2410C]">Ubah</button>
          </div>
        </Section>

        <Section spec={spec} layer="Section / Ringkasan">
          <SectionTitle>Ringkasan pembayaran</SectionTitle>
          <div data-layer="Ringkasan / Rows" className="mt-3 flex flex-col gap-2">
            {spec.summaryOrder.map((r) => summary[r])}
          </div>
          <div className="my-3 h-px bg-[#E2E8F0]" />
          <div data-layer="Ringkasan / Total" className="flex items-center justify-between">
            <span className="text-[14px] leading-5 font-semibold">Total tagihan</span>
            <span className="text-[14px] leading-5 font-bold tabular-nums">{idr(total)}</span>
          </div>
        </Section>
      </div>

      <div
        data-layer="Bottom bar"
        className="flex items-center gap-3 px-4 py-3 bg-white border-t border-solid border-[#E2E8F0] border-x-0 border-b-0 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]"
        style={!inFrame && spec.stickyBar ? { position: 'sticky', bottom: 0, zIndex: 10 } : undefined}
      >
        <div className="flex-1 min-w-0">
          <p data-layer="Bottom bar / Label" className="m-0 text-[12px] leading-4 text-[#64748B]">Total tagihan</p>
          <p data-layer="Bottom bar / Total" className="m-0 leading-6 text-[#0F172A] tabular-nums" style={{ fontSize: spec.totalFontSize, fontWeight: spec.totalFontWeight }}>{idr(total)}</p>
          {saving > 0 && <p data-layer="Bottom bar / Hemat" className="m-0 text-[12px] leading-4 font-medium text-[#15803D]">Hemat {idr(saving)}</p>}
        </div>
        <ActionButton spec={spec} onClick={onPay} busy={paying} width={156} layer="Button / Bayar">
          {paying ? 'Memproses…' : 'Bayar'}
        </ActionButton>
      </div>
    </div>
  );
};

const SummaryLine: React.FC<{ label: string; value: string; positive?: boolean }> = ({ label, value, positive }) => (
  <div data-layer="Ringkasan / Row" className="flex items-center justify-between gap-3">
    <span className="text-[13px] leading-5 text-[#64748B]">{label}</span>
    <span className={`text-[13px] leading-5 tabular-nums ${positive ? 'font-medium text-[#15803D]' : 'text-[#0F172A]'}`}>{value}</span>
  </div>
);

// ── Voucher sheet ───────────────────────────────────────────────────────────

export interface VoucherSheetProps {
  spec: BuildSpec;
  subtotal: number;
  selected: string | null;
  code: string;
  codeError?: boolean;
  inFrame?: boolean;
  onSelect?: (code: string) => void;
  onCodeChange?: (v: string) => void;
  onSubmitCode?: () => void;
  onApply?: () => void;
  onClose?: () => void;
}

export const VoucherCard: React.FC<{
  spec: BuildSpec; voucher: Voucher; subtotal: number; selected: boolean; onSelect?: () => void;
}> = ({ spec, voucher, subtotal, selected, onSelect }) => {
  const short = voucher.minSpend - subtotal;
  const ineligible = short > 0;
  const locked = ineligible && spec.ineligibleState;
  return (
    <button
      type="button"
      data-layer={locked ? 'Voucher card / Tidak memenuhi syarat' : selected ? 'Voucher card / Selected' : 'Voucher card / Default'}
      onClick={locked ? undefined : onSelect}
      aria-disabled={locked || undefined}
      aria-pressed={selected}
      className={`w-full flex items-stretch rounded-[12px] overflow-hidden text-left p-0 border border-solid ${locked ? 'cursor-not-allowed bg-[#F8FAFC] border-[#E2E8F0]' : 'cursor-pointer bg-white'} ${
        selected && !locked ? 'border-[#C2410C] shadow-[0_0_0_1px_#C2410C]' : 'border-[#E2E8F0]'
      }`}
    >
      <span className="w-16 flex items-center justify-center shrink-0" style={{ background: locked ? '#E2E8F0' : '#FFEDD5' }}>
        <TicketPercent size={24} color={locked ? C.muted : C.brand} />
      </span>
      <span className="flex-1 min-w-0 px-3 py-3" style={{ opacity: locked ? 0.6 : 1 }}>
        <span data-layer="Voucher / Judul" className="block text-[14px] leading-5 font-semibold text-[#0F172A]">{voucher.title}</span>
        <span data-layer="Voucher / Syarat" className="block text-[12px] leading-4 text-[#64748B]">{voucher.detail} · {voucher.code}</span>
        <span data-layer="Voucher / Berlaku" className="block mt-1 text-[11px] leading-4 text-[#94A3B8]">{voucher.expires}</span>
        {locked && (
          <span data-layer="Voucher / Alasan" className="block mt-1.5 text-[12px] leading-4 font-medium text-[#B45309]">
            Belanja {idr(short)} lagi untuk pakai voucher ini
          </span>
        )}
      </span>
      {!locked && (
        <span className="flex items-center pr-3">
          <span
            data-layer="Radio"
            className="w-5 h-5 rounded-full flex items-center justify-center border-2 border-solid"
            style={{ borderColor: selected ? C.link : '#CBD5E1', background: selected ? C.link : '#FFFFFF' }}
          >
            {selected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
          </span>
        </span>
      )}
    </button>
  );
};

export const VoucherSheet: React.FC<VoucherSheetProps> = ({
  spec, subtotal, selected, code, codeError, inFrame, onSelect, onCodeChange, onSubmitCode, onApply, onClose,
}) => {
  const showInline = !!codeError && spec.inlineCodeError;
  return (
    <div className={`${inFrame ? 'absolute' : 'fixed'} inset-0 z-40 flex items-end justify-center`}>
      <div className="absolute inset-0 bg-[rgba(15,23,42,0.5)]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Pilih Voucher"
        data-layer="Bottom sheet / Voucher"
        className="relative w-full max-w-[420px] bg-white rounded-t-[16px] font-ld-sans text-[#0F172A] max-h-[85%] flex flex-col"
      >
        <div className="pt-2 flex justify-center"><span className="w-10 h-1 rounded-full bg-[#CBD5E1]" /></div>
        <div data-layer="Sheet / Header" className="flex items-center justify-between px-4 pt-2 pb-3">
          <h2 data-layer="Sheet / Title" className="m-0 text-[16px] leading-6 font-semibold">Pilih Voucher</h2>
          <button type="button" aria-label="Tutup" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-none cursor-pointer text-[#64748B]"><X size={20} /></button>
        </div>

        <div className="px-4 overflow-y-auto">
          <div data-layer="Kode / Field" className="flex gap-2">
            <input
              data-layer="Kode / Input"
              value={code}
              onChange={(e) => onCodeChange?.(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSubmitCode?.(); }}
              placeholder="Masukkan kode voucher"
              aria-invalid={showInline || undefined}
              aria-describedby={showInline ? 'voucher-code-error' : undefined}
              readOnly={inFrame}
              className="flex-1 min-w-0 h-11 px-3 rounded-[8px] border border-solid bg-white text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] uppercase placeholder:normal-case focus:outline-none"
              style={{ borderColor: showInline ? C.danger : C.border }}
            />
            <button
              type="button"
              data-layer="Kode / Pakai"
              onClick={onSubmitCode}
              className="h-11 px-4 rounded-[8px] bg-white border border-solid text-[14px] font-semibold cursor-pointer"
              style={{ borderColor: spec.ctaColor, color: spec.ctaColor }}
            >
              Pakai
            </button>
          </div>
          {showInline && (
            <p id="voucher-code-error" role="alert" data-layer="Kode / Error" className="m-0 mt-1.5 text-[12px] leading-4 text-[#DC2626]">
              Kode voucher tidak ditemukan. Cek lagi penulisannya.
            </p>
          )}

          <p data-layer="Sheet / Subtitle" className="m-0 mt-4 mb-2 text-[12px] leading-4 font-medium text-[#64748B]">Voucher tersedia</p>
          <div data-layer="Voucher list" className="flex flex-col gap-3 pb-4">
            {VOUCHERS.map((v) => (
              <VoucherCard key={v.code} spec={spec} voucher={v} subtotal={subtotal} selected={selected === v.code} onSelect={() => onSelect?.(v.code)} />
            ))}
          </div>
        </div>

        <div data-layer="Sheet / Footer" className="px-4 py-3 border-t border-solid border-[#E2E8F0] border-x-0 border-b-0">
          <ActionButton spec={spec} onClick={onApply} width="100%" layer="Button / Pakai Voucher">Pakai Voucher</ActionButton>
        </div>
      </div>
    </div>
  );
};
