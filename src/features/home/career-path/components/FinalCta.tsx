import React from 'react';
import { ArrowRight } from 'lucide-react';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import { scrollToId } from '../lib/scroll';
import { track } from '../../../../lib/analytics';

const FinalCta: React.FC = () => (
  <section className="relative overflow-hidden bg-white pt-16 md:pt-24 lg:pt-0">
    <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-[-10%] h-[560px] w-[560px] rounded-full bg-ld-lilac/60 blur-3xl" />
    <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12">
      <div className="lg:col-span-7 lg:self-center lg:py-24">
        <h2 className="m-0 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.025em] text-ld-graphite md:text-[40px]">Siap Level Up?</h2>
        <p className="m-0 mt-4 max-w-xl text-base leading-relaxed text-ld-slate sm:text-lg">Gabung Mentor.QA dan mulai bangun karier QA-mu hari ini.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => { track('hero_cta_click', { cta: 'final_explore_programs' }); scrollToId('ecosystem'); }}
            className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-ld-violet px-6 text-sm font-medium text-white transition-colors hover:bg-[#1f87e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ld-violet"
          >
            Explore Program <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            type="button"
            onClick={() => { track('hero_cta_click', { cta: 'final_get_career_guidance' }); scrollToId('quiz'); }}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-ld-ash bg-white px-6 text-sm font-medium text-ld-graphite transition-colors hover:border-ld-steel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ld-violet"
          >
            Find Your QA Journey
          </button>
        </div>
      </div>
      {/* Cut-out photo sits on the section's bottom edge. */}
      <div className="relative mx-auto w-full max-w-[420px] self-end lg:col-span-5 lg:-ml-[18%] lg:mr-0 lg:w-[118%] lg:max-w-none lg:pt-5">
        {/* Same photo backdrop as the hero. */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 aspect-square w-[85%] -translate-x-1/2 rounded-full bg-ld-violet/15 blur-3xl" />
        <PixelMosaic variant="blue" className="absolute top-4 -right-2 w-[45%] max-w-[280px] opacity-70 lg:-right-8" />
        <PixelMosaic variant="blue" className="absolute bottom-0 right-[80%] hidden w-[65%] opacity-70 sm:grid" style={{ transform: 'scaleY(-1)' }} />
        <img
          src="/shared/img/journey/cta.webp"
          alt=""
          width={1100}
          height={843}
          loading="lazy"
          decoding="async"
          className="relative block h-auto w-full"
        />
      </div>
    </div>
  </section>
);

export default FinalCta;
