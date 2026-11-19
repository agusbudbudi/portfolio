import React from 'react';
import { Clock, Plus, Send } from 'lucide-react';
import SplitBillLogo from '../SplitBillLogo';
import DompetKuLogo from '../DompetKuLogo';
import BalanceCardIllustration from '../BalanceCardIllustration';

// Miniature phone mockups of each project's practice app, shown on the
// "Pilih project" cards so learners see what they'll be testing. Purely
// decorative (aria-hidden): numbers are sample data, not the real sandbox.

// iPhone-like proportions (~9:19.5 screen, thin bezel, dynamic island,
// side buttons) so the mockups read as a real phone, not a tablet.
const Phone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div aria-hidden="true" className="relative w-[164px] h-[340px] select-none">
    {/* side buttons */}
    <span className="absolute -left-[2px] top-[62px] w-[3px] h-5 rounded-l bg-ld-graphite" />
    <span className="absolute -left-[2px] top-[92px] w-[3px] h-8 rounded-l bg-ld-graphite" />
    <span className="absolute -left-[2px] top-[128px] w-[3px] h-8 rounded-l bg-ld-graphite" />
    <span className="absolute -right-[2px] top-[100px] w-[3px] h-12 rounded-r bg-ld-graphite" />
    <div className="relative h-full rounded-[30px] bg-ld-onyx p-[4px] shadow-[0_18px_40px_-12px_rgba(16,24,40,0.35)]">
      <div className="relative h-full rounded-[26px] bg-white overflow-hidden">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-11 h-3 rounded-full bg-ld-onyx z-10" />
        <div className="h-full pt-7 px-2.5 font-ld-sans text-slate-900">{children}</div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-ld-onyx/80" />
      </div>
    </div>
  </div>
);

const SPLIT_ROWS = [
  { name: 'Gua', amount: '137.500', color: 'bg-teal-500' },
  { name: 'Andi', amount: '145.000', color: 'bg-amber-400' },
  { name: 'Sari', amount: '130.000', color: 'bg-rose-400' },
];

export const SplitBillMockup: React.FC = () => (
  <Phone>
    <div className="flex items-center gap-1 mb-2">
      <SplitBillLogo size={14} />
      <span className="text-[9px] font-bold">Split<span className="text-teal-600">Bill</span></span>
    </div>
    <div className="rounded-md border border-slate-200 p-2">
      <p className="m-0 text-[6.5px] text-slate-500">Makan malam · Grand Total</p>
      <p className="m-0 text-[13px] font-bold tabular-nums leading-tight">Rp 412.500</p>
      <div className="mt-1.5 pt-1 border-t border-slate-100 grid grid-cols-2 text-[6px] text-slate-500 gap-y-0.5">
        <span>Subtotal</span><span className="text-right tabular-nums">Rp 375.000</span>
        <span>Service 5%</span><span className="text-right tabular-nums">Rp 18.750</span>
        <span>Pajak 5%</span><span className="text-right tabular-nums">Rp 18.750</span>
      </div>
    </div>
    <ul className="m-0 mt-1.5 p-0 list-none space-y-1">
      {SPLIT_ROWS.map((r) => (
        <li key={r.name} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-1.5 py-1">
          <span className={`w-3.5 h-3.5 rounded-full ${r.color} text-white text-[6px] font-bold flex items-center justify-center`}>{r.name[0]}</span>
          <span className="flex-1 text-[7.5px] font-semibold">{r.name}</span>
          <span className="text-[7.5px] font-bold text-teal-700 tabular-nums">Rp {r.amount}</span>
        </li>
      ))}
    </ul>
    <div className="mt-1.5 rounded-md bg-[#25d366] py-1.5 text-center text-[7.5px] font-semibold text-white">Share ke WhatsApp</div>
  </Phone>
);

const TXNS = [
  { label: 'Transfer ke Budi', amount: '−Rp 25.000', out: true },
  { label: 'Top up VA BCA', amount: '+Rp 100.000', out: false },
  { label: 'Transfer ke Sari', amount: '−Rp 50.000', out: true },
];

