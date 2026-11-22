import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HeroShowcase from './HeroShowcase';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import HeroBadge from '../../../components/common/HeroBadge';

// Home hero: one promise ("dari belajar sampai kerja") + a QA-journey
// dashboard that ties the four products together (HeroShowcase).

const HomeHero: React.FC = () => (
  <section className="relative overflow-hidden bg-ld-canvas min-h-svh flex flex-col justify-center pt-24 pb-16 lg:pt-28 font-ld-sans">
    <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] w-[620px] h-[620px] rounded-full bg-ld-lilac/60 blur-3xl" />
    {/* Large pixel mosaics, same placement as the /mentoring hero (top-left +
        bottom-right, each mirrored to point into its corner). Blue on the white
        canvas; the top-left one stays faint since it sits behind the headline. */}
    <PixelMosaic
      variant="blue"
      className="absolute top-20 left-4 sm:left-8 lg:top-24 lg:left-10 opacity-20"
      style={{ width: 'min(62vw, 640px)', transform: 'scaleX(-1)' }}
    />
    <PixelMosaic
      variant="blue"
      className="absolute bottom-6 right-4 sm:right-8 lg:right-10 hidden sm:grid opacity-40"
      style={{ width: 'min(48vw, 520px)', transform: 'scaleY(-1)' }}
    />
    <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
      <div className="lg:col-span-6">
        <HeroBadge>Platform karier QA Engineer</HeroBadge>
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
