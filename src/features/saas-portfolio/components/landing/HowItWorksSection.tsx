import React from 'react';
import { ArrowRight, LogIn, PenLine, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: LogIn,
    title: 'Login dengan Google',
    description: 'Masuk pakai akun Google, gratis dan langsung bisa dipakai.',
  },
  {
    icon: PenLine,
    title: 'Isi Profil & Proyek',
    description: 'Lengkapi profil, proyek, sertifikasi, dan pengalaman kerjamu.',
  },
  {
    icon: Share2,
    title: 'Publish & Bagikan Link',
    description: 'Portfolio langsung online dengan link sendiri, siap dibagikan.',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-8 md:py-20 bg-ld-cloud font-ld-sans">
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
          <div className="hidden md:block absolute top-10 left-[calc(16.667%+3.083rem)] right-[calc(50%+3.75rem)] h-px z-0 bg-ld-ash" />
          <div className="hidden md:block absolute top-10 left-[calc(50%+3.75rem)] right-[calc(16.667%+3.083rem)] h-px z-0 bg-ld-ash" />

          {steps.map(({ icon: Icon, title, description }, idx) => (
            <div key={title} className="relative z-10 flex flex-col items-center text-center">
              <div className="relative z-10 mb-5">
                <div className="w-20 h-20 rounded-xl flex items-center justify-center bg-ld-lilac border border-ld-ash/60">
                  <Icon size={28} className="text-ld-violet" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ld-canvas border border-ld-ash text-xs font-medium text-ld-slate flex items-center justify-center">
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
