import React from 'react';
import { Check } from 'lucide-react';
import HeroBadge from '../../../../components/common/HeroBadge';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import OnboardingPage from '../../../onboarding/pages/OnboardingPage';
import LeadCaptureForm from './LeadCaptureForm';

const PERKS = ['4 pertanyaan singkat, kurang dari 1 menit', 'Rekomendasi tampil tanpa login', 'Isi kontak hanya kalau mau dihubungi'];

// The questionnaire is the onboarding flow itself (same questions, scoring,
// and draft as /onboarding), embedded in this section. A lead form sits under
// the result, followed by the same Google claim card guests get there.
const CareerPathQuiz: React.FC = () => (
  <section id="quiz" className="relative scroll-mt-16 bg-ld-cloud py-16 md:py-24">
      <PixelMosaic variant="blue" className="absolute bottom-6 left-6 hidden opacity-25 lg:grid" style={{ width: 'min(28vw, 320px)', transform: 'scale(-1, -1)' }} />
      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
        {/* intro: stays in view while the result + lead form grow on the right */}
        <div className="lg:sticky lg:top-28 lg:col-span-5">
          <HeroBadge dot="static" className="mb-5">KONSULTASI KARIER GRATIS</HeroBadge>
          <h2 className="m-0 text-3xl font-semibold leading-tight tracking-[-0.02em] text-ld-graphite sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            Temukan <span className="text-ld-violet">Career Path <span className="whitespace-nowrap">QA-mu</span></span>
          </h2>
          <p className="m-0 mt-4 max-w-md text-base leading-relaxed text-ld-slate sm:text-lg">Bingung mulai dari mana? Jawab 4 pertanyaan singkat dan temukan program Mentor.QA yang cocok dengan tujuanmu.</p>
          <ul className="m-0 mt-6 flex list-none flex-col gap-3 p-0">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 text-sm font-medium text-ld-graphite">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={14} strokeWidth={3.5} aria-hidden="true" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-ld-frost bg-white lg:col-span-7">
          <OnboardingPage
            embedded
            // the first answer is the "where are you now" question
            resultSlot={(summary) => <LeadCaptureForm context={summary} defaultExperience={summary.answers[0] ?? ''} />}
          />
        </div>
    </div>
  </section>
);

export default CareerPathQuiz;
