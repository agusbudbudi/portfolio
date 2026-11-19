import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Copy, Plus, RotateCcw, Share2, Trash2, Users, X } from 'lucide-react';
import Seo from '../../../components/common/Seo';
import SplitBillLogo from '../components/SplitBillLogo';

// ─────────────────────────────────────────────────────────────────────────────
// QA Simulator practice target: "SplitBill staging build v2.0.0-rc1".
//
// THIS COMPONENT IS INTENTIONALLY BUGGY. Each planted defect is tagged with
// `// PLANTED BUG-xx` and matches the answer key in
// public/qa-simulator/config/splitbill.json (phase "bug-hunting", assignment
// "bh-bugs"). Do NOT "fix" these — the learner's job is to find them. If you
// change behaviour here, update the answer key too.
// ─────────────────────────────────────────────────────────────────────────────

interface Participant { id: string; name: string }
interface Item { id: string; name: string; price: number; qty: number; assignees: string[] }
type Method = 'proportional' | 'equal';

const ME_ID = 'me';
const MAX_PARTICIPANTS = 20;
const uid = () => Math.random().toString(36).slice(2, 10);
const idr = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;
const num = (s: string) => {
  const v = parseFloat(s.replace(',', '.'));
  return Number.isFinite(v) ? v : 0;
};

const INPUT = 'w-full rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
const PRIMARY = 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium border-none cursor-pointer transition-colors';

const SplitBillSandboxPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [participants, setParticipants] = useState<Participant[]>([{ id: ME_ID, name: 'Gua' }]);
  const [nameInput, setNameInput] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemAssignees, setItemAssignees] = useState<string[]>([]);
  const [itemError, setItemError] = useState<string | null>(null);

  const [service, setService] = useState('');
  const [tax, setTax] = useState('');
  const [discount, setDiscount] = useState('');
  const [method, setMethod] = useState<Method>('proportional');
  const [activity, setActivity] = useState('');
  const [feeError, setFeeError] = useState<string | null>(null);

  const [showMessage, setShowMessage] = useState(false);
  const [copied, setCopied] = useState(false);

  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name;

  // ── Step 1: participants ────────────────────────────────────────────────
  const addParticipant = () => {
    const name = nameInput; // PLANTED BUG-09: not trimmed, so "   " passes the empty check below
    if (name.length === 0) {
      setNameError('Nama tidak boleh kosong.');
      return;
    }
    if (participants.length >= MAX_PARTICIPANTS) {
      setNameError(`Maksimal ${MAX_PARTICIPANTS} peserta.`);
      return;
    }
    // PLANTED BUG-10: no duplicate-name check ("Andi" vs "andi")
    // PLANTED BUG-12: no 30-character limit
    setParticipants((prev) => [...prev, { id: uid(), name }]);
    setNameInput('');
    setNameError(null);
  };

  const removeParticipant = (id: string) => {
    // PLANTED BUG-04: items keep the removed id in `assignees`, so shared items
    // are still divided by the old headcount and the ghost share is never billed.
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Step 2: items & fees ────────────────────────────────────────────────
  const addItem = () => {
    const name = itemName.trim();
    const price = num(itemPrice);
    const qty = Math.floor(num(itemQty));
    if (!name) return setItemError('Nama item wajib diisi.');
    if (itemPrice.trim() === '') return setItemError('Harga wajib diisi.');
    // PLANTED BUG-07: no lower/upper bound on price (0 and negatives accepted)
    if (qty < 1 || qty > 99) return setItemError('Qty harus 1–99.');
    // PLANTED BUG-03: an item with zero assignees is accepted
    setItems((prev) => [...prev, { id: uid(), name, price, qty, assignees: itemAssignees }]);
    setItemName('');
    setItemPrice('');
    setItemQty('1');
    setItemAssignees([]);
    setItemError(null);
  };

  const goToSummary = () => {
    const t = num(tax);
    if (t < 0 || t > 100) return setFeeError('Pajak harus 0–100%.');
    // PLANTED BUG-11: service charge has no 0–100% check (tax does — inconsistent)
    // PLANTED BUG-06: discount isn't capped at the subtotal
    if (items.length === 0) return setFeeError('Tambahkan minimal 1 item.');
    setFeeError(null);
    setStep(3);
    window.scrollTo(0, 0);
  };

  // ── Step 3: calculation ─────────────────────────────────────────────────
  const calc = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0); // includes unassigned items (BUG-03)
    const disc = num(discount);
    const base = subtotal - disc;
    const serviceAmount = base * (num(service) / 100);
    const taxAmount = base * (num(tax) / 100); // PLANTED BUG-01: should be (base + serviceAmount) * tax
    const grand = base + serviceAmount + taxAmount;

    const rows = participants.map((p) => {
      const lines = items
        .filter((it) => it.assignees.includes(p.id))
        .map((it) => ({ name: it.name, qty: it.qty, shared: it.assignees.length > 1, amount: (it.price * it.qty) / it.assignees.length }));
      const own = lines.reduce((s, l) => s + l.amount, 0);
      let total: number;
      if (method === 'proportional') {
        total = subtotal === 0 ? 0 : (own / subtotal) * grand;
      } else {
        // PLANTED BUG-05: extras split across *all* participants, not just those with items
        total = own + (grand - subtotal) / participants.length;
      }
      // PLANTED BUG-02: floor instead of round, and the remainder is never given to "Gua"
      return { participant: p, lines, own, total: Math.floor(total + 1e-6) };
    });

    return { subtotal, disc, serviceAmount, taxAmount, grand, rows };
  }, [items, participants, discount, service, tax, method]);

  const shareMessage = useMemo(() => {
    // PLANTED BUG-13: en-US grouping ("103,950") in the share text; UI uses id-ID
    const fmt = (n: number) => `Rp ${Math.round(n).toLocaleString('en-US')}`;
    const lines = calc.rows.map((r) => `• ${r.participant.name}: ${fmt(r.total)}`);
    return [`*${activity.trim() || 'Split Bill'}*`, '', ...lines, '', `Grand Total: ${fmt(calc.grand)}`, '', '_dibuat dengan SplitBill_'].join('\n');
  }, [calc, activity]);

  const reset = () => {
    setStep(1);
    setParticipants([{ id: ME_ID, name: 'Gua' }]);
    setItems([]);
    setService(''); setTax(''); setDiscount(''); setActivity('');
    setMethod('proportional');
    setNameError(null); setItemError(null); setFeeError(null);
    setShowMessage(false);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — the message is still visible to copy manually
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-ld-sans">
      <Seo path="/qa-simulator/sandbox/splitbill" title="SplitBill Staging (Simulasi) | QA Simulator" description="Environment latihan bug hunting QA Simulator." noindex />

      <div className="sticky top-0 z-50 bg-amber-400 text-amber-950 text-xs">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <span className="font-semibold tracking-wide">STAGING · v2.0.0-rc1</span>
          <Link to="/qa-simulator/splitbill?phase=bug-hunting" className="inline-flex items-center gap-1 text-amber-950 no-underline font-medium hover:underline">
            <ArrowLeft size={12} /> QA Simulator
          </Link>
        </div>
      </div>
      <p className="m-0 max-w-md mx-auto px-4 pt-2 text-[11px] text-slate-500">
        Aplikasi simulasi untuk latihan testing, bukan aplikasi SplitBill asli. Data tidak disimpan ke mana pun.
      </p>

      <div className="max-w-md mx-auto px-4 py-4">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SplitBillLogo size={36} className="shrink-0" />
            <span className="text-lg font-bold text-slate-900">Split<span className="text-teal-600">Bill</span></span>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
            <RotateCcw size={12} /> Bill baru
          </button>
        </header>

        <div className="flex items-center gap-2 mb-4 text-xs font-medium">
          {['Input Teman', 'Input Bill', 'Ringkasan'].map((label, i) => (
            <React.Fragment key={label}>
              <span className={`inline-flex items-center gap-1.5 ${step === i + 1 ? 'text-teal-700' : step > i + 1 ? 'text-slate-600' : 'text-slate-400'}`}>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${step >= i + 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</span>
                {label}
              </span>
              {i < 2 && <span className="flex-1 h-px bg-slate-300" />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <section className="bg-white rounded-lg p-5 border border-slate-200">
            <h1 className="m-0 text-xl font-bold text-slate-900">Siapa aja nih?</h1>
            <p className="m-0 mt-1 text-sm text-slate-500">Tambahkan minimal 2 teman untuk mulai split bill.</p>
            <div className="mt-4 flex gap-2">
              <input
                className={INPUT}
                placeholder="Nama teman, lalu Enter"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setNameError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addParticipant(); } }}
                aria-label="Nama teman"
              />
              <button onClick={addParticipant} className="px-4 rounded-md bg-slate-900 text-white text-sm font-medium border-none cursor-pointer shrink-0">Tambah</button>
            </div>
            {nameError && <p className="m-0 mt-2 text-xs text-red-500">{nameError}</p>}

            <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
              <Users size={13} /> {participants.length} Teman · min. 2
            </div>
            <ul className="m-0 mt-2 p-0 list-none flex flex-wrap gap-2">
              {participants.map((p) => (
                <li key={p.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-md bg-slate-50 text-slate-800 text-sm border border-slate-200">
                  <span className="whitespace-pre">{p.name}</span>
                  {p.id === ME_ID ? (
                    <span className="px-1.5 text-[10px] font-semibold text-slate-400">KAMU</span>
                  ) : (
                    <button onClick={() => removeParticipant(p.id)} className="flex items-center justify-center w-5 h-5 rounded bg-transparent hover:bg-slate-200 border-none cursor-pointer text-slate-500" aria-label={`Hapus ${p.name}`}>
                      <X size={12} />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <button
              className={`${PRIMARY} w-full mt-6`}
              disabled={participants.length < 1} // PLANTED BUG-08: should be < 2
              onClick={() => setStep(2)}
            >
              Lanjut
            </button>
          </section>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <section className="bg-white rounded-lg p-5 border border-slate-200">
              <h2 className="m-0 text-base font-bold text-slate-900">Input Pengeluaran</h2>
              <div className="mt-3 space-y-2.5">
                <input className={INPUT} placeholder="Nama item (mis. Nasi Goreng)" value={itemName} onChange={(e) => setItemName(e.target.value)} aria-label="Nama item" />
                <div className="grid grid-cols-3 gap-2">
                  <input className={`${INPUT} col-span-2`} type="number" inputMode="numeric" placeholder="Harga satuan" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} aria-label="Harga satuan" />
                  <input className={INPUT} type="number" inputMode="numeric" placeholder="Qty" value={itemQty} onChange={(e) => setItemQty(e.target.value)} aria-label="Qty" />
                </div>
                <div>
                  <p className="m-0 mb-1.5 text-xs font-medium text-slate-500">Dipesan oleh</p>
                  <div className="flex flex-wrap gap-1.5">
                    {participants.map((p) => {
                      const on = itemAssignees.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setItemAssignees((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer transition-colors ${on ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}
                        >
                          {on && <Check size={11} />}<span className="whitespace-pre">{p.name}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setItemAssignees(participants.map((p) => p.id))}
                      className="px-2.5 py-1 rounded-md text-xs font-medium border border-dashed border-slate-300 text-slate-500 bg-transparent cursor-pointer"
                    >
                      Semua
                    </button>
                  </div>
                </div>
                {itemError && <p className="m-0 text-xs text-red-500">{itemError}</p>}
                <button onClick={addItem} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md border border-slate-200 text-slate-700 text-sm font-medium bg-white hover:bg-slate-50 cursor-pointer">
                  <Plus size={15} /> Tambah item
                </button>
              </div>

              {items.length > 0 && (
                <ul className="m-0 mt-4 p-0 list-none divide-y divide-slate-100">
                  {items.map((it) => {
                    const names = it.assignees.map(nameOf).filter(Boolean);
                    return (
                      <li key={it.id} className="py-2.5 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="m-0 text-sm font-medium text-slate-900">{it.name} <span className="text-slate-400 font-normal">×{it.qty}</span></p>
                          <p className="m-0 text-xs text-slate-500 truncate">{names.length > 0 ? names.join(', ') : '—'}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{idr(it.price * it.qty)}</span>
                        <button onClick={() => setItems((prev) => prev.filter((x) => x.id !== it.id))} className="p-1 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer" aria-label={`Hapus ${it.name}`}>
                          <Trash2 size={14} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="bg-white rounded-lg p-5 border border-slate-200">
              <h2 className="m-0 text-base font-bold text-slate-900">Biaya Tambahan</h2>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <label className="text-xs font-medium text-slate-500">Service charge (%)
                  <input className={`${INPUT} mt-1`} type="number" inputMode="decimal" placeholder="0" value={service} onChange={(e) => setService(e.target.value)} />
                </label>
                <label className="text-xs font-medium text-slate-500">Pajak / PPN (%)
                  <input className={`${INPUT} mt-1`} type="number" inputMode="decimal" placeholder="0" value={tax} onChange={(e) => setTax(e.target.value)} />
                </label>
                <label className="col-span-2 text-xs font-medium text-slate-500">Diskon (Rp)
                  <input className={`${INPUT} mt-1`} type="number" inputMode="numeric" placeholder="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </label>
              </div>

              <p className="m-0 mt-4 mb-1.5 text-xs font-medium text-slate-500">Metode pembagian</p>
              <div className="grid grid-cols-2 gap-2">
                {([['proportional', 'Proporsional', 'Sesuai pesanan'], ['equal', 'Bagi rata', 'Biaya tambahan rata']] as const).map(([value, label, hint]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMethod(value)}
                    className={`text-left px-3 py-2.5 rounded-md border cursor-pointer transition-colors ${method === value ? 'border-teal-600 bg-teal-50' : 'border-slate-200 bg-white'}`}
                  >
                    <span className="block text-sm font-semibold text-slate-900">{label}</span>
                    <span className="block text-[11px] text-slate-500">{hint}</span>
                  </button>
                ))}
              </div>

              <label className="block mt-4 text-xs font-medium text-slate-500">Nama aktivitas
                <input className={`${INPUT} mt-1`} placeholder="Makan malam di Sate Khas Senayan" value={activity} onChange={(e) => setActivity(e.target.value)} />
              </label>
              {feeError && <p className="m-0 mt-3 text-xs text-red-500">{feeError}</p>}
            </section>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-md bg-white border border-slate-200 text-sm font-medium text-slate-700 cursor-pointer">Kembali</button>
              <button onClick={goToSummary} className={`${PRIMARY} flex-1`}>Hitung</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <section className="bg-white rounded-lg p-5 border border-slate-200">
              <p className="m-0 text-xs font-medium text-slate-500">{activity.trim() || 'Split Bill'}</p>
              <p className="m-0 mt-1 text-xs text-slate-500">Grand Total</p>
              <p className="m-0 text-3xl font-bold text-slate-900 tabular-nums">{idr(calc.grand)}</p>
              <dl className="m-0 mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-y-1 text-xs text-slate-700">
                <dt className="text-slate-400">Subtotal</dt><dd className="m-0 text-right tabular-nums">{idr(calc.subtotal)}</dd>
                {calc.disc !== 0 && <><dt className="text-slate-400">Diskon</dt><dd className="m-0 text-right tabular-nums">−{idr(calc.disc)}</dd></>}
                <dt className="text-slate-400">Service ({num(service)}%)</dt><dd className="m-0 text-right tabular-nums">{idr(calc.serviceAmount)}</dd>
                <dt className="text-slate-400">Pajak ({num(tax)}%)</dt><dd className="m-0 text-right tabular-nums">{idr(calc.taxAmount)}</dd>
              </dl>
              <p className="m-0 mt-3 text-[11px] text-slate-500">Metode: {method === 'proportional' ? 'Proporsional' : 'Bagi rata'}</p>
            </section>

            <ul className="m-0 p-0 list-none space-y-2.5">
              {calc.rows.map((r) => (
                <li key={r.participant.id} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    {/* PLANTED BUG-12 (layout): no truncate/min-w-0 — long names overflow the card */}
                    <span className="text-sm font-semibold text-slate-900 whitespace-pre">{r.participant.name}</span>
                    <span className="text-base font-bold text-teal-700 tabular-nums shrink-0">{idr(r.total)}</span>
                  </div>
                  {r.lines.length > 0 ? (
                    <ul className="m-0 mt-2 p-0 list-none space-y-0.5">
                      {r.lines.map((l, i) => (
                        <li key={i} className="flex justify-between gap-3 text-xs text-slate-500">
                          <span className="truncate">{l.name} ×{l.qty}{l.shared ? ' (patungan)' : ''}</span>
                          <span className="tabular-nums shrink-0">{idr(l.amount)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100 mt-1">
                        <span>Pajak, service & diskon</span>
                        <span className="tabular-nums">{idr(r.total - r.own)}</span>
                      </li>
                    </ul>
                  ) : (
                    <p className="m-0 mt-1 text-xs text-slate-400">Tidak ada item.</p>
                  )}
                </li>
              ))}
            </ul>

            <section className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareMessage)}`}
                target="_blank"
                rel="noreferrer"
                className={`${PRIMARY} w-full no-underline bg-[#25d366] hover:bg-[#1ebe5b]`}
              >
                <Share2 size={15} /> Share ke WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setShowMessage((v) => !v)}
                className="w-full inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-500 bg-transparent border-none cursor-pointer"
              >
                Lihat isi pesan <ChevronDown size={13} className={showMessage ? 'rotate-180' : ''} />
              </button>
              {showMessage && (
                <div className="relative">
                  <pre className="m-0 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-ld-mono">{shareMessage}</pre>
                  <button onClick={copyMessage} className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600 cursor-pointer">
                    {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              )}
            </section>

            <button onClick={() => setStep(2)} className="w-full px-4 py-2.5 rounded-md bg-white border border-slate-200 text-sm font-medium text-slate-700 cursor-pointer">Ubah bill</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitBillSandboxPage;
