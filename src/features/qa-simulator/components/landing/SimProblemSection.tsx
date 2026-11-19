import React from 'react';
import ProblemIllustration, { type ProblemIllustrationName } from './ProblemIllustration';

const PAINS: { art: ProblemIllustrationName; title: string; body: string }[] = [
  {
    art: 'theory',
    title: 'Teori sudah, praktik belum',
    body: 'Sudah hafal teknik testing dari video dan bootcamp, tapi belum pernah memakainya di fitur yang punya PRD, deadline, dan tim.',
  },
  {
    art: 'interview',
    title: 'Interview menanyakan pengalaman',
    body: '"Ceritakan bug paling menarik yang pernah kamu temukan." Susah menjawab kalau belum pernah mengerjakan project nyata.',
  },
  {
    art: 'loop',
    title: 'Butuh kerja untuk dapat pengalaman',
    body: 'Lowongan minta pengalaman, padahal pengalaman baru didapat setelah kerja. QA Simulator memutus lingkaran itu.',
  },
];

const SimProblemSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-ld-cloud">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="max-w-2xl mb-10 md:mb-14">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Kenapa simulasi?</p>
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite leading-tight">
          Tutorial mengajarkan teori. Interview menanyakan pengalaman.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PAINS.map(({ art, title, body }) => (
          <article key={title} className="rounded-xl bg-white border border-ld-frost/70 p-6">
            <div className="-mx-2 -mt-2 mb-5 rounded-xl bg-ld-cloud flex items-center justify-center h-40 overflow-hidden">
              <ProblemIllustration name={art} className="h-36 w-auto" />
            </div>
            <h3 className="m-0 text-base font-semibold text-ld-graphite">{title}</h3>
            <p className="m-0 mt-2 text-sm text-ld-slate leading-relaxed">{body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default SimProblemSection;
