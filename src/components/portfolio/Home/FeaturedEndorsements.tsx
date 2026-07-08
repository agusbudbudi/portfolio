import React, { useState } from 'react';
import { Quote, Linkedin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import endorsementData from '../../../data/endorsements.json';

const FeaturedEndorsements: React.FC = () => {
  const [expandedEndorsement, setExpandedEndorsement] = useState<number | null>(null);

  // Show only top 2 endorsements
  const featuredEndorsements = endorsementData.slice(0, 2);

  const toggleEndorsement = (index: number) => {
    setExpandedEndorsement(expandedEndorsement === index ? null : index);
  };

  return (
    <section className="py-12 md:py-20 bg-ld-canvas overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-ld-lilac text-ld-violet">
              <Quote size={20} />
            </div>
            <div>
              <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
                What Others <span className="text-ld-violet">Say</span>
              </h2>
              <p className="text-sm text-ld-slate">Testimonials from colleagues and leaders I've collaborated with.</p>
            </div>
          </div>
          <Link
            to="/portfolio/about#endorsement"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-ld-canvas text-ld-graphite border border-ld-ash hover:border-ld-violet rounded-lg font-medium text-sm transition-colors w-full sm:w-auto justify-center sm:justify-start whitespace-nowrap no-underline"
          >
            Lihat Semua <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredEndorsements.map((endorsement, index) => (
            <div
              key={index}
              className="bg-ld-canvas border border-ld-ash rounded-xl p-6 flex flex-col gap-6 transition-colors hover:border-ld-violet hover:shadow-ld-subtle-2"
            >
              <div className="flex items-center gap-5">
                <div className="relative w-[60px] h-[60px]">
                  <img src={endorsement.image} alt={endorsement.name} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-lg border-2 border-white shadow-sm" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-ld-ash rounded flex items-center justify-center shadow overflow-hidden">
                    <img src={endorsement.logo} alt={endorsement.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-ld-graphite m-0">{endorsement.name}</h3>
                    <a href={endorsement.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:opacity-75 transition-opacity">
                      <Linkedin size={16} />
                    </a>
                  </div>
                  <p className="text-xs text-ld-fog m-0">{endorsement.relation}</p>
                </div>
              </div>

              <div className="relative">
                <div className={`overflow-hidden transition-all duration-400`}>
                  <p className={`text-ld-slate text-sm leading-relaxed italic m-0 whitespace-pre-line ${expandedEndorsement === index ? '' : 'line-clamp-3'
                    }`}>
                    {endorsement.content}
                  </p>
                </div>
                {endorsement.content.length > 200 && (
                  <button
                    className="mt-3 bg-transparent border-none text-ld-violet font-semibold text-xs cursor-pointer p-0 hover:opacity-75 transition-opacity"
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
