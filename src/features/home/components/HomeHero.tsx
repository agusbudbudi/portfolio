import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HeroShowcase from './HeroShowcase';

// Home hero: one promise ("dari belajar sampai kerja") + a QA-journey
// dashboard that ties the four products together (HeroShowcase).

const HomeHero: React.FC = () => (
  <section className="relative overflow-hidden bg-ld-canvas min-h-svh flex flex-col justify-center pt-24 pb-16 lg:pt-28 font-ld-sans">
    <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] w-[620px] h-[620px] rounded-full bg-ld-lilac/60 blur-3xl" />
    <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
      <div className="lg:col-span-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ld-lilac text-ld-violet text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-ld-violet" />
          Platform karier QA Engineer
        </div>
        <h1 className="m-0 font-semibold text-[40px] sm:text-[54px] lg:text-[60px] leading-[1.02] tracking-[-0.025em] text-ld-graphite">
          Belajar, praktik, dan siap kerja sebagai <span className="text-ld-violet">QA Engineer</span>
        </h1>
        <p className="m-0 mt-5 text-base sm:text-lg text-ld-slate leading-relaxed max-w-xl">
          Satu tempat untuk seluruh perjalananmu: materi di QA Library, simulasi kerja QA dengan project nyata, portfolio yang
          bisa dikirim ke recruiter, dan mentoring 1-on-1 bareng praktisi.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to="/qa-simulator"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
          >
            Mulai Simulasi Gratis
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#program"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-ld-ash bg-white text-ld-graphite text-sm font-medium rounded-lg no-underline hover:border-ld-steel transition-colors"
          >
            Jelajahi semua fitur
          </a>
        </div>
      </div>
      <div className="lg:col-span-6">
        <HeroShowcase />
      </div>
    </div>
  </section>
);

export default HomeHero;
