import React from 'react';
import { CheckCircle2 } from 'lucide-react';

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
    <section className="relative bg-ld-violet font-ld-sans overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
        <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-8 lg:py-16">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-white leading-[1.1] mb-4 max-w-lg">
            Cocok untuk Semua Level QA
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-8 max-w-md">
            Satu platform, dua kebutuhan — mau baru masuk dunia kerja atau sudah jadi QA berpengalaman.
          </p>

          <div className="space-y-4">
            {groups.map(({ label, title, points }) => (
              <div key={label} className="rounded-xl bg-ld-canvas p-6 shadow-[0_20px_50px_rgba(30,27,75,0.25)]">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-ld-lilac text-ld-violet text-xs font-medium mb-4">
                  {label}
                </span>
                <h3 className="font-ld-display font-semibold text-xl text-ld-graphite tracking-[-0.01em] mb-4">
                  {title}
                </h3>
                <ul className="space-y-3 list-none p-0 m-0">
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
        </div>

        <div className="relative h-80 sm:h-80 lg:h-full order-first lg:order-last">
          <img
            src="/saas-portfolio/img/portfolio-public/hero-portfolio.webp"
            alt="Portfolio QA Engineer"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-ld-violet/20 via-transparent to-transparent" />
          <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-ld-violet/25 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default ForWhoSection;
