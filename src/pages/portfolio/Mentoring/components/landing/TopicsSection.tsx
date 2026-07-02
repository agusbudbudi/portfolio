import React from 'react';
import { ArrowRight, Loader2, AlertCircle, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../../../../hooks/useConfig';

const TopicsSection: React.FC = () => {
  const { config, loading, error } = useConfig();

  return (
    <section id="topics" className="py-16 md:py-20 bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            7 Topik QA Engineering
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

        {!loading && config && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {config.topics.slice(0, 6).map(topic => (
              <div
                key={topic.id}
                className="relative flex items-center gap-4 bg-ld-canvas rounded-xl border border-ld-ash overflow-hidden p-4 text-left"
              >
                {topic.popular && (
                  <span className="absolute top-0 right-0 flex items-center gap-1 px-2.5 py-1 rounded-bl-lg bg-ld-violet text-white text-[10px] font-medium uppercase tracking-wide">
                    <ThumbsUp size={10} />
                    Populer
                  </span>
                )}
                {topic.image && (
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-ld-frost">
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
                  <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-1.5 leading-snug">
                    {topic.label}
                  </h3>
                  <p className="text-sm text-ld-slate leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/mentoring/booking"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#4d3de6] transition-colors"
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
