import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../../../hooks/useConfig';
import MentoringShowcase from '../../../home/components/MentoringShowcase';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import HeroBadge from '../../../../components/common/HeroBadge';

const DEFAULT_TOPICS_COUNT = 7;

const HeroSection: React.FC = () => {
  const { config } = useConfig();
  const topicsCount = config?.topics.length ?? DEFAULT_TOPICS_COUNT;


  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#3b9eff_0%,#9ccfff_18%,#e3f2ff_40%,#ffffff_62%,#ffffff_100%)] min-h-svh flex flex-col justify-center pt-24 pb-16 lg:pt-28 lg:pb-16 font-ld-sans">
      {/* Large pixel mosaics: white scatter out of the blue top-left (dissolving
          into the light middle), blue scatter on the white bottom-right. The base
          pattern is dense toward top-right, so each one is mirrored to point into
          its corner. Inset from the edges so no tile is clipped (DESIGN.md "Pixel mosaic"). */}
      <PixelMosaic
        variant="white"
        className="absolute top-20 left-4 sm:left-8 lg:top-24 lg:left-10"
        style={{ width: 'min(62vw, 640px)', transform: 'scaleX(-1)' }}
      />
      <PixelMosaic
        variant="blue"
        className="absolute bottom-6 right-4 sm:right-8 lg:right-10 hidden sm:grid opacity-40"
        style={{ width: 'min(48vw, 520px)', transform: 'scaleY(-1)' }}
      />
      <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-8 items-center">
          {/* Left two-thirds: headline + sub + CTAs */}
          <div className="lg:col-span-3">
            <HeroBadge dot="live">Sesi Tersedia · {topicsCount} Topik QA</HeroBadge>

            <h1 className="font-semibold text-[42px] sm:text-[56px] lg:text-[64px] leading-[0.98] tracking-[-0.025em] text-ld-graphite mb-5">
              Jadi QA Engineer, Dibimbing Praktisi Langsung
            </h1>

            <p className="text-base sm:text-lg text-ld-slate leading-relaxed max-w-lg mb-8 tracking-[-0.01em]">
              Mentoring 1-on-1 langsung dengan QA Engineer berpengalaman 6+ tahun.
              Dari fundamental testing hingga otomatisasi Cypress, belajar dari kasus nyata industri.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/mentoring/booking"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-semibold rounded-lg no-underline shadow-[0_10px_24px_-10px_rgba(39,40,53,0.35)] hover:bg-[#1f87e6] transition-colors"
              >
                Booking Sekarang
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-ld-ash bg-white/70 backdrop-blur text-ld-graphite text-sm font-medium rounded-lg no-underline hover:border-ld-steel transition-colors"
              >
                Cara Kerja
              </a>
            </div>

          </div>

          {/* Right: same 1-on-1 session art as the home page Mentoring row */}
          <div className="lg:col-span-2 relative pt-4 pb-8 lg:py-0">
            <MentoringShowcase mosaic="none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
