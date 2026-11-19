import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StepIllustration, { type StepIllustrationName } from './StepIllustration';

const steps: { art: StepIllustrationName; title: string; description: string }[] = [
  {
    art: 'login',
    title: 'Login dengan Google',
    description: 'Masuk pakai akun Google, gratis dan langsung bisa dipakai.',
  },
  {
    art: 'fill',
    title: 'Isi Profil & Proyek',
    description: 'Lengkapi profil, proyek, sertifikasi, dan pengalaman kerjamu.',
  },
  {
    art: 'publish',
    title: 'Publish & Bagikan Link',
    description: 'Portfolio langsung online dengan link sendiri, siap dibagikan.',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-8 md:py-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            3 Langkah, Portfolio Siap Tayang
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Tidak perlu coding atau desain. Isi data, publish, selesai.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* dashed connectors between the step illustrations */}
          <div className="hidden md:block absolute top-[72px] left-[calc(16.667%+6.5rem)] right-[calc(50%+6.5rem)] border-t-2 border-dashed border-ld-ash z-0" />
          <div className="hidden md:block absolute top-[72px] left-[calc(50%+6.5rem)] right-[calc(16.667%+6.5rem)] border-t-2 border-dashed border-ld-ash z-0" />

          {steps.map(({ art, title, description }, idx) => (
            <div key={title} className="relative z-10 flex flex-col items-center text-center">
              <div className="relative z-10 mb-4 h-36 flex items-center justify-center">
                <StepIllustration name={art} className="h-36 w-auto" />
                <span className="absolute top-1 left-1/2 -translate-x-[88px] w-7 h-7 rounded-full bg-ld-violet text-white text-xs font-semibold flex items-center justify-center shadow-[0_4px_10px_rgba(59,158,255,0.35)]">
                  {idx + 1}
                </span>
              </div>

              <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-2">{title}</h3>
              <p className="text-sm text-ld-slate leading-relaxed max-w-xs">{description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
          >
            Buat Portfolio Sekarang
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
