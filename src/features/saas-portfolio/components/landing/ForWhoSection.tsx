import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const stages = ['Fresh Graduate', 'Junior QA', 'Automation QA', 'Senior QA'];

const groups = [
  {
    label: 'Fresh Graduate & QA Baru',
    title: 'Bangun Kredibilitas Sejak Awal Karier',
    points: [
      'Dokumentasikan proyek latihan & studi kasus testing',
      'Perkuat CV dengan bukti kerja nyata, bukan cuma daftar skill',
      'Link portfolio siap dilampirkan saat melamar kerja',
    ],
  },
  {
    label: 'QA Experienced & Praktisi',
    title: 'Tunjukkan Rekam Jejak sebagai Praktisi',
    points: [
      'Pamerkan pengalaman & proyek yang pernah dikerjakan',
      'Bangun kredibilitas di depan recruiter maupun klien',
      'Satu link untuk semua — portfolio, sertifikasi, dan kontak',
    ],
  },
];

const ForWhoSection: React.FC = () => {
  return (
    <section className="relative bg-ld-violet font-ld-sans overflow-hidden py-14 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 text-center">
        <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-white leading-[1.1] mb-4">
          Cocok untuk Semua Level QA
        </h2>
        <p className="text-white/80 text-base leading-relaxed mb-12 max-w-md mx-auto">
          Dari fresh graduate sampai senior — portfolio kamu berkembang bareng kariermu.
        </p>

        <div className="relative grid grid-cols-2 sm:flex sm:justify-between gap-y-10 gap-x-4">
          <div className="hidden sm:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-white/25 z-0" />
          {stages.map((stage, idx) => (
            <div key={stage} className="relative z-10 sm:flex-1 flex flex-col items-center text-center px-2">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-ld-violet font-ld-display font-semibold text-base mb-3">
                {idx + 1}
              </div>
              <span className="text-sm font-medium text-white">{stage}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map(({ label, title, points }) => (
          <div key={label} className="relative overflow-hidden rounded-xl bg-ld-canvas p-6 text-left shadow-[0_20px_50px_rgba(30,27,75,0.25)]">
            <span className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-lg bg-blue-600 text-white text-[10px] font-medium uppercase tracking-wide">
              {label}
            </span>
            <h3 className="font-ld-display font-semibold text-xl text-ld-graphite tracking-[-0.01em] mb-4 pr-16">
              {title}
            </h3>
            <ul className="space-y-2 list-none p-0 m-0">
              {points.map(point => (
                <li key={point} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-ld-violet shrink-0 mt-0.5" />
                  <span className="text-sm text-ld-slate leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ForWhoSection;
