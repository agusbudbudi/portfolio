import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import { track } from '../../../lib/analytics';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { readParkedClaim } from '../../onboarding/claimStore';

// Compact invite under the home hero: opens the onboarding questionnaire
// (4 questions → recommended program). Same look as the /career-path final
// CTA (white, lilac glow, violet glow + pixel mosaics behind the cut-out photo),
// shrunk into a single strip. The photo stands on the card's bottom edge and
// pops out above its top, so the card itself stays short.
// Hidden once the visitor has their program: a signed-in user who completed
// onboarding, or a guest whose answers are parked waiting to be claimed.

const HomePersonalizeCard: React.FC = () => {
  const signedIn = useAdminAuthStore((s) => !!s.token);
  const status = useAdminAuthStore((s) => s.user?.onboardingStatus);
  // signed in but profile not restored yet: stay hidden rather than flash
  if (signedIn ? !status || status === 'completed' : readParkedClaim() !== null) return null;

  return (
  <section className="bg-ld-canvas font-ld-sans pt-12 sm:pt-14">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <Link
        to="/onboarding?next=%2F"
        onClick={() => track('onboarding_banner_clicked', { path: '/', placement: 'home_card' })}
        className="group relative block rounded-2xl border border-ld-frost bg-white no-underline transition-[border-color,box-shadow] hover:border-ld-violet/40 hover:shadow-[0_12px_32px_-16px_rgba(37,144,255,0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ld-violet"
      >
        {/* backdrop clipped to the card; the photo below is not */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-ld-lilac/60 blur-3xl" />
          <div className="absolute -bottom-16 right-0 w-[260px] h-[220px] rounded-full bg-ld-violet/15 blur-3xl" />
          <PixelMosaic variant="blue" className="absolute bottom-0 right-[205px] md:right-[250px] hidden sm:grid w-[170px] md:w-[200px] opacity-70" style={{ transform: 'scaleY(-1)' }} />
        </div>

        <div className="relative py-5 sm:py-7 pl-5 sm:pl-7 pr-[148px] sm:pr-[240px] md:pr-[295px]">
          <h2 className="m-0 text-base sm:text-xl font-semibold leading-snug tracking-[-0.015em] text-ld-graphite">
            Bingung mulai dari mana?
          </h2>
          <p className="m-0 mt-1 text-[13px] sm:text-sm text-ld-slate truncate">
            Jawab 4 pertanyaan, dapatkan rekomendasi program QA yang pas buatmu. Cuma 1 menit.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-ld-violet px-3.5 py-2 text-[13px] sm:text-sm font-medium text-white transition-colors group-hover:bg-[#1f87e6]">
            Temukan programku
            <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        <img
          src="/shared/img/journey/cta.webp"
          alt=""
          aria-hidden="true"
          width={1100}
          height={843}
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute bottom-0 right-2 sm:right-4 md:right-6 w-[164px] sm:w-[230px] md:w-[275px] h-auto rounded-br-2xl transition-transform duration-300 origin-bottom group-hover:scale-[1.03]"
        />
      </Link>
    </div>
  </section>
  );
};

export default HomePersonalizeCard;
