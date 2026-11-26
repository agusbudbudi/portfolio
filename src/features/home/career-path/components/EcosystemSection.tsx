import React from 'react';
import { Link } from 'react-router-dom';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import { ArrowRight } from 'lucide-react';
import { PROGRAMS } from '../data/programs';
import { ProgramIcon } from './ProgramGlyph';
import ProgramPreview from './ProgramPreview';
import { track } from '../../../../lib/analytics';

const EcosystemSection: React.FC = () => (
  <section id="ecosystem" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-br from-ld-violet to-[#1f87e6] py-16 md:py-24">
    <PixelMosaic variant="white" className="absolute right-6 top-10 lg:right-12" style={{ width: 'min(48%, 400px)' }} />
    <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="m-0 text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-4xl">Explore Ekosistem Mentor.QA</h2>
        <p className="m-0 mt-3 text-base text-white/90 sm:text-lg">Semua yang kamu butuhkan untuk membangun karier QA, dalam satu tempat.</p>
      </div>
      {/* lg: two wide cards on top, three below. */}
      <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-6">
        {PROGRAMS.map((p, i) => (
          <li key={p.id} className={`${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'} ${i === 4 ? 'sm:col-span-2' : ''}`}>
            <Link
              to={p.to}
              onClick={() => track('program_card_click', { program: p.id })}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white bg-white no-underline transition-all motion-safe:hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(16,60,120,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <ProgramPreview id={p.id} />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3">
                  <ProgramIcon id={p.id} size={40} />
                  <div>
                    <p className="m-0 text-[10px] font-semibold tracking-widest text-ld-violet">{p.category}</p>
                    <h3 className="m-0 text-lg font-semibold leading-snug text-ld-onyx">{p.name}</h3>
                  </div>
                </div>
                <p className="m-0 mt-3 text-sm leading-relaxed text-ld-slate">{p.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-ld-violet">
                  {p.cta} <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default EcosystemSection;
