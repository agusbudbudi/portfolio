import React from 'react';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../../../../hooks/useConfig';

const TopicsSection: React.FC = () => {
  const { config, loading, error } = useConfig();

  return (
    <section id="topics" className="py-12 md:py-20 bg-slate-50/60 dark:bg-slate-900/40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            Apa yang Kamu Pelajari
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            7 Topik QA Engineering
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Pilih topik sesuai kebutuhan karirmu. Setiap sesi bisa fokus pada satu atau kombinasi topik.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Memuat topik…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500 dark:text-slate-400">
            <AlertCircle size={18} />
            <span className="text-sm">Gagal memuat topik.</span>
          </div>
        )}

        {/* Topic grid */}
        {!loading && config && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {config.topics.map(topic => (
              <div
                key={topic.id}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:border-blue-500/40 hover:shadow-lg dark:hover:shadow-slate-900/60 transition-all duration-300"
              >
                {topic.image && (
                  <div className="h-48 sm:h-36 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={topic.image}
                      alt={topic.label}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {topic.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                    {topic.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            to="/mentoring/booking"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg shadow-blue-500/25"
          >
            Pilih Topik & Booking
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopicsSection;
