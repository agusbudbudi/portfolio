import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { JOURNEYS } from '../data/programs';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import { track } from '../../../../lib/analytics';

const JourneySection: React.FC = () => (
  <section id="journey" className="scroll-mt-16 bg-white py-16 md:py-24">
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="m-0 text-3xl font-semibold leading-tight tracking-[-0.02em] text-ld-graphite sm:text-4xl">Sudah Tahu Tujuanmu? Langsung Pilih</h2>
        <p className="m-0 mt-3 text-base text-ld-slate sm:text-lg">Lewati quiz dan langsung ke program yang sesuai dengan posisimu saat ini.</p>
      </div>
      {/* Phones: swipeable slider (next card peeks in); sm+: grid. */}
      <ul aria-label="Pilih tujuanmu" className="-mx-4 my-0 flex list-none snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:py-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {JOURNEYS.map((j) => (
          <li key={j.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <Link
              to={j.to}
              onClick={() => track('journey_card_click', { journey: j.id })}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ld-frost bg-white no-underline transition-all motion-safe:hover:-translate-y-1 hover:border-ld-violet/50 hover:shadow-[0_6px_16px_rgba(16,60,120,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ld-violet"
            >
              <div className="relative flex h-52 justify-center overflow-hidden bg-ld-lilac pt-3">
                <PixelMosaic variant="blue" className="absolute bottom-2 left-2 w-[80%] max-w-[260px] -scale-100 opacity-60" />
                <img
                  src={`/shared/img/journey/${j.id}.webp`}
                  alt=""
                  width={600}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="relative h-full w-auto max-w-full object-contain object-bottom transition-transform duration-300 motion-safe:group-hover:scale-105 origin-bottom"
                />
                {/* Program label: revealed on hover / keyboard focus. */}
                <p className="absolute inset-x-0 bottom-0 z-10 m-0 bg-ld-lavender/60 px-4 py-2.5 text-center font-ld-mono text-[11px] font-semibold uppercase tracking-wider text-ld-onyx opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {j.via}
                </p>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="m-0 text-lg font-semibold leading-snug text-ld-onyx">{j.title}</h3>
                <p className="m-0 mt-2 text-sm leading-relaxed text-ld-slate">{j.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-ld-violet">
                  Mulai <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default JourneySection;