export const DompetKuMockup: React.FC = () => (
  <Phone>
    <div className="flex items-center gap-1 mb-2">
      <DompetKuLogo size={14} />
      <span className="text-[9px] font-bold">Dompet<span className="text-indigo-600">Ku</span></span>
    </div>
    <div className="relative overflow-hidden rounded-md bg-indigo-600 text-white p-2">
      <span className="absolute -top-8 -right-6 w-20 h-20 rounded-full bg-white/[0.07]" />
      <span className="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-white/[0.06]" />
      <BalanceCardIllustration rings={false} className="absolute right-1 top-1/2 -translate-y-1/2 h-[64%] w-auto" />
      <div className="relative">
        <p className="m-0 text-[6.5px] text-indigo-100">Saldo DompetKu</p>
        <p className="m-0 text-[13px] font-bold tabular-nums leading-tight">Rp 1.250.000</p>
        <span className="inline-block mt-1 rounded-sm bg-white/15 px-1 text-[5.5px] text-indigo-50">Akun basic</span>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1 mt-1.5">
      {([['Top Up', Plus], ['Transfer', Send], ['Riwayat', Clock]] as const).map(([label, Icon]) => (
        <div key={label} className="flex flex-col items-center gap-0.5 rounded-md border border-slate-200 py-1.5">
          <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Icon size={8} /></span>
          <span className="text-[6px] font-medium">{label}</span>
        </div>
      ))}
    </div>
    <p className="m-0 mt-2 mb-1 text-[7px] font-semibold">Transaksi terakhir</p>
    <ul className="m-0 p-0 list-none rounded-md border border-slate-200 divide-y divide-slate-100">
      {TXNS.map((t) => (
        <li key={t.label} className="flex items-center gap-1 px-1.5 py-1">
          <span className={`w-3 h-3 rounded-full shrink-0 ${t.out ? 'bg-rose-100' : 'bg-emerald-100'}`} />
          <span className="flex-1 text-[6.5px] truncate">{t.label}</span>
          <span className={`text-[6.5px] font-semibold tabular-nums ${t.out ? 'text-slate-700' : 'text-emerald-600'}`}>{t.amount}</span>
        </li>
      ))}
    </ul>
  </Phone>
);

const CART = [
  { name: 'Sepatu Lari Pro', price: '459.000', color: 'bg-orange-200' },
  { name: 'Kaos Dry-Fit', price: '129.000', color: 'bg-sky-200' },
];

export const TokoKitaMockup: React.FC = () => (
  <Phone>
    <div className="flex items-center gap-1 mb-2">
      <span className="w-3.5 h-3.5 rounded-[4px] bg-orange-500 text-white text-[7px] font-bold flex items-center justify-center">T</span>
      <span className="text-[9px] font-bold">Toko<span className="text-orange-500">Kita</span></span>
      <span className="ml-auto text-[6.5px] text-slate-500">Checkout</span>
    </div>
    <ul className="m-0 p-0 list-none space-y-1">
      {CART.map((c) => (
        <li key={c.name} className="flex items-center gap-1.5 rounded-md border border-slate-200 p-1.5">
          <span className={`w-6 h-6 rounded ${c.color} shrink-0`} />
          <span className="flex-1 min-w-0">
            <span className="block text-[7px] font-semibold truncate">{c.name}</span>
            <span className="block text-[6.5px] text-slate-500">1 × Rp {c.price}</span>
          </span>
        </li>
      ))}
    </ul>
    <div className="mt-1.5 flex items-center gap-1 rounded-md border border-dashed border-orange-300 bg-orange-50 px-1.5 py-1">
      <span className="text-[6.5px] font-semibold text-orange-600">VOUCHER</span>
      <span className="flex-1 text-[6.5px] text-orange-700">1111HEMAT · −Rp 50.000</span>
    </div>
    <div className="mt-1.5 rounded-md border border-slate-200 p-1.5 grid grid-cols-2 gap-y-0.5 text-[6.5px] text-slate-500">
      <span>Subtotal</span><span className="text-right tabular-nums">Rp 588.000</span>
      <span>Ongkir</span><span className="text-right tabular-nums">Rp 18.000</span>
      <span>Diskon</span><span className="text-right tabular-nums text-emerald-600">−Rp 50.000</span>
      <span className="font-semibold text-slate-900">Total</span><span className="text-right tabular-nums font-bold text-slate-900">Rp 556.000</span>
    </div>
    <div className="mt-1.5 rounded-md bg-orange-500 py-1.5 text-center text-[7.5px] font-semibold text-white">Bayar sekarang</div>
  </Phone>
);
