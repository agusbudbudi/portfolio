import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BuildSpot, GrowSpot, LearnSpot, PracticeSpot } from './ValueIllustrations';
import HeroBadge from '../../../../components/common/HeroBadge';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import { ProgramIcon } from './ProgramGlyph';
import { scrollToId } from '../lib/scroll';
import { track } from '../../../../lib/analytics';

const VALUES = [
  { label: 'Learn', art: LearnSpot },
  { label: 'Practice', art: PracticeSpot },
  { label: 'Build', art: BuildSpot },
  { label: 'Grow', art: GrowSpot },
];

/** Decorative program card pinned over the hero photo (not clickable). */
const FloatingCard: React.FC<{ className: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={`absolute rounded-xl border border-ld-frost bg-white/95 shadow-[0_12px_28px_-10px_rgba(39,40,53,0.25)] ${className}`}>
    {children}
  </div>
);

const NewHomeHero: React.FC = () => (
  <section className="relative overflow-hidden bg-white pt-24 lg:pt-28">
    <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full bg-ld-lilac/60 blur-3xl" />
    <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-6 lg:pb-20">
        <HeroBadge dot="static">YOUR QA CAREER PARTNER</HeroBadge>
        <h1 className="m-0 text-[38px] font-semibold leading-[1.05] tracking-[-0.025em] text-ld-graphite sm:text-[52px] lg:text-[58px]">
          Level Up Karier <span className="whitespace-nowrap">QA-mu,</span> <span className="block text-ld-violet">Mulai dari Sini.</span>
        </h1>
        <p className="m-0 mt-5 max-w-xl text-base leading-relaxed text-ld-slate sm:text-lg">
          Satu ekosistem untuk belajar, praktik, bangun portfolio, dan berkembang di dunia Quality Assurance.
        </p>
        <ul aria-label="Yang bisa kamu lakukan" className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
          {VALUES.map(({ label, art: Art }) => (
            <li key={label} className="inline-flex items-center gap-2 rounded-full border border-ld-frost bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-ld-graphite">
              <Art className="h-7 w-7 shrink-0" />
              {label}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => { track('hero_cta_click', { cta: 'free_career_consultation' }); scrollToId('quiz'); }}
            className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-ld-violet px-6 text-sm font-medium text-white transition-colors hover:bg-[#1f87e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ld-violet"
          >
            Find Your QA Journey
            <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <a
            href="#ecosystem"
            onClick={(e) => { e.preventDefault(); track('hero_cta_click', { cta: 'explore_programs' }); scrollToId('ecosystem'); }}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-ld-ash bg-white px-6 text-sm font-medium text-ld-graphite no-underline transition-colors hover:border-ld-steel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ld-violet"
          >
            Explore Program
          </a>
        </div>
      </div>

      {/* Stacks under the copy on small screens */}
      <div className="relative mx-auto w-full max-w-[560px] select-none self-end lg:col-span-6 lg:-ml-8 lg:-mr-6 lg:w-auto lg:max-w-none xl:mx-0 xl:w-full">
        {/* Same photo backdrop as the course detail hero (CourseDetailPage). */}
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 aspect-square w-[85%] -translate-x-1/2 rounded-full bg-ld-violet/15 blur-3xl" />
        <PixelMosaic variant="blue" className="absolute top-4 -right-2 w-[45%] max-w-[280px] opacity-70 sm:w-[62%] lg:-right-8" />
        <PixelMosaic
          variant="blue"
          className="absolute bottom-4 -left-2 w-[55%] max-w-[380px] opacity-70 sm:-left-4 sm:w-[80%] lg:-left-6"
          style={{ transform: 'scale(-1, -1)' }}
        />
        <img
          src="/shared/img/journey/hero.webp"
          alt="Dua praktisi QA: satu memegang laptop, satu berdiri dengan tangan bersilang"
          width={1000}
          height={1000}
          fetchPriority="high"
          className="relative z-10 block h-auto w-full -scale-x-100 lg:-ml-[12%] lg:-mt-12 xl:-ml-[6%] lg:w-[112%] lg:max-w-none"
        />
        {/* Illustrative progress, not the visitor's own. */}
        <FloatingCard className="z-[1] -top-4 right-0 w-[176px] p-3 sm:top-6 sm:w-[200px] lg:-top-6 lg:right-5 xl:-right-6">
          <span className="flex items-center gap-2.5">
            <ProgramIcon id="course" size={36} />
            <span>
              <span className="block text-[13px] font-semibold leading-tight text-ld-onyx">QA Course</span>
              <span className="block text-[11px] leading-tight text-ld-slate">Junior QA Ready</span>
            </span>
          </span>
          <span aria-hidden="true" className="mt-3 block h-1.5 overflow-hidden rounded-full bg-ld-frost">
            <span className="block h-full w-3/4 rounded-full bg-ld-violet" />
          </span>
          <span aria-hidden="true" className="mt-1.5 flex justify-between text-[11px] leading-tight text-ld-slate">
            Learning progress <span className="font-semibold text-ld-violet">75%</span>
          </span>
        </FloatingCard>
        <FloatingCard className="z-20 bottom-8 left-0 flex items-center gap-2.5 py-2 pl-2 pr-4 lg:-left-6 xl:-left-14">
          <ProgramIcon id="mentoring" size={36} />
          <span>
            <span className="block text-[13px] font-semibold leading-tight text-ld-onyx">QA Mentoring</span>
            <span className="block text-[11px] leading-tight text-ld-slate">1-on-1 career guidance</span>
          </span>
        </FloatingCard>
      </div>
    </div>
  </section>
);

export default NewHomeHero;
