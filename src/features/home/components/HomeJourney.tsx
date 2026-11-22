import React from 'react';
import { Link } from 'react-router-dom';
import { GuidedIllustration, LearnIllustration, PracticeIllustration, ShowcaseIllustration } from './JourneyIllustrations';

// The four products as one path: learn → practice → show → get guided.

const STEPS = [
  { n: '01', art: LearnIllustration, verb: 'Belajar', title: 'Pahami dasarnya', body: 'Baca materi fundamental sampai automation di QA Library.', to: '/qa-library', link: 'QA Library' },
  { n: '02', art: PracticeIllustration, verb: 'Praktik', title: 'Kerjakan project nyata', body: 'Review PRD, tulis test case, dan cari bug di aplikasi staging.', to: '/qa-simulator', link: 'QA Simulator' },
  { n: '03', art: ShowcaseIllustration, verb: 'Tunjukkan', title: 'Bangun portfolio', body: 'Ubah hasil simulasi jadi studi kasus yang bisa dikirim ke recruiter.', to: '/portfolio', link: 'Portfolio QA' },
  { n: '04', art: GuidedIllustration, verb: 'Dibimbing', title: 'Dapat arahan personal', body: 'Review CV, latihan interview, dan rencana belajar bareng mentor.', to: '/mentoring', link: 'Mentoring' },
];

const HomeJourney: React.FC = () => (
  <section className="py-16 md:py-24 bg-ld-canvas font-ld-sans">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="max-w-2xl mb-8 sm:mb-12">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Alur belajar</p>
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite leading-tight">
          Dari nol sampai siap melamar, langkah demi langkah
        </h2>
      </div>
      {/* Mobile: horizontal snap slider bleeding to the screen edges, the next
          card peeking in as a swipe hint. sm+: regular grid. */}
      <ol className="m-0 p-0 list-none -mx-4 px-4 flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-4 lg:gap-0">
        {STEPS.map(({ n, art: Art, verb, title, body, to, link }, i) => (
          <li
            key={n}
            className="relative shrink-0 w-[78%] snap-start rounded-xl border border-ld-ash p-5 sm:w-auto sm:rounded-none sm:border-0 sm:p-0 lg:pr-8"
          >
            {/* connector line between steps (desktop) */}
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="hidden lg:block absolute top-9 left-[84px] right-3 border-t-2 border-dashed border-ld-frost" />
            )}
            <Art className="relative z-[1] w-[72px] h-[72px]" />
            <p className="m-0 mt-5 font-ld-mono text-[11px] uppercase tracking-widest text-ld-fog">{n} · {verb}</p>
            <h3 className="m-0 mt-1.5 text-lg font-semibold text-ld-onyx">{title}</h3>
            <p className="m-0 mt-1.5 text-sm text-ld-slate leading-relaxed">{body}</p>
            <Link to={to} className="inline-block mt-3 text-sm font-medium text-ld-violet no-underline hover:underline">{link} →</Link>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default HomeJourney;
