import React from 'react';
import { VISIBLE_TESTIMONIALS, type Testimonial } from '../data/testimonials';

const Card: React.FC<{ t: Testimonial; copy: boolean }> = ({ t, copy }) => (
  // Margin (not flex gap) keeps both halves of the track exactly equal, so the
  // loop restarts without a jump. Copies are hidden from screen readers.
  <li aria-hidden={copy || undefined} className={`mr-4 w-[300px] shrink-0 sm:w-[380px] ${copy ? 'motion-reduce:hidden' : ''}`}>
    <figure className="m-0 flex h-full flex-col rounded-2xl border border-ld-frost bg-white p-6">
      {t.sample && (
        <span className="mb-4 self-start rounded-md bg-ld-lilac px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-ld-violet">Contoh</span>
      )}
      <blockquote className="m-0 text-[15px] leading-relaxed text-ld-graphite">&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-6">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ld-violet text-sm font-semibold text-white">{t.name.charAt(0)}</span>
        <span>
          <span className="block text-sm font-semibold text-ld-onyx">{t.name}</span>
          <span className="block text-xs text-ld-slate">{t.role}</span>
        </span>
      </figcaption>
    </figure>
  </li>
);

const TestimonialsSection: React.FC = () => {
  if (VISIBLE_TESTIMONIALS.length === 0) return null;
  // Four copies: the track slides by half (two sets), which stays wider than
  // even very large screens.
  const cards = [0, 1, 2, 3].flatMap((n) => VISIBLE_TESTIMONIALS.map((t) => ({ t, n })));
  return (
    <section id="testimonials" className="scroll-mt-16 bg-ld-cloud py-16 md:py-24">
      <div className="mx-auto mb-10 max-w-2xl px-4 text-center sm:px-6">
        <h2 className="m-0 text-3xl font-semibold leading-tight tracking-[-0.02em] text-ld-graphite sm:text-4xl">Apa Kata Mereka?</h2>
        <p className="m-0 mt-3 text-base text-ld-slate sm:text-lg">Cerita dari yang sedang membangun karier QA.</p>
      </div>
      {/* Full-width marquee, faded at both edges; holds on hover, focus or press. Reduced motion
          gets a still, swipeable row instead. */}
      <div tabIndex={0} aria-label="Testimoni" role="region" className="group overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] md:[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]">
        <ul className="m-0 flex w-max list-none p-0 animate-[marquee_48s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] group-active:[animation-play-state:paused] motion-reduce:animate-none">
          {cards.map(({ t, n }) => <Card key={`${n}-${t.name}`} t={t} copy={n > 0} />)}
        </ul>
      </div>
    </section>
  );
};

export default TestimonialsSection;
