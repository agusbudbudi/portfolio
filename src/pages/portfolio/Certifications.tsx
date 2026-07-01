import React, { useState } from 'react';
import { Award, Newspaper, ArrowUpRight } from 'lucide-react';
import certData from '../../data/certifications.json';
import articleData from '../../data/articles.json';
import SectionHeader from '../../components/portfolio/common/SectionHeader';
import Badge from '../../components/portfolio/common/Badge';

const Certifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'certs' | 'articles'>('certs');

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-8 bg-white dark:bg-slate-950 transition-colors">
      <SectionHeader
        icon={<Award size={20} />}
        iconClassName="cert-icon"
        title="Article &"
        titleSpan="Certifications"
        subtitle="Explore my latest articles and updates"
      />

      <div className="flex gap-4 mt-8 border-b border-slate-200 dark:border-slate-800/80 pb-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-300 ${activeTab === 'certs'
            ? 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/25 dark:text-blue-400'
            : 'text-slate-400 dark:text-slate-500 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/60'
            }`}
          onClick={() => setActiveTab('certs')}
        >
          <Award size={20} /> Certification
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all duration-300 ${activeTab === 'articles'
            ? 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/25 dark:text-blue-400'
            : 'text-slate-400 dark:text-slate-500 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/60'
            }`}
          onClick={() => setActiveTab('articles')}
        >
          <Newspaper size={20} /> Article
        </button>
      </div>

      {activeTab === 'certs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {certData.map((cert, index) => (
            <div key={index} className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[24px] overflow-hidden transition-all duration-400 ease-smooth hover:-translate-y-2 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/35 hover:border-blue-500 h-full group">
              <div className="w-full h-[200px] overflow-hidden relative bg-slate-50 dark:bg-slate-800/30 flex items-center justify-center">
                <img src={cert.image} alt={cert.title} className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                <Badge className="absolute bottom-4 left-4 !bg-blue-500/10 dark:!bg-blue-500/25 !text-blue-500 dark:!text-blue-450 text-[10px] px-2.5 py-1 rounded-lg font-extrabold uppercase border border-slate-200 dark:border-slate-700/60 backdrop-blur-md z-[2]">{cert.year}</Badge>
              </div>
              <div className="p-6 flex flex-col gap-2 flex-grow text-left">
                <h4 className="text-base font-bold text-slate-900 dark:text-white m-0 leading-snug">{cert.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{cert.issuer}</p>
                <a href={cert.verifyLink} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 text-blue-500 dark:text-blue-400 font-bold text-xs pt-2.5 decoration-none hover:underline">
                  <span>Verify Credential</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {articleData.map((article, index) => (
            <div key={index} className=" overflow-hidden">
              {/* All screens: LinkedIn native embed format */}
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
