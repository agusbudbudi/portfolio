import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../../../hooks/useConfig';
import MentoringShowcase from '../../../home/components/MentoringShowcase';

const DEFAULT_TOPICS_COUNT = 7;

const HeroSection: React.FC = () => {
  const { config } = useConfig();
  const topicsCount = config?.topics.length ?? DEFAULT_TOPICS_COUNT;


  return (
    <section className="relative overflow-hidden bg-ld-canvas min-h-svh flex flex-col justify-center pt-24 pb-16 lg:pt-28 lg:pb-16 font-ld-sans">
      <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-8 items-center">
          {/* Left two-thirds: headline + sub + CTAs */}
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ld-lilac text-ld-violet text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ld-violet" />
              Sesi Tersedia · {topicsCount} Topik QA
            </div>

            <h1 className="font-semibold text-[42px] sm:text-[56px] lg:text-[64px] leading-[0.98] tracking-[-0.025em] text-ld-graphite mb-5">
              Jadi QA Engineer, Dibimbing Praktisi Langsung
            </h1>

            <p className="text-base sm:text-lg text-ld-slate leading-relaxed max-w-lg mb-8 tracking-[-0.01em]">
              Mentoring 1-on-1 langsung dengan QA Engineer berpengalaman 6+ tahun.
              Dari fundamental testing hingga otomatisasi Cypress — belajar dari kasus nyata industri.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/mentoring/booking"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
              >
                Booking Sekarang
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-ld-ash text-ld-graphite text-sm font-medium rounded-lg no-underline hover:border-ld-steel transition-colors"
              >
                Cara Kerja
              </a>
            </div>

          </div>

          {/* Right: same 1-on-1 session art as the home page Mentoring row */}
          <div className="lg:col-span-2 relative pt-4 pb-8 lg:py-0">
            <MentoringShowcase />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
