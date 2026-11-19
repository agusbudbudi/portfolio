import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FEATURED_PROJECT_PATH } from './content';

const SimFinalCtaSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-ld-cloud">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-ld-midnight px-6 sm:px-10 py-12 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full bg-ld-violet/30 blur-3xl" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="m-0 font-semibold text-3xl sm:text-4xl lg:text-5xl text-white tracking-[-0.025em] leading-[1.05] mb-4">
            Sprint pertamamu sebagai QA dimulai hari ini.
          </h2>
          <p className="m-0 text-ld-fog text-base sm:text-lg mb-8 leading-relaxed">
            PRD sudah siap, tim sudah menunggu. Mulai phase 1 sekarang, tanpa daftar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={FEATURED_PROJECT_PATH}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ld-violet text-white font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors text-sm"
            >
              Mulai Simulasi Gratis
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/mentoring/booking"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 text-white font-medium rounded-lg no-underline hover:bg-white/5 transition-colors text-sm"
            >
              Butuh review dari mentor?
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SimFinalCtaSection;
