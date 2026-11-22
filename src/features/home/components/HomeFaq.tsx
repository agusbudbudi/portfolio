import React from 'react';
import FaqAccordion from '../../../components/common/FaqAccordion';
import { HOME_FAQ } from '../data/homeFaq';

// Uses the shared FaqAccordion (single-open, smooth, answers kept in the DOM).
const HomeFaq: React.FC = () => (
  <section id="faq" className="py-16 md:py-24 bg-ld-cloud border-t border-ld-frost scroll-mt-16 font-ld-sans">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="text-center mb-10 md:mb-14">
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">Pertanyaan umum</h2>
        <p className="m-0 text-ld-slate max-w-xl mx-auto leading-relaxed">Hal yang sering ditanyakan sebelum mulai belajar di Mentor.QA.</p>
      </div>
      <FaqAccordion items={HOME_FAQ} />
    </div>
  </section>
);

export default HomeFaq;
