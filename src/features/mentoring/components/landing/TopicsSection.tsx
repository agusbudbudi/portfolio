import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, AlertCircle, ThumbsUp, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../../../hooks/useConfig';
import type { TopicConfig } from '../../../../types/mentoring';
import LoadingState from '../../../../components/common/LoadingState';

// Stacking cards: every card is its own `position: sticky` element pinned at
// the same top offset, so as you scroll the next card slides up and covers
// the previous one. The covered card shrinks and dims slightly while it's
// being covered, then fades out once fully hidden so its edges never peek.

const GAP_PX = 32; // flow gap between cards = extra scroll before the next one starts covering
const NAV_PX = 64; // fixed LightdashNavbar height

const pad = (n: number) => String(n).padStart(2, '0');

interface StackLayout {
  /** window.scrollY at which card 0 pins. */
  start: number;
  /** Scroll distance between two cards pinning (card height + gap). */
  step: number;
}

interface TopicCardProps {
  topic: TopicConfig;
  index: number;
  isLast: boolean;
  scrollY: MotionValue<number>;
  layout: React.RefObject<StackLayout>;
  minHeight: number | undefined;
  top: string;
  reduceMotion: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  index,
  isLast,
  scrollY,
  layout,
  minHeight,
  top,
  reduceMotion,
  cardRef,
}) => {
  // 0 → 1 while the next card travels up over this one; > 1 once fully covered.
  const covered = useTransform(scrollY, (y) => {
    const { start, step } = layout.current;
    if (isLast || step <= 0) return 0;
    return Math.max(0, (y - (start + index * step)) / step);
  });
  const scale = useTransform(covered, [0, 1], [1, reduceMotion ? 1 : 0.92]);
  const dim = useTransform(covered, [0, 1], [0, 0.18]);
  const opacity = useTransform(covered, [1, 1.25], [1, 0]);

  return (
    <>
      <div ref={cardRef} className="sticky" style={{ top, zIndex: index + 1 }}>
        <motion.article
          style={{ scale, opacity, minHeight, transformOrigin: 'center top' }}
          className="relative flex flex-col overflow-hidden rounded-3xl border border-ld-ash bg-ld-canvas"
        >
          <div className="relative flex items-stretch bg-ld-violet overflow-hidden">
            <div className="flex-shrink-0 self-center p-3 sm:p-5 lg:p-6 pr-0 sm:pr-0 lg:pr-0">
              <div className="w-24 h-24 sm:w-40 sm:h-40 lg:w-48 lg:h-48 overflow-hidden rounded-xl sm:rounded-2xl bg-ld-lilac">
                {topic.image && (
                  <img
                    src={topic.image}
                    alt={topic.label}
                    decoding="async"
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center py-5 sm:py-8 px-4 sm:px-7 lg:px-8">
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-ld-lilac mb-2 block">
                Topik {pad(index + 1)}
              </span>
              <h3 className="text-xl sm:text-3xl lg:text-[2rem] font-semibold text-white tracking-[-0.02em] mb-2 leading-tight pr-16 sm:pr-24">
                {topic.label}
              </h3>
              <p className="text-sm sm:text-base text-ld-lilac leading-relaxed line-clamp-3">
                {topic.description}
              </p>
            </div>
            {topic.popular && (
              <span className="absolute top-3 right-3 sm:top-5 sm:right-6 flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white text-ld-violet text-[10px] sm:text-[11px] font-medium uppercase tracking-wide shadow-sm">
                <ThumbsUp size={10} />
                Populer
              </span>
            )}
          </div>

          <div className="flex-1 p-5 sm:p-8 lg:p-10">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ld-fog mb-4 sm:mb-5">
              <ListChecks size={14} className="text-ld-violet" />
              Materi yang akan dibahas
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2.5 sm:gap-y-4">
              {(topic.materials ?? []).map((material, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm sm:text-base text-ld-slate leading-relaxed"
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-ld-violet/10 text-ld-violet text-[11px] sm:text-xs font-semibold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{material}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Darkens the card as the next one slides over it */}
          <motion.div
            aria-hidden
            style={{ opacity: dim }}
            className="pointer-events-none absolute inset-0 bg-ld-onyx"
          />
        </motion.article>
      </div>
      {/* Gap as a separate spacer: a margin on the sticky box itself would let the
        containing block push the covered card up by GAP_PX when the stack ends. */}
      {!isLast && <div aria-hidden style={{ height: GAP_PX }} />}
    </>
  );
};

const TopicsSection: React.FC = () => {
  const { config, loading, error } = useConfig();
  const reduceMotion = !!useReducedMotion();
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  const stackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  // Space between the stuck header's bottom and the pinned card's bottom. Used as
  // the header's margin-bottom (cancelled by a negative margin on the stack) so
  // the sticky header releases exactly when the last card starts scrolling away.
  const [releaseGap, setReleaseGap] = useState(0);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const layout = useRef<StackLayout>({ start: 0, step: 0 });
  const { scrollY } = useScroll();

  const topics = config?.topics ?? [];
  const total = topics.length;

  // Cards pin just below the sticky header.
  const pinBase = NAV_PX + headerHeight;
  const top = `${pinBase + 8}px`;

  // Equalize card heights (so a shorter card never reveals the one beneath it)
  // and record the scroll geometry the per-card transforms read from.
  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack || total === 0) return;

    const measure = () => {
      const cards = cardEls.current.slice(0, total).filter(Boolean) as HTMLDivElement[];
      if (cards.length === 0) return;
      const tallest = Math.max(
        ...cards.map((c) => (c.firstElementChild as HTMLElement | null)?.scrollHeight ?? 0),
      );
      setCardHeight((h) => (h === tallest ? h : tallest));

      const header = headerRef.current?.offsetHeight ?? 0;
      setHeaderHeight((h) => (h === header ? h : header));

      const pinTop = parseFloat(getComputedStyle(cards[0]).top) || 0;
      const gap = Math.max(0, Math.round(pinTop + tallest - NAV_PX - header));
      setReleaseGap((g) => (g === gap ? g : gap));
      const stackTop = stack.getBoundingClientRect().top + window.scrollY;
      layout.current = { start: stackTop - pinTop, step: tallest + GAP_PX };
    };

    // On viewport resize drop the forced height so cards can re-flow to their
    // natural size; the effect re-runs (cardHeight dep) and re-measures.
    const onResize = () => setCardHeight(undefined);

    measure();
    // Observe the body too: `start` depends on everything above the stack
    // (hero, stats, late-loading images/fonts), not just the stack itself.
    const ro = new ResizeObserver(measure);
    ro.observe(stack);
    ro.observe(document.body);
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [total, cardHeight, headerHeight, releaseGap]);

  // Warm the cache for every topic image.
  useEffect(() => {
    config?.topics.forEach((t) => {
      if (t.image) new Image().src = t.image;
    });
  }, [config]);

  return (
    <section id="topics" className="pt-8 md:pt-20 pb-8 md:pb-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header + stack share a wrapper so the sticky title releases together
            with the last card (see releaseGap). */}
        <div className="relative">
          <div
            ref={headerRef}
            className="sticky z-[50] bg-ld-canvas text-center pt-4 pb-3 sm:pt-6 sm:pb-4"
            style={{ top: NAV_PX, marginBottom: releaseGap }}
          >
            <h2 className="font-semibold text-2xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-2 sm:mb-3">
              {total > 0 ? `${total} Topik QA Engineering` : 'Topik QA Engineering'}
            </h2>
            <p className="text-ld-slate mx-auto text-sm sm:text-base leading-relaxed">
              Pilih satu atau kombinasi topik sesuai kebutuhan karirmu.
            </p>
          </div>

          <div style={{ marginTop: -releaseGap }}>
            {loading && <LoadingState label="Memuat topik…" className="py-16" />}

            {!loading && error && (
              <div className="flex items-center justify-center gap-2 py-16 text-ld-slate">
                <AlertCircle size={18} />
                <span className="text-sm">Gagal memuat topik.</span>
              </div>
            )}

            {!loading && total > 0 && (
              <div className="w-full max-w-5xl mx-auto">
                <div ref={stackRef} className="relative">
                  {topics.map((topic, i) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      index={i}
                      isLast={i === total - 1}
                      scrollY={scrollY}
                      layout={layout}
                      minHeight={cardHeight}
                      top={top}
                      reduceMotion={reduceMotion}
                      cardRef={(el) => {
                        cardEls.current[i] = el;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/mentoring/booking"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
          >
            Pilih Topik & Booking
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopicsSection;
