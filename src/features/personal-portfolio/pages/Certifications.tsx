import React, { useState } from 'react';
import { Award, Newspaper, ArrowUpRight } from 'lucide-react';
import certData from '../data/certifications.json';
import articleData from '../data/articles.json';

const Certifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'certs' | 'articles'>('certs');

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 pb-16 font-ld-sans bg-ld-canvas">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-teal-500/10 text-teal-500">
          <Award size={20} />
        </div>
        <div>
          <h1 className="font-ld-display font-semibold text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em] text-ld-graphite mb-2">
            Article & <span className="text-ld-violet">Certifications</span>
          </h1>
          <p className="text-sm sm:text-base text-ld-slate max-w-2xl leading-relaxed tracking-[-0.01em]">
            Explore my latest articles and updates
          </p>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="inline-flex items-center gap-1 p-1 rounded-full bg-ld-cloud mb-8">
        <button
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer border-none transition-colors ${activeTab === 'certs'
            ? 'bg-ld-canvas text-ld-graphite shadow-ld-subtle-2'
            : 'bg-transparent text-ld-slate'
            }`}
          onClick={() => setActiveTab('certs')}
        >
          <Award size={16} /> Certification
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer border-none transition-colors ${activeTab === 'articles'
            ? 'bg-ld-canvas text-ld-graphite shadow-ld-subtle-2'
            : 'bg-transparent text-ld-slate'
            }`}
          onClick={() => setActiveTab('articles')}
        >
          <Newspaper size={16} /> Article
        </button>
      </div>

      {activeTab === 'certs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {certData.map((cert, index) => (
            <div
              key={index}
              className="flex flex-col bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden transition-shadow hover:shadow-ld-subtle-3 h-full group"
            >
              <div className="w-full h-[200px] overflow-hidden relative bg-ld-frost flex items-center justify-center">
                <img
                  src={cert.image}
                  alt={cert.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-4 left-4 bg-ld-lavender text-ld-violet text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wide">
                  {cert.year}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-2 flex-grow text-left">
                <h4 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] leading-snug m-0">
                  {cert.title}
                </h4>
                <p className="text-sm text-ld-slate m-0">{cert.issuer}</p>
                <a
                  href={cert.verifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 text-ld-violet font-medium text-xs pt-2.5 no-underline hover:underline"
                >
                  <span>Verify Credential</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {articleData.map((article, index) => (
            <div key={index} className="overflow-hidden">
              <div className="flex items-center justify-center">
                <iframe
                  src={article.url}
                  height="567"
                  width="504"
                  allowFullScreen
                  title={article.title}
                  className="max-w-full border-none"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certifications;
