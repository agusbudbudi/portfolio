import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const rows = [
  { mentorQA: '1-on-1 dengan Mentor', course: 'Video satu arah' },
  { mentorQA: 'Praktisi Aktif Industri', course: 'Kadang bukan praktisi' },
  { mentorQA: 'Real Project & Kasus Nyata', course: 'Studi kasus generik' },
  { mentorQA: 'Bisa Tanya Jawab Langsung', course: 'Tidak bisa tanya' },
  { mentorQA: 'Feedback Personal', course: 'Tidak ada feedback' },
  { mentorQA: 'Jadwal Fleksibel Sesuai Kebutuhan', course: 'Jadwal/materi kaku' },
  { mentorQA: 'Bahas Karir & Strategi Interview', course: 'Fokus teknikal saja' },
];

const WhyDifferentSection: React.FC = () => {
  return (
    <section className="relative bg-ld-violet font-ld-sans overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
        <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-8">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-white leading-[1.1] mb-4 max-w-lg">
            Kenapa Mentor.QA Berbeda?
          </h2>
          <p className="text-white/80 text-base leading-relaxed mb-8 max-w-md">
            Bukan sekadar kelas online. Ini pendampingan nyata dari mentor yang aktif praktik di industri.
          </p>

          <div className="rounded-xl border border-white/15 bg-ld-canvas overflow-hidden shadow-[0_20px_50px_rgba(30,27,75,0.25)]">
            <div className="grid grid-cols-2 border-b border-ld-ash">
              <div className="flex items-center justify-center gap-2 px-4 py-3 sm:px-5 bg-ld-violet text-center">
                <img
                  src="/img/mentor-logo.webp"
                  alt=""
                  width={18}
                  height={18}
                  loading="lazy"
                  decoding="async"
                  className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0 rounded-md border border-white"
                />
                <span className="font-ld-display font-semibold text-xs sm:text-sm text-white">Mentor.QA</span>
              </div>
              <div className="px-4 py-3 sm:px-5 bg-ld-fog text-center border-l border-ld-ash">
                <span className="font-ld-display font-semibold text-xs sm:text-sm text-white">Course Biasa</span>
              </div>
            </div>

            {rows.map((row, idx) => (
              <div
                key={row.mentorQA}
                className={`grid grid-cols-2 ${idx !== rows.length - 1 ? 'border-b border-ld-ash' : ''}`}
              >
                <div className="flex items-center gap-2 px-4 py-2.5 sm:px-5">
                  <CheckCircle2 size={16} className="flex-shrink-0 text-green-500" />
                  <span className="text-xs sm:text-sm text-ld-graphite leading-snug">{row.mentorQA}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2.5 sm:px-5 border-l border-ld-ash">
                  <XCircle size={16} className="flex-shrink-0 text-red-500" />
                  <span className="text-xs sm:text-sm text-ld-slate leading-snug">{row.course}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-80 sm:h-[420px] lg:h-[620px] order-first lg:order-last">
          <img
            src="/img/image-benefit.png"
            alt="Transformasi bareng mentor QA"
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

export default WhyDifferentSection;
