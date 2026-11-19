import React from 'react';
import FaqAccordion from '../../../../components/common/FaqAccordion';
import { FAQ_ITEMS } from './content';

// Shared FaqAccordion keeps every answer in the DOM (crawlable, matches the
// FAQPage JSON-LD) while collapsing visually; one item open at a time.
const SimFaqSection: React.FC = () => (
  <section id="faq" className="py-16 md:py-24 bg-ld-canvas scroll-mt-16">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="text-center mb-10 md:mb-14">
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
          Pertanyaan umum
        </h2>
        <p className="m-0 text-ld-slate max-w-xl mx-auto leading-relaxed">Hal yang sering ditanyakan sebelum mulai simulasi.</p>
      </div>
      <FaqAccordion items={FAQ_ITEMS} />
    </div>
  </section>
);

export default SimFaqSection;
