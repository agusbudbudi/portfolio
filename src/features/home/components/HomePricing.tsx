import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ThumbsUp } from 'lucide-react';
import { MENTORING_PLANS } from '../../mentoring/data/pricingPlans';

// Free tier (Simulator, Library, Portfolio) next to the paid mentoring plans,
// so "what's free / what does mentoring cost" is answered on the home page.
// Mentoring prices come from mentoring/data/pricingPlans (shared with /mentoring).

const FREE_FEATURES = [
  'Semua project QA Simulator',
  'Semua artikel QA Library',
  'Portfolio QA dengan link sendiri',
  'Login Google untuk simpan progress',
];

const HomePricing: React.FC = () => (
  <section id="harga" className="py-16 md:py-24 bg-ld-canvas scroll-mt-16 font-ld-sans">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="text-center mb-10 md:mb-14">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Harga</p>
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">Mulai gratis, mentoring saat kamu butuh</h2>
        <p className="m-0 text-ld-slate max-w-xl mx-auto leading-relaxed">
          Belajar, praktik, dan portfolio gratis selamanya. Bayar hanya untuk sesi mentoring 1-on-1.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Free tier */}
        <div className="flex flex-col rounded-xl p-6 border border-emerald-200 bg-emerald-50/40">
          <h3 className="m-0 font-semibold text-lg text-ld-graphite">Gratis</h3>
          <p className="m-0 mt-1 mb-5 text-sm text-ld-slate lg:min-h-[3.75rem]">Simulator, Library, dan Portfolio QA.</p>
          <span aria-hidden="true" className="text-sm invisible">-</span>
          <div className="flex items-baseline gap-1 mb-5">
            <span className="font-semibold text-3xl tracking-[-0.02em] text-emerald-700">Rp0</span>
            <span className="text-sm text-ld-slate">/ selamanya</span>
          </div>
          <ul className="m-0 p-0 list-none space-y-3 mb-6 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                <span className="text-sm text-ld-graphite leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
          <Link to="/qa-simulator" className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-lg no-underline bg-white text-ld-graphite border border-ld-ash hover:border-ld-steel transition-colors">
            Mulai Gratis <ArrowRight size={16} />
          </Link>
        </div>

        {/* Paid mentoring plans */}
        {MENTORING_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-xl p-6 border overflow-hidden bg-white ${plan.highlighted ? 'border-ld-violet shadow-[0_8px_24px_rgba(93,74,255,0.12)]' : 'border-ld-ash'}`}
          >
            {(plan.highlighted || plan.promoLabel) && (
              <span className={`absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-bl-lg text-white text-[10px] font-medium uppercase tracking-wide ${plan.promoLabel ? 'bg-rose-500' : 'bg-ld-violet'}`}>
                {plan.promoLabel ?? <><ThumbsUp size={10} /> Paling Hemat</>}
              </span>
            )}
            <h3 className="m-0 font-semibold text-lg text-ld-graphite">{plan.name}</h3>
            <p className="m-0 mt-1 mb-5 text-sm text-ld-slate lg:min-h-[3.75rem]">{plan.description}</p>
            <span className={`text-sm text-ld-fog line-through ${plan.originalPrice ? '' : 'invisible'}`}>{plan.originalPrice ?? '-'}</span>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="font-semibold text-3xl tracking-[-0.02em] text-ld-violet">{plan.price}</span>
              <span className="text-sm text-ld-slate">{plan.unit}</span>
            </div>
            <ul className="m-0 p-0 list-none space-y-3 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check size={18} className="shrink-0 text-ld-violet mt-0.5" />
                  <span className="text-sm text-ld-graphite leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/mentoring/booking"
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-lg no-underline transition-colors ${plan.highlighted ? 'bg-ld-violet text-white hover:bg-[#1f87e6]' : 'bg-ld-cloud text-ld-graphite border border-ld-ash hover:bg-ld-ash'}`}
            >
              {plan.cta} <ArrowRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomePricing;
