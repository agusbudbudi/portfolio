import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy, ExternalLink, Frame, MousePointer2, Ruler, StickyNote, ZoomIn, ZoomOut } from 'lucide-react';
import Seo from '../../../components/common/Seo';
import { ActionButton, CheckoutScreen, QtyStepper, VoucherCard, VoucherSheet } from '../sandbox/tokokita/CheckoutUI';
import { CART, DESIGN_SPEC, VOUCHERS, subtotalOf } from '../sandbox/tokokita/spec';

// ─────────────────────────────────────────────────────────────────────────────
// QA Simulator — TokoKita design file (a Figma "Dev Mode"-like viewer).
// Frames are rendered live from DESIGN_SPEC with the same components as the
// staging build, so the inspect panel (getComputedStyle) shows exactly what
// the designer specified. The learner compares it against the staging build
// at /qa-simulator/sandbox/tokokita.
// ─────────────────────────────────────────────────────────────────────────────

const spec = DESIGN_SPEC;
const SUBTOTAL = subtotalOf(CART);
const PHONE_H = 812;

interface FrameDef {
  id: string;
  name: string;
  width: number;
  height?: number;
  notes: string[];
  render: () => React.ReactNode;
}

const COLOR_TOKENS: [string, string][] = [
  ['Primary / Action', '#C2410C'],
  ['Primary / Pressed', '#9A3412'],
  ['Brand / Orange', '#F97316'],
  ['Text / Primary', '#0F172A'],
  ['Text / Secondary', '#64748B'],
  ['Text / Muted', '#94A3B8'],
  ['Success', '#15803D'],
  ['Danger', '#DC2626'],
  ['Warning / Text', '#B45309'],
  ['Border', '#E2E8F0'],
  ['Surface / Page', '#F1F5F9'],
  ['Disabled', '#CBD5E1'],
];

const TYPE_TOKENS: { name: string; size: number; weight: number; line: number }[] = [
  { name: 'Heading / Page', size: 16, weight: 600, line: 24 },
  { name: 'Price / Total', size: 18, weight: 700, line: 24 },
  { name: 'Body / Strong', size: 14, weight: 600, line: 20 },
  { name: 'Body / Regular', size: 14, weight: 400, line: 20 },
  { name: 'Body / Small', size: 13, weight: 400, line: 20 },
  { name: 'Caption', size: 12, weight: 400, line: 16 },
];

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative overflow-hidden bg-[#F1F5F9]" style={{ height: PHONE_H }}>{children}</div>
);

