import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Clock, FileText, FolderKanban, GraduationCap, MessageSquare, Trophy } from 'lucide-react';

// MacBook mockup showing the QA Simulator "Labs" workspace (SplitBill, all
// phases done), used by the landing page's final CTA. The screen is laid out
// at a real desktop width (SCREEN_W) and scaled down to fit the lid, so it
// reads like an actual screenshot but stays crisp at any size. Decorative
// (aria-hidden); sample data mirrors the SplitBill project config.

const SCREEN_W = 1180;
const SCREEN_H = 738; // 16:10

const TEAM = ['rani-prameswari', 'dimas-arya', 'sari-wulandari'];
const PHASES = ['Requirement', 'Test Design', 'Bug Hunting'];

const Screen: React.FC = () => (
  <div className="relative font-ld-sans bg-ld-cloud text-ld-onyx" style={{ width: SCREEN_W, height: SCREEN_H }}>
    {/* Labs header */}
    <div className="h-14 bg-ld-onyx text-white px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
          <img src="/shared/img/mentor-logo-96.webp" alt="" width={20} height={20} className="w-5 h-5 object-contain" />
          Mentor.QA
        </span>
        <span className="h-5 w-px bg-white/15" />
        <span className="font-semibold tracking-tight">QA Simulator</span>
        <span className="px-1.5 py-0.5 rounded-md border border-emerald-400/40 text-emerald-300 font-ld-mono text-[10px] uppercase tracking-widest leading-none">Labs</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-white/70">
        <span className="inline-flex items-center gap-1.5"><FolderKanban size={15} /> Projects</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 pl-1 pr-3 py-1 text-white">
          <span className="w-6 h-6 rounded-full bg-ld-violet text-[11px] font-semibold flex items-center justify-center">N</span>
          Progress saya
        </span>
      </div>
    </div>

    {/* project header */}
    <div className="bg-white border-b border-ld-frost px-8 pt-5 pb-5">
      <p className="m-0 text-xs text-ld-slate">Projects <span className="mx-1.5 text-ld-fog">›</span> <span className="font-medium text-ld-onyx">SplitBill</span></p>
      <div className="mt-2.5 flex items-start justify-between gap-6">
        <div>
          <p className="m-0 text-[26px] font-semibold tracking-[-0.02em] leading-tight">Split Bill v2: Biaya Tambahan &amp; Metode Pembagian</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-md bg-ld-lilac text-ld-violet font-semibold uppercase tracking-widest text-[10px]">SplitBill</span>
            <span className="px-2 py-1 rounded-md bg-ld-cloud text-ld-graphite">Fintech / Consumer App</span>
            <span className="px-2 py-1 rounded-md bg-ld-cloud text-ld-graphite">Pemula</span>
            <span className="px-2 py-1 rounded-md bg-ld-cloud text-ld-graphite inline-flex items-center gap-1"><Clock size={11} /> ±4 jam</span>
          </div>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <span className="flex -space-x-2">
            {TEAM.map((id) => (
              <img key={id} src={`/qa-simulator/team/${id}.webp`} alt="" width={32} height={32} loading="lazy" className="w-8 h-8 rounded-full object-cover ring-2 ring-white bg-ld-cloud" />
            ))}
          </span>
          <div className="w-[220px]">
            <div className="flex justify-between text-xs"><span className="font-medium">Progress 6/6 tugas</span><span className="font-semibold text-ld-violet">100%</span></div>
            <div className="mt-1.5 h-1.5 rounded-full bg-ld-violet" />
            <p className="m-0 mt-2 text-xs text-emerald-600">Tersimpan di akunmu</p>
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {PHASES.map((p, i) => (
          <div key={p} className={`flex items-center gap-3 px-3 py-3 rounded-lg border ${i === 2 ? 'border-ld-violet shadow-[0_0_0_3px_rgba(59,158,255,0.12)]' : 'border-ld-frost'}`}>
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Check size={15} strokeWidth={3} /></span>
            <span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Phase {i + 1}</span>
              <span className="block text-sm font-semibold">{p}</span>
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* workspace */}
    <div className="px-8 pt-6 grid grid-cols-[1fr_400px] gap-6">
      <div className="space-y-4">
        <div className="rounded-xl bg-white border border-ld-frost/70 px-6 py-5 flex justify-between gap-4">
          <div>
            <p className="m-0 text-[10px] font-semibold uppercase tracking-widest text-ld-violet">Phase 3 dari 3</p>
            <p className="m-0 mt-1.5 text-xl font-semibold tracking-[-0.01em]">Test Execution &amp; Bug Reporting</p>
            <p className="m-0 mt-1.5 text-[13px] text-ld-slate leading-relaxed">Eksekusi test case di staging, temukan bug, laporkan dengan jelas, lalu beri rekomendasi rilis.</p>
          </div>
          <div className="text-right shrink-0">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Tugas phase ini</p>
            <p className="m-0 mt-2 text-2xl font-semibold">2<span className="text-ld-fog text-lg">/2</span></p>
          </div>
        </div>
        <div className="flex items-start gap-3 pt-1">
          <span className="w-6 h-6 rounded-full bg-ld-onyx text-white text-[11px] font-semibold flex items-center justify-center">1</span>
          <div>
            <p className="m-0 text-[15px] font-semibold">Chat dari tim</p>
            <p className="m-0 text-xs text-ld-slate">Brief dari tim untuk phase ini. Klik untuk buka percakapan.</p>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-ld-frost/70 px-4 py-3 flex items-center gap-3">
          <img src="/qa-simulator/team/dimas-arya.webp" alt="" width={36} height={36} loading="lazy" className="w-9 h-9 rounded-lg object-cover" />
          <div className="flex-1 min-w-0">
            <p className="m-0 text-sm font-semibold flex items-center gap-2">
              Dimas Arya
              <span className="px-1.5 py-0.5 rounded bg-ld-cloud text-[10px] font-medium text-ld-slate">Engineering Lead</span>
              <span className="px-1.5 py-0.5 rounded bg-ld-lilac text-[10px] font-medium text-ld-violet inline-flex items-center gap-1"><MessageSquare size={10} /> 3 pesan</span>
            </p>
            <p className="m-0 mt-0.5 text-xs text-ld-slate">Staging sudah up! Build v2.0.0-rc1.</p>
          </div>
          <ChevronDown size={16} className="text-ld-fog" />
        </div>
        <div className="rounded-xl bg-white border border-ld-frost/70 px-4 py-3 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><GraduationCap size={17} /></span>
          <div className="flex-1">
            <p className="m-0 text-sm font-semibold">Materi: Test Execution &amp; Bug Reporting</p>
            <p className="m-0 mt-0.5 text-xs text-ld-fog">4 poin penting · baca sebelum mengerjakan</p>
          </div>
          <ChevronDown size={16} className="text-ld-fog" />
        </div>
      </div>

      <div className="rounded-xl bg-white border border-ld-frost/70 overflow-hidden">
        <div className="flex items-center justify-between px-4 border-b border-ld-frost bg-ld-cloud/50">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Dokumen referensi</span>
          <span className="flex text-xs font-medium">
            <span className="px-3 py-2.5 bg-white text-ld-violet border-x border-ld-frost inline-flex items-center gap-1"><FileText size={12} /> PRD</span>
            <span className="px-3 py-2.5 text-ld-slate">Konteks &amp; tim</span>
            <span className="px-3 py-2.5 text-ld-slate">Materi</span>
          </span>
        </div>
        <div className="px-4 pt-3">
          <p className="m-0 text-sm font-semibold inline-flex items-center gap-1.5"><FileText size={14} className="text-ld-violet" /> PRD: Split Bill v2</p>
          <p className="m-0 mt-2 flex gap-4 text-xs border-b border-ld-frost">
            <span className="pb-2 text-ld-slate">v1.0</span>
            <span className="pb-2 text-ld-violet font-medium border-b-2 border-ld-violet">v1.1 · Addendum</span>
          </p>
          <p className="m-0 mt-3 text-xs italic text-ld-slate leading-relaxed">Jawaban PM atas pertanyaan klarifikasi dari QA. Bagian ini menggantikan isi v1.0 jika ada yang bertentangan.</p>
          <p className="m-0 mt-3 text-sm font-semibold">Peserta (US-01)</p>
          <ul className="m-0 mt-1.5 pl-4 text-xs text-ld-graphite leading-relaxed space-y-1">
            <li>Maksimal <strong>20 peserta</strong>.</li>
            <li>Nama wajib diisi, panjang <strong>1–30 karakter</strong>.</li>
            <li>Nama duplikat <strong>tidak boleh</strong> ("Andi" = "andi").</li>
            <li>Peserta <strong>"Gua"</strong> tidak bisa dihapus.</li>
          </ul>
        </div>
      </div>
    </div>

    {/* completion banner */}
    <div className="absolute inset-x-0 bottom-0 h-[72px] bg-emerald-50 border-t border-emerald-200 px-8 flex items-center gap-4">
      <span className="w-10 h-10 rounded-full bg-white text-amber-500 flex items-center justify-center shadow-sm"><Trophy size={20} /></span>
      <div className="flex-1">
        <p className="m-0 text-sm font-semibold text-emerald-800">Selamat, kamu menyelesaikan seluruh simulasi!</p>
        <p className="m-0 text-xs text-emerald-700">Skor self-assessment phase ini: <strong>81%</strong>. Bawa hasil kerjamu ke sesi mentoring untuk di-review mentor.</p>
      </div>
      <span className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 text-sm font-medium bg-white">Buat portfolio</span>
      <span className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium">Booking review mentor</span>
    </div>
  </div>
);

// `flush`: the base sits on the parent's bottom edge, so drop its drop shadow.
// The base keeps the MacBook's curved front corners either way.
const LaptopSimulatorMockup: React.FC<{ className?: string; flush?: boolean }> = ({ className = '', flush = false }) => {
  const reduce = useReducedMotion();
  const fitRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  // Scale the full-size screen to the lid's current width.
  useLayoutEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / SCREEN_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      className={`relative select-none ${className}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* lid */}
      <div className="relative mx-[6%] rounded-t-[14px] bg-[#1b1c22] p-[1.6%] pb-[2.2%] shadow-[0_30px_60px_-20px_rgba(8,30,70,0.55)] ring-1 ring-white/15">
        <span className="absolute top-[0.7%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/25" />
        <div ref={fitRef} className="relative overflow-hidden rounded-[3px] bg-ld-cloud" style={{ aspectRatio: `${SCREEN_W} / ${SCREEN_H}` }}>
          <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
            <Screen />
          </div>
        </div>
      </div>
      {/* base */}
      <div className={`relative h-[12px] sm:h-[16px] rounded-t-[2px] rounded-bl-[9%_100%] rounded-br-[9%_100%] bg-gradient-to-b from-[#e3e6ec] via-[#c9ced6] to-[#9aa1ad] ${flush ? '' : 'shadow-[0_18px_30px_-12px_rgba(8,30,70,0.6)]'}`}>
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[14%] h-[45%] rounded-b-md bg-[#b9bec8]" />
      </div>
    </motion.div>
  );
};

export default LaptopSimulatorMockup;
