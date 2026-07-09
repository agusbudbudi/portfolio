import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, AlertCircle, ThumbsUp, ChevronUp, ChevronDown, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../../../../hooks/useConfig';
import type { MentoringConfig } from '../../../../../hooks/useConfig';

const TopicsSection: React.FC = () => {
  const { config, loading, error } = useConfig();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevConfig, setPrevConfig] = useState<MentoringConfig | null>(config);

  // Reset selection when config identity changes (e.g. retry/refetch) — done during
  // render per React's "adjusting state" pattern to avoid the extra effect-driven render.
  if (config !== prevConfig) {
    setPrevConfig(config);
    setSelectedIndex(0);
  }

  const topics = config?.topics ?? [];
  const selectedTopic = topics[selectedIndex];

  const goPrev = () => setSelectedIndex((i) => Math.max(0, i - 1));
  const goNext = () => setSelectedIndex((i) => Math.min(topics.length - 1, i + 1));

  // Windowed list: keep selected card centered (slot 2 of 3), clamped at edges.
  const windowSize = 3;
  const windowStart = Math.max(0, Math.min(selectedIndex - 1, topics.length - windowSize));
  const visibleTopics = topics
    .slice(windowStart, windowStart + windowSize)
    .map((topic, i) => ({ topic, index: windowStart + i }));

  return (
    <section id="topics" className="py-8 md:py-20 bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            {topics.length > 0 ? `${topics.length} Topik QA Engineering` : 'Topik QA Engineering'}
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Pilih topik sesuai kebutuhan karirmu. Setiap sesi bisa fokus pada satu atau kombinasi topik.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-ld-slate">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat topik…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center gap-2 py-16 text-ld-slate">
            <AlertCircle size={18} />
            <span className="text-sm">Gagal memuat topik.</span>
          </div>
        )}

        {!loading && config && selectedTopic && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start">
            {/* Left: scrollable topic list (3 visible by default) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-ld-fog">
                  Pilih topik
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={selectedIndex === 0}
                    aria-label="Topik sebelumnya"
                    className="p-1.5 rounded-lg border border-ld-ash bg-white text-ld-graphite disabled:opacity-30 disabled:cursor-not-allowed hover:border-ld-violet transition-colors cursor-pointer"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={selectedIndex === topics.length - 1}
                    aria-label="Topik berikutnya"
                    className="p-1.5 rounded-lg border border-ld-ash bg-white text-ld-graphite disabled:opacity-30 disabled:cursor-not-allowed hover:border-ld-violet transition-colors cursor-pointer"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-3">
              {visibleTopics.map(({ topic, index }) => {
                const isSelected = index === selectedIndex;
                return (
                  <motion.button
                    key={topic.id}
                    layout
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-pressed={isSelected}
                    animate={{ scale: isSelected ? 1.04 : 1 }}
                    style={{ transformOrigin: 'center' }}
                    className={`relative flex items-center gap-3.5 w-full bg-ld-canvas rounded-xl border overflow-hidden p-3.5 text-left cursor-pointer transition-colors duration-300 ${
                      isSelected
                        ? 'border-ld-violet ring-2 ring-ld-lilac shadow-md z-10'
                        : 'border-ld-ash hover:border-ld-violet/50'
                    }`}
                  >
                    {topic.popular && (
                      <span className="absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-bl-lg bg-ld-violet text-white text-[10px] font-medium uppercase tracking-wide">
                        <ThumbsUp size={10} />
                        Populer
                      </span>
                    )}
                    {topic.image && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-ld-frost">
                        <img
                          src={topic.image}
                          alt={topic.label}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-1 leading-snug">
                        {topic.label}
                      </h3>
                      <p className="text-sm text-ld-slate leading-relaxed line-clamp-2">
                        {topic.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
              </div>
            </div>

            {/* Right: detail of selected topic */}
            <div className="lg:sticky lg:top-24 lg:self-center overflow-hidden rounded-2xl border border-ld-ash bg-gradient-to-br from-ld-canvas to-ld-frost/50 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTopic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="relative flex items-stretch gap-4 bg-ld-violet overflow-hidden">
                    {selectedTopic.image && (
                      <div className="aspect-square w-36 md:w-44 flex-shrink-0 self-stretch overflow-hidden bg-white/10">
                        <img
                          src={selectedTopic.image}
                          alt={selectedTopic.label}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center py-7 pr-6 md:pr-7">
                      <span className="text-xs font-semibold uppercase tracking-widest text-ld-lilac mb-1.5 block">
                        Fokus mentoring
                      </span>
                      <h3 className="text-xl font-ld-display font-semibold text-white tracking-[-0.01em] mb-1.5 leading-snug">
                        {selectedTopic.label}
                      </h3>
                      <p className="text-sm text-ld-lilac leading-relaxed">
                        {selectedTopic.description}
                      </p>
                    </div>
                    {selectedTopic.popular && (
                      <span className="absolute top-4 right-4 md:right-5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-ld-violet text-[10px] font-medium uppercase tracking-wide shadow-sm">
                        <ThumbsUp size={10} />
                        Populer
                      </span>
                    )}
                  </div>

                  <div className="p-6 md:p-7">
                    {selectedTopic.materials && selectedTopic.materials.length > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ld-fog mb-4">
                          <ListChecks size={14} className="text-ld-violet" />
                          Materi yang akan dibahas
                        </h4>
                        <ul className="space-y-3">
                          {selectedTopic.materials.map((material, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-ld-slate leading-relaxed">
                              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-ld-violet/10 text-ld-violet text-[11px] font-semibold mt-0.5">
                                {i + 1}
                              </span>
                              <span>{material}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
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
