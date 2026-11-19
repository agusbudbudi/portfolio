import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PixelMosaic from '../../../components/illustration/PixelMosaic';

const HomeFinalCta: React.FC = () => (
  <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-ld-violet to-[#1f87e6] font-ld-sans">
    <PixelMosaic variant="white" className="absolute top-8 right-6 lg:right-12" style={{ width: 'min(44%, 360px)' }} />
    <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="max-w-[980px]">
        {/* Two lines from md up: the question, then the promise. */}
        <h2 className="m-0 font-semibold text-3xl md:text-[36px] lg:text-[42px] tracking-[-0.025em] text-white leading-[1.15]">
          Siap jadi QA Engineer?<br className="hidden md:block" />{' '}
          <span className="md:whitespace-nowrap">Mulai belajar software testing gratis hari ini</span>
        </h2>
        <p className="m-0 mt-4 max-w-3xl text-white/85 text-base sm:text-lg leading-relaxed">
          Latih skill QA lewat simulasi kerja dengan project nyata, bangun portfolio QA yang siap dikirim ke recruiter, dan dapatkan arahan langsung lewat mentoring QA 1-on-1. Phase pertama simulasi bisa dicoba tanpa login.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/qa-simulator" className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-ld-violet text-sm font-semibold no-underline hover:bg-ld-lilac transition-colors">
            Mulai Simulasi Gratis <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link to="/mentoring" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/50 text-white text-sm font-medium no-underline hover:bg-white/10 transition-colors">
            Lihat Mentoring
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default HomeFinalCta;