const FRAMES: FrameDef[] = [
  {
    id: 'checkout',
    name: '01 Checkout — Default',
    width: 375,
    notes: [
      'Bottom bar **sticky**: selalu menempel di bawah layar walau konten di-scroll.',
      'Detail alamat maksimal **2 baris**. Sisanya dipotong dengan ellipsis (…).',
      'Spacing antar section 12, padding dalam section 16.',
    ],
    render: () => <CheckoutScreen spec={spec} inFrame />,
  },
  {
    id: 'voucher',
    name: '02 Voucher — Pilih voucher',
    width: 375,
    height: PHONE_H,
    notes: [
      'Voucher yang belum memenuhi min. belanja **tidak bisa dipilih**. Tampilkan kekurangan belanjanya.',
      'Hanya 1 voucher per transaksi. Tap voucher terpilih untuk membatalkan pilihan.',
    ],
    render: () => (
      <PhoneFrame>
        <CheckoutScreen spec={spec} inFrame />
        <VoucherSheet spec={spec} subtotal={SUBTOTAL} selected="1111HEMAT" code="" inFrame />
      </PhoneFrame>
    ),
  },
  {
    id: 'voucher-error',
    name: '03 Voucher — Kode tidak valid',
    width: 375,
    height: PHONE_H,
    notes: [
      'Kode salah: pesan error **inline** di bawah field + border merah. Jangan pakai toast.',
      'Error hilang saat user mulai mengetik ulang.',
    ],
    render: () => (
      <PhoneFrame>
        <CheckoutScreen spec={spec} inFrame />
        <VoucherSheet spec={spec} subtotal={SUBTOTAL} selected="1111HEMAT" code="HEMAT99" codeError inFrame />
      </PhoneFrame>
    ),
  },
  {
    id: 'components',
    name: '04 Komponen & state',
    width: 375,
    notes: [
      'Tap target stepper minimal **32×32**.',
      'Tombol utama pakai **Primary / Action**, bukan Brand / Orange: teks putih di atas Brand / Orange kontrasnya kurang dari 4.5:1.',
    ],
    render: () => (
      <div className="bg-white p-6 font-ld-sans text-[#0F172A] space-y-6">
        <ComponentGroup title="Button / Primary">
          <div className="flex flex-col gap-3">
            <StateRow label="Default"><ActionButton spec={spec} width={156}>Bayar</ActionButton></StateRow>
            <StateRow label="Pressed"><ActionButton spec={spec} width={156} pressed>Bayar</ActionButton></StateRow>
            <StateRow label="Disabled"><ActionButton spec={spec} width={156} disabled>Bayar</ActionButton></StateRow>
          </div>
        </ComponentGroup>
        <ComponentGroup title="Qty stepper">
          <div className="flex flex-col gap-3">
            <StateRow label="Default"><QtyStepper spec={spec} qty={2} /></StateRow>
            <StateRow label="Min (qty 1)"><QtyStepper spec={spec} qty={1} /></StateRow>
          </div>
        </ComponentGroup>
        <ComponentGroup title="Voucher card">
          <div className="flex flex-col gap-3">
            <VoucherCard spec={spec} voucher={VOUCHERS[1]} subtotal={SUBTOTAL} selected={false} />
            <VoucherCard spec={spec} voucher={VOUCHERS[0]} subtotal={SUBTOTAL} selected />
            <VoucherCard spec={spec} voucher={VOUCHERS[2]} subtotal={SUBTOTAL} selected={false} />
          </div>
        </ComponentGroup>
      </div>
    ),
  },
  {
    id: 'tokens',
    name: '05 Design tokens',
    width: 375,
    notes: ['Font: Inter. Semua angka harga pakai tabular numbers.'],
    render: () => (
      <div className="bg-white p-6 font-ld-sans text-[#0F172A] space-y-6">
        <ComponentGroup title="Color">
          <div className="grid grid-cols-2 gap-3">
            {COLOR_TOKENS.map(([name, hex]) => (
              <div key={name} data-layer={`Color / ${name}`} className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-[6px] border border-solid border-[#E2E8F0] shrink-0" style={{ background: hex }} />
                <span className="min-w-0">
                  <span className="block text-[12px] leading-4 font-medium truncate">{name}</span>
                  <span className="block text-[11px] leading-4 text-[#64748B] font-ld-mono">{hex}</span>
                </span>
              </div>
            ))}
          </div>
        </ComponentGroup>
        <ComponentGroup title="Typography">
          <div className="flex flex-col gap-3">
            {TYPE_TOKENS.map((t) => (
              <div key={t.name} data-layer={`Type / ${t.name}`} className="flex items-baseline justify-between gap-3">
                <span style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: `${t.line}px` }}>{t.name}</span>
                <span className="text-[11px] text-[#64748B] font-ld-mono shrink-0">{t.size}/{t.line} · {t.weight}</span>
              </div>
            ))}
          </div>
        </ComponentGroup>
        <ComponentGroup title="Spacing & radius">
          <ul className="m-0 pl-4 text-[13px] leading-5 text-[#64748B] space-y-1">
            <li>Section gap 12 · section padding 16</li>
            <li>Radius: tombol 12 · kartu voucher 12 · field & thumbnail 8 · badge 4</li>
            <li>Tinggi tombol utama 48 · field 44</li>
          </ul>
        </ComponentGroup>
      </div>
    ),
  },
];

const ComponentGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <p className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">{title}</p>
    {children}
  </div>
);

const StateRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-4">
    <span className="w-24 text-[12px] text-[#64748B] shrink-0">{label}</span>
    {children}
  </div>
);

// ── Inspect helpers ─────────────────────────────────────────────────────────

interface Box { x: number; y: number; w: number; h: number }
interface Line { x1: number; y1: number; x2: number; y2: number; label: number }

