import React from 'react';

const benefits = [
  {
    image: '/img/benefit/fokus-1-on-1.webp',
    title: 'Fokus 1-on-1',
    description: 'Kamu dan mentor, tanpa distraksi.',
  },
  {
    image: '/img/benefit/real-world-cases.webp',
    title: 'Real-world Cases',
    description: 'Kasus nyata, bukan teori generik.',
  },
  {
    image: '/img/benefit/booking-gampang.webp',
    title: 'Booking Gampang',
    description: 'Booking cepat, tanpa platform tambahan.',
  },
  {
    image: '/img/benefit/career-oriented.webp',
    title: 'Career-Oriented',
    description: 'Bahas karir QA, bukan cuma teknikal.',
  },
];

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-8 md:py-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Lebih dari Sekadar Belajar
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Feedback langsung dari mentor, bukan video pre-recorded yang gak bisa jawab pertanyaanmu.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map(({ image, title, description }) => (
            <div
              key={title}
              className="p-4 lg:p-6 rounded-xl bg-ld-canvas border border-ld-ash text-left"
            >
              <div className="relative w-24 h-24 mb-4">
                <img
                  src={image}
                  alt={title}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-28 object-contain object-bottom"
                />
              </div>
              <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-1.5">{title}</h3>
              <p className="text-sm text-ld-slate leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
