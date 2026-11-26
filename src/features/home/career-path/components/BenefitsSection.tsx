import React from 'react';
import { BENEFITS } from '../data/programs';
import { CareerIllustration, CommunityIllustration, GuidedIllustration, PracticeIllustration } from '../../components/JourneyIllustrations';

const ART = { guidance: GuidedIllustration, practical: PracticeIllustration, career: CareerIllustration, community: CommunityIllustration } as const;

// No statistics on purpose: none are verified in the project yet.
const BenefitsSection: React.FC = () => (
  <section id="why" className="scroll-mt-16 bg-white py-16 md:py-24">
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="m-0 text-3xl font-semibold leading-tight tracking-[-0.02em] text-ld-graphite sm:text-4xl">Kenapa Mentor.QA?</h2>
        <p className="m-0 mt-3 text-base text-ld-slate sm:text-lg">Ekosistem yang dirancang agar kamu bisa belajar, praktik, dan berkembang sebagai QA dengan percaya diri.</p>
      </div>
      {/* Phones: swipeable slider (next card peeks in); sm+: grid. */}
      <ul aria-label="Kenapa Mentor.QA" className="-mx-4 my-0 flex list-none snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-0 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {BENEFITS.map((b) => {
          const Art = ART[b.id];
          return (
            <li key={b.id} className="w-[78%] shrink-0 snap-start rounded-2xl border border-ld-frost p-5 sm:w-auto sm:rounded-none sm:border-0 sm:p-0">
              <Art className="h-20 w-20" />
              <h3 className="m-0 mt-4 text-lg font-semibold text-ld-onyx">{b.title}</h3>
              <p className="m-0 mt-1.5 text-sm leading-relaxed text-ld-slate">{b.body}</p>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default BenefitsSection;