const r1 = (n: number) => Math.round(n * 10) / 10;
const px = (v: string) => r1(parseFloat(v) || 0);

function toHex(color: string): string {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  const [r, g, b, a = 1] = parts;
  const hex = `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  return a < 1 ? `${hex} · ${Math.round(a * 100)}%` : hex;
}

const isTransparent = (c: string) => c === 'transparent' || /rgba?\([^)]*,\s*0\)$/.test(c) || /\/\s*0\)$/.test(c);

function measure(a: Box, b: Box): Line[] {
  const lines: Line[] = [];
  const contains = (o: Box, i: Box) => i.x >= o.x - 0.5 && i.y >= o.y - 0.5 && i.x + i.w <= o.x + o.w + 0.5 && i.y + i.h <= o.y + o.h + 0.5;
  const [outer, inner] = contains(a, b) ? [a, b] : contains(b, a) ? [b, a] : [null, null];
  if (outer && inner) {
    const cx = inner.x + inner.w / 2;
    const cy = inner.y + inner.h / 2;
    const top = inner.y - outer.y;
    const bottom = outer.y + outer.h - (inner.y + inner.h);
    const left = inner.x - outer.x;
    const right = outer.x + outer.w - (inner.x + inner.w);
    if (top > 0.5) lines.push({ x1: cx, y1: outer.y, x2: cx, y2: inner.y, label: top });
    if (bottom > 0.5) lines.push({ x1: cx, y1: inner.y + inner.h, x2: cx, y2: outer.y + outer.h, label: bottom });
    if (left > 0.5) lines.push({ x1: outer.x, y1: cy, x2: inner.x, y2: cy, label: left });
    if (right > 0.5) lines.push({ x1: inner.x + inner.w, y1: cy, x2: outer.x + outer.w, y2: cy, label: right });
    return lines;
  }
  const ox = Math.max(a.x, b.x) < Math.min(a.x + a.w, b.x + b.w);
  const oy = Math.max(a.y, b.y) < Math.min(a.y + a.h, b.y + b.h);
  const midX = ox ? (Math.max(a.x, b.x) + Math.min(a.x + a.w, b.x + b.w)) / 2 : a.x + a.w / 2;
  const midY = oy ? (Math.max(a.y, b.y) + Math.min(a.y + a.h, b.y + b.h)) / 2 : a.y + a.h / 2;
  if (a.y + a.h <= b.y) lines.push({ x1: midX, y1: a.y + a.h, x2: midX, y2: b.y, label: b.y - (a.y + a.h) });
  else if (b.y + b.h <= a.y) lines.push({ x1: midX, y1: b.y + b.h, x2: midX, y2: a.y, label: a.y - (b.y + b.h) });
  if (a.x + a.w <= b.x) lines.push({ x1: a.x + a.w, y1: midY, x2: b.x, y2: midY, label: b.x - (a.x + a.w) });
  else if (b.x + b.w <= a.x) lines.push({ x1: b.x + b.w, y1: midY, x2: a.x, y2: midY, label: a.x - (b.x + b.w) });
  return lines;
}

interface Inspected {
  name: string;
  frame: string;
  box: Box;
  frameBox: Box;
  props: { group: string; rows: [string, string, string?][] }[];
  css: string;
  text: string | null;
}

function inspect(el: HTMLElement, toBox: (e: Element) => Box): Inspected {
  const cs = getComputedStyle(el);
  const box = toBox(el);
  const frameEl = el.closest('[data-frame]');
  const frameBox = frameEl ? toBox(frameEl) : box;
  const props: Inspected['props'] = [];
  const css: string[] = [`width: ${r1(box.w)}px;`, `height: ${r1(box.h)}px;`];

  const layout: [string, string, string?][] = [];
  const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(px);
  if (pad.some((p) => p > 0)) {
    const v = pad.every((p) => p === pad[0]) ? `${pad[0]}` : pad[0] === pad[2] && pad[1] === pad[3] ? `${pad[0]} ${pad[1]}` : pad.join(' ');
    layout.push(['Padding', v]);
    css.push(`padding: ${v.split(' ').map((n) => `${n}px`).join(' ')};`);
  }
  if (cs.display.includes('flex') || cs.display.includes('grid')) {
    const gap = px(cs.rowGap) || px(cs.columnGap);
    layout.push(['Layout', cs.display.includes('grid') ? 'Grid' : cs.flexDirection === 'column' ? 'Vertical' : 'Horizontal']);
    if (gap > 0) { layout.push(['Gap', `${gap}`]); css.push(`gap: ${gap}px;`); }
  }
  if (layout.length) props.push({ group: 'Auto layout', rows: layout });

  const fill: [string, string, string?][] = [];
  if (!isTransparent(cs.backgroundColor)) {
    fill.push(['Fill', toHex(cs.backgroundColor), cs.backgroundColor]);
    css.push(`background: ${toHex(cs.backgroundColor).split(' ')[0]};`);
  }
  const bw = Math.max(px(cs.borderTopWidth), px(cs.borderRightWidth), px(cs.borderBottomWidth), px(cs.borderLeftWidth));
  if (bw > 0) {
    const side = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(px);
    const which = side.every((s) => s === bw) ? '' : ` (${['atas', 'kanan', 'bawah', 'kiri'].filter((_, i) => side[i] > 0).join(', ')})`;
    const color = px(cs.borderTopWidth) ? cs.borderTopColor : px(cs.borderBottomWidth) ? cs.borderBottomColor : cs.borderLeftColor;
    fill.push(['Stroke', `${bw} ${cs.borderTopStyle === 'dashed' ? 'dashed ' : ''}${toHex(color)}${which}`, color]);
    css.push(`border: ${bw}px ${cs.borderTopStyle} ${toHex(color).split(' ')[0]};`);
  }
  const radius = px(cs.borderTopLeftRadius);
  if (radius > 0) {
    const all = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map(px);
    const v = all.every((x) => x === radius) ? `${radius}` : all.join(' ');
    fill.push(['Radius', v]);
    css.push(`border-radius: ${v.split(' ').map((n) => `${n}px`).join(' ')};`);
  }
  if (cs.boxShadow && cs.boxShadow !== 'none') fill.push(['Shadow', cs.boxShadow]);
  if (parseFloat(cs.opacity) < 1) fill.push(['Opacity', `${Math.round(parseFloat(cs.opacity) * 100)}%`]);
  if (fill.length) props.push({ group: 'Appearance', rows: fill });

  const ownText = Array.from(el.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent ?? '').join('').trim();
  const isField = el instanceof HTMLInputElement;
  let text: string | null = null;
  if (ownText || isField) {
    const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const lh = cs.lineHeight === 'normal' ? 'Auto' : `${px(cs.lineHeight)}`;
    const rows: [string, string, string?][] = [
      ['Font', family],
      ['Size', `${px(cs.fontSize)}`],
      ['Weight', cs.fontWeight],
      ['Line height', lh],
      ['Color', toHex(cs.color), cs.color],
    ];
    if (cs.textDecorationLine && cs.textDecorationLine !== 'none') rows.push(['Decoration', cs.textDecorationLine]);
    if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none') rows.push(['Max lines', cs.webkitLineClamp]);
    props.push({ group: 'Typography', rows });
    css.push(`font: ${cs.fontWeight} ${px(cs.fontSize)}px/${lh === 'Auto' ? 'normal' : `${lh}px`} ${family};`, `color: ${toHex(cs.color).split(' ')[0]};`);
    text = el instanceof HTMLInputElement ? (el.value || el.placeholder) : ownText;
  }

  return {
    name: el.dataset.layer ?? el.tagName.toLowerCase(),
    frame: (frameEl as HTMLElement | null)?.dataset.frame ?? '',
    box,
    frameBox,
    props,
    css: css.join('\n'),
    text,
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

const ZOOMS = [0.5, 0.75, 1];

const TokoKitaDesignPage: React.FC = () => {
  const [zoom, setZoom] = useState(() => (typeof window !== 'undefined' && window.innerWidth >= 1700 ? 1 : 0.75));
  const [showNotes, setShowNotes] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  // Measured in event handlers (in unscaled canvas coordinates, so zooming
  // doesn't invalidate them).
  const hoverElRef = useRef<HTMLElement | null>(null);
  const selElRef = useRef<HTMLElement | null>(null);
  const [hoverBox, setHoverBox] = useState<Box | null>(null);
  const [selected, setSelected] = useState<Inspected | null>(null);
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setNatural({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { selElRef.current = null; setSelected(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toBox = useCallback((e: Element): Box => {
    const root = contentRef.current!.getBoundingClientRect();
    const r = e.getBoundingClientRect();
    return { x: (r.left - root.left) / zoom, y: (r.top - root.top) / zoom, w: r.width / zoom, h: r.height / zoom };
  }, [zoom]);

  const pick = (e: React.MouseEvent): HTMLElement | null => {
    const root = contentRef.current;
    if (!root) return null;
    for (const el of document.elementsFromPoint(e.clientX, e.clientY)) {
      if (!root.contains(el) || (el as HTMLElement).dataset.overlay !== undefined) continue;
      const layer = el.closest<HTMLElement>('[data-layer]');
      if (layer && root.contains(layer)) return layer;
    }
    return null;
  };

  const onMove = (e: React.MouseEvent) => {
    const el = pick(e);
    if (el === hoverElRef.current) return;
    hoverElRef.current = el;
    setHoverBox(el && el !== selElRef.current ? toBox(el) : null);
  };
  const onLeave = () => { hoverElRef.current = null; setHoverBox(null); };
  const onPick = (e: React.MouseEvent) => {
    const el = pick(e);
    selElRef.current = el;
    setSelected(el ? inspect(el, toBox) : null);
    setHoverBox(null);
  };

  const lines = selected && hoverBox ? measure(selected.box, hoverBox) : [];

  const copyCss = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.css);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const scrollToFrame = (id: string) => {
    document.getElementById(`frame-${id}`)?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'start' });
  };

  return (
    <div className="h-screen flex flex-col bg-[#1E1E1E] font-ld-sans text-[#E5E5E5] overflow-hidden">
      <Seo path="/qa-simulator/sandbox/tokokita-design" title="TokoKita — Checkout v2 (File desain) | QA Simulator" description="File desain simulasi untuk latihan design review QA Simulator." noindex />

      {/* Toolbar */}
      <header className="h-12 shrink-0 flex items-center gap-3 px-3 border-b border-[#2C2C2C] bg-[#2C2C2C] text-[13px]">
        <Link to="/qa-simulator/ecommerce?phase=design-review" className="inline-flex items-center gap-1 text-[#B3B3B3] hover:text-white no-underline">
          <ArrowLeft size={14} /> <span className="hidden sm:inline">QA Simulator</span>
        </Link>
        <span className="w-px h-5 bg-[#444]" />
        <span className="min-w-0 truncate">
          <span className="text-[#8C8C8C]">TokoKita / </span>
          <span className="font-semibold text-white">Checkout v2 — Kampanye 11.11</span>
        </span>
        <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#14532D] text-[#86EFAC] text-[11px] font-semibold">
          <Check size={11} /> Ready for dev
        </span>
        <span className="ml-auto flex items-center gap-1">
          <button type="button" aria-label="Perkecil" onClick={() => setZoom((z) => ZOOMS[Math.max(0, ZOOMS.indexOf(z) - 1)])} className="w-8 h-8 flex items-center justify-center rounded bg-transparent border-none text-[#B3B3B3] hover:bg-[#3A3A3A] cursor-pointer"><ZoomOut size={15} /></button>
          <span className="w-11 text-center tabular-nums text-[12px]">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Perbesar" onClick={() => setZoom((z) => ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(z) + 1)])} className="w-8 h-8 flex items-center justify-center rounded bg-transparent border-none text-[#B3B3B3] hover:bg-[#3A3A3A] cursor-pointer"><ZoomIn size={15} /></button>
          <a href="/qa-simulator/sandbox/tokokita" target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-1 ml-2 px-2.5 py-1.5 rounded bg-[#0D99FF] text-white text-[12px] font-semibold no-underline hover:bg-[#0B84DD]">
            Buka build staging <ExternalLink size={12} />
          </a>
        </span>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Layers */}
        <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-[#2C2C2C] bg-[#252525] text-[12px]">
          <p className="m-0 px-3 pt-3 pb-2 text-[11px] font-semibold text-[#8C8C8C]">Frames</p>
          <ul className="m-0 p-0 list-none">
            {FRAMES.map((f) => (
              <li key={f.id}>
                <button type="button" onClick={() => scrollToFrame(f.id)} className="w-full flex items-center gap-2 px-3 py-1.5 bg-transparent border-none text-left text-[#E5E5E5] hover:bg-[#333] cursor-pointer">
                  <Frame size={12} className="text-[#8C8C8C] shrink-0" /> <span className="truncate">{f.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <label className="mt-3 mx-3 flex items-center gap-2 text-[#B3B3B3] cursor-pointer">
            <input type="checkbox" checked={showNotes} onChange={(e) => setShowNotes(e.target.checked)} className="accent-[#0D99FF]" />
            <StickyNote size={12} /> Tampilkan anotasi
          </label>
          <div className="mt-auto m-3 p-3 rounded bg-[#2C2C2C] text-[11px] leading-relaxed text-[#B3B3B3] space-y-1.5">
            <p className="m-0 flex gap-1.5"><MousePointer2 size={12} className="shrink-0 mt-0.5" /> Klik elemen untuk melihat spec-nya.</p>
            <p className="m-0 flex gap-1.5"><Ruler size={12} className="shrink-0 mt-0.5" /> Pilih satu elemen, lalu arahkan kursor ke elemen lain untuk mengukur jarak.</p>
            <p className="m-0">Esc untuk batal pilih.</p>
          </div>
        </aside>

        {/* Canvas */}
        <main className="relative flex-1 min-h-0 min-w-0 overflow-auto bg-[#E5E5E5]">
          <div style={{ width: natural.w * zoom, height: natural.h * zoom }}>
            <div
              ref={contentRef}
              className="relative inline-flex items-start gap-20 p-16"
              style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }}
            >
              {FRAMES.map((f) => (
                <div key={f.id} id={`frame-${f.id}`} className="shrink-0 scroll-m-8" style={{ width: f.width }}>
                  <p className="m-0 mb-2 text-[13px] text-[#555] font-medium">{f.name}</p>
                  <div data-frame={f.name} data-layer={f.name} className="relative bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)]" style={{ width: f.width, height: f.height }}>
                    {f.render()}
                  </div>
                  {showNotes && f.notes.length > 0 && (
                    <div className="mt-5 space-y-2.5">
                      {f.notes.map((n, i) => (
                        <div key={i} className="rounded-sm bg-[#FFF3B0] px-3 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.15)] text-[13px] leading-snug text-[#3D3200]">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#8A7300] mb-0.5">Catatan desainer</span>
                          <NoteText text={n} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Capture layer: frames are static, so swallow all interaction and hit-test ourselves. */}
              <div
                data-overlay=""
                className="absolute inset-0 z-[70] cursor-default"
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                onClick={onPick}
              />

              {/* Overlays (in unscaled canvas coordinates) */}
              <div className="pointer-events-none absolute inset-0 z-[80]" aria-hidden="true">
                {hoverBox && <div className="absolute border border-[#0D99FF]" style={{ left: hoverBox.x, top: hoverBox.y, width: hoverBox.w, height: hoverBox.h }} />}
                {selected && (
                  <>
                    <div className="absolute border-2 border-[#0D99FF]" style={{ left: selected.box.x - 1, top: selected.box.y - 1, width: selected.box.w + 2, height: selected.box.h + 2 }} />
                    <span className="absolute px-1.5 py-0.5 rounded bg-[#0D99FF] text-white text-[11px] font-semibold tabular-nums whitespace-nowrap" style={{ left: selected.box.x + selected.box.w / 2, top: selected.box.y + selected.box.h + 6, transform: 'translateX(-50%)' }}>
                      {r1(selected.box.w)} × {r1(selected.box.h)}
                    </span>
                  </>
                )}
                {lines.map((l, i) => {
                  const vertical = l.x1 === l.x2;
                  return (
                    <React.Fragment key={i}>
                      <div className="absolute bg-[#F24822]" style={vertical
                        ? { left: l.x1 - 0.5, top: l.y1, width: 1, height: l.y2 - l.y1 }
                        : { left: l.x1, top: l.y1 - 0.5, width: l.x2 - l.x1, height: 1 }} />
                      <span className="absolute px-1 rounded bg-[#F24822] text-white text-[11px] font-semibold tabular-nums" style={{
                        left: vertical ? l.x1 + 4 : (l.x1 + l.x2) / 2,
                        top: vertical ? (l.y1 + l.y2) / 2 : l.y1 + 4,
                        transform: vertical ? 'translateY(-50%)' : 'translateX(-50%)',
                      }}>{r1(l.label)}</span>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* Inspect */}
        <aside className="shrink-0 w-full lg:w-72 max-h-[42vh] lg:max-h-none overflow-y-auto border-t lg:border-t-0 lg:border-l border-[#2C2C2C] bg-[#252525] text-[12px]">
          {!selected ? (
            <div className="p-4 text-[#B3B3B3] leading-relaxed">
              <p className="m-0 font-semibold text-white text-[13px]">Inspect</p>
              <p className="m-0 mt-2">Klik elemen di frame untuk melihat ukuran, spacing, warna, dan tipografinya, seperti Dev Mode di Figma.</p>
              <p className="m-0 mt-2">Bandingkan angkanya dengan build staging. Di browser, klik kanan elemen lalu pilih <strong className="text-white">Inspect</strong> untuk melihat nilai di DevTools.</p>
            </div>
          ) : (
            <div>
              <div className="px-4 py-3 border-b border-[#2C2C2C]">
                <p className="m-0 text-[11px] text-[#8C8C8C] truncate">{selected.frame}</p>
                <p className="m-0 mt-0.5 font-semibold text-white text-[13px] break-words">{selected.name}</p>
              </div>
              <PropGroup title="Ukuran & posisi">
                <PropRow k="W" v={`${r1(selected.box.w)}`} />
                <PropRow k="H" v={`${r1(selected.box.h)}`} />
                <PropRow k="X" v={`${r1(selected.box.x - selected.frameBox.x)}`} />
                <PropRow k="Y" v={`${r1(selected.box.y - selected.frameBox.y)}`} />
              </PropGroup>
              {selected.props.map((g) => (
                <PropGroup key={g.group} title={g.group}>
                  {g.rows.map(([k, v, swatch]) => <PropRow key={k} k={k} v={v} swatch={swatch} />)}
                </PropGroup>
              ))}
              {selected.text && (
                <PropGroup title="Konten">
                  <p className="m-0 col-span-2 text-[#E5E5E5] break-words">{selected.text}</p>
                </PropGroup>
              )}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="m-0 text-[11px] font-semibold text-[#8C8C8C]">CSS</p>
                  <button type="button" onClick={copyCss} className="inline-flex items-center gap-1 bg-transparent border-none text-[#B3B3B3] hover:text-white cursor-pointer text-[11px]">
                    {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <pre className="m-0 p-2.5 rounded bg-[#1E1E1E] text-[11px] leading-relaxed text-[#9CDCFE] font-ld-mono whitespace-pre-wrap break-all">{selected.css}</pre>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const PropGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="px-4 py-3 border-b border-[#2C2C2C]">
    <p className="m-0 mb-2 text-[11px] font-semibold text-[#8C8C8C]">{title}</p>
    <div className="grid grid-cols-[84px_1fr] gap-x-2 gap-y-1.5 items-center">{children}</div>
  </div>
);

const PropRow: React.FC<{ k: string; v: string; swatch?: string }> = ({ k, v, swatch }) => (
  <>
    <span className="text-[#8C8C8C]">{k}</span>
    <span className="flex items-center gap-1.5 min-w-0 text-[#E5E5E5] font-ld-mono text-[11.5px]">
      {swatch && <span className="w-3.5 h-3.5 rounded-sm border border-[#555] shrink-0" style={{ background: swatch }} />}
      <span className="break-all">{v}</span>
    </span>
  </>
);

/** Renders **bold** segments in a designer note. */
const NoteText: React.FC<{ text: string }> = ({ text }) => (
  <span>
    {text.split(/(\*\*[^*]+\*\*)/).map((part, i) => (part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>))}
  </span>
);

export default TokoKitaDesignPage;
