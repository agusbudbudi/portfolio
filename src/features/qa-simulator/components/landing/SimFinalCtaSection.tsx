import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import { FEATURED_PROJECT_PATH } from './content';
import LaptopSimulatorMockup from './LaptopSimulatorMockup';

// Same blue band as the homepage final CTA (HomeFinalCta), with a laptop
// showing the Labs workspace on the right. The laptop sits flush on the
// section's bottom edge (no bottom padding there) over a pixel mosaic.
const SimFinalCtaSection: React.FC = () => (
  <section className="relative overflow-hidden pt-16 md:pt-24 bg-gradient-to-br from-ld-violet to-[#1f87e6] font-ld-sans">
    <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-12 lg:gap-10">
      <div className="lg:self-center lg:pb-24">
        <h2 className="m-0 font-semibold text-3xl md:text-[36px] lg:text-[42px] tracking-[-0.025em] text-white leading-[1.15] text-balance">
          Sprint pertamamu sebagai QA dimulai hari ini
        </h2>
        <p className="m-0 mt-4 text-white/85 text-base sm:text-lg leading-relaxed">
          PRD sudah siap, tim sudah menunggu. Mulai phase 1 sekarang tanpa daftar, lalu login untuk menyimpan progress dan membuka phase berikutnya.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to={FEATURED_PROJECT_PATH}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-ld-violet text-sm font-semibold no-underline hover:bg-ld-lilac transition-colors"
          >
            Mulai Simulasi Gratis <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/mentoring/booking"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/50 text-white text-sm font-medium no-underline hover:bg-white/10 transition-colors"
          >
            Butuh review dari mentor?
          </Link>
        </div>
      </div>

      <div className="relative self-end w-full max-w-[640px] mx-auto lg:mx-0 lg:max-w-none lg:w-[calc(100%+3rem)] xl:w-[calc(100%+5rem)]">
        <PixelMosaic variant="white" className="absolute -top-10 -right-6 sm:-right-10" style={{ width: 'min(70%, 400px)' }} />
        <LaptopSimulatorMockup flush className="relative" />
      </div>
    </div>
  </section>
);

export default SimFinalCtaSection;
