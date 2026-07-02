import React, { useState } from 'react';
import { Quote, Linkedin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import endorsementData from '../../../data/endorsements.json';
import SectionHeader from '../common/SectionHeader';

const FeaturedEndorsements: React.FC = () => {
  const [expandedEndorsement, setExpandedEndorsement] = useState<number | null>(null);

  // Show only top 2 endorsements
  const featuredEndorsements = endorsementData.slice(0, 2);

  const toggleEndorsement = (index: number) => {
    setExpandedEndorsement(expandedEndorsement === index ? null : index);
  };

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <SectionHeader
            icon={<Quote size={20} />}
            iconClassName="endorsement-icon"
            title="What Others"
            titleSpan="Say"
            subtitle="Testimonials from colleagues and leaders I've collaborated with."
          />
          <Link
            to="/portfolio/about#endorsement"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-transparent text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl font-semibold text-sm transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start whitespace-nowrap decoration-none"
          >
            Lihat Semua <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredEndorsements.map((endorsement, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-8 flex flex-col gap-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 hover:border-blue-500"
            >
              <div className="flex items-center gap-5">
                <div className="relative w-[60px] h-[60px]">
                  <img src={endorsement.image} alt={endorsement.name} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-2xl border-2 border-white dark:border-slate-900 shadow-md" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-slate-200 dark:border-slate-800 rounded flex items-center justify-center shadow overflow-hidden">
                    <img src={endorsement.logo} alt={endorsement.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">{endorsement.name}</h3>
                    <a href={endorsement.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:opacity-75 transition-opacity">
                      <Linkedin size={16} />
                    </a>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 m-0">{endorsement.relation}</p>
                </div>
              </div>

              <div className="relative">
                <div className={`overflow-hidden transition-all duration-400`}>
                  <p className={`text-slate-650 dark:text-slate-400 text-sm leading-relaxed italic m-0 whitespace-pre-line ${expandedEndorsement === index ? '' : 'line-clamp-3'
                    }`}>
                    {endorsement.content}
                  </p>
                </div>
                {endorsement.content.length > 200 && (
                  <button
                    className="mt-3 bg-transparent border-none text-blue-500 dark:text-blue-400 font-semibold text-xs cursor-pointer p-0 hover:opacity-75 transition-opacity"
                    onClick={() => toggleEndorsement(index)}
                  >
                    {expandedEndorsement === index ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEndorsements;
