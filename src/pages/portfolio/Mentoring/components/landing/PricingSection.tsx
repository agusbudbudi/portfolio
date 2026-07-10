import React from 'react';
import { Check, ArrowRight, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Single Session',
    originalPrice: 'Rp150.000',
    price: 'Rp99.000',
    unit: '/ sesi',
    promoLabel: 'Promo 34%',
    description: 'Cocok buat coba dulu atau bahas 1 topik spesifik.',
    features: [
      '1x sesi 60 menit',
      '1-on-1 dengan mentor',
      'Pilih 1-2 topik per sesi',
      'Konfirmasi via WhatsApp',
    ],
    highlighted: false,
    cta: 'Booking Single Session',
  },
  {
    name: 'Paket 3 Sesi',
    price: 'Rp400.000',
    unit: '/ paket',
    description: 'Hemat buat progres belajar berkelanjutan.',
    features: [
      '3x sesi 60 menit',
      '1-on-1 dengan mentor',
      'Prioritas pilih jadwal',
      'Bebas ganti topik tiap sesi',
      'Konfirmasi via WhatsApp',
    ],
    highlighted: true,
    cta: 'Booking Paket 3 Sesi',
  },
  {
    name: 'Interview Preparation',
    price: 'Rp150.000',
    unit: '/ sesi',
    description: 'Fokus persiapan interview: mock interview & review CV/portfolio QA.',
    features: [
      '1x sesi 60 menit',
      '1-on-1 dengan mentor',
      'Mock interview teknikal QA',
      'Review CV & portfolio',
      'Konfirmasi via WhatsApp',
    ],
    highlighted: false,
    cta: 'Booking Interview Prep',
  },
];

const PricingSection: React.FC = () => {
  return (
    <section id="pricing" className="py-8 md:py-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Harga Mentoring
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Investasi terjangkau buat percepat progres karir QA-mu.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl p-6 border overflow-hidden ${plan.highlighted
                ? 'bg-ld-canvas border-ld-violet shadow-[0_8px_24px_rgba(93,74,255,0.12)]'
                : 'bg-ld-canvas border-ld-ash'
                }`}
            >
              {plan.highlighted && (
                <span className="absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-bl-lg bg-ld-violet text-white text-[10px] font-medium uppercase tracking-wide">
                  <ThumbsUp size={10} />
                  Paling Hemat
                </span>
              )}
              {plan.promoLabel && (
                <span className="absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-bl-lg bg-rose-500 text-white text-[10px] font-medium uppercase tracking-wide">
                  {plan.promoLabel}
                </span>
              )}

              <h3 className="font-ld-display font-semibold text-lg text-ld-graphite mb-1">{plan.name}</h3>
              <p className="text-sm text-ld-slate mb-5">{plan.description}</p>

              {plan.originalPrice && (
                <span className="text-sm text-ld-fog line-through">{plan.originalPrice}</span>
              )}
              <div className="flex items-baseline gap-1 mb-5">
                <span className="font-ld-display font-semibold text-3xl text-ld-graphite tracking-[-0.02em] text-ld-violet">
                  {plan.price}
                </span>
                <span className="text-sm text-ld-slate">{plan.unit}</span>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check size={18} className="flex-shrink-0 text-ld-violet mt-0.5" />
                    <span className="text-sm text-ld-graphite leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/mentoring/booking"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-lg no-underline transition-colors ${plan.highlighted
                  ? 'bg-ld-violet text-white hover:bg-[#1f87e6]'
                  : 'bg-ld-cloud text-ld-graphite border border-ld-ash hover:bg-ld-ash'
                  }`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
