import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Briefcase, MapPin, GraduationCap, ChevronDown, ChevronUp, Quote, Linkedin } from 'lucide-react';
import experienceData from '../../data/experience.json';
import educationData from '../../data/education.json';
import endorsementData from '../../data/endorsements.json';
import SectionHeader from '../../components/portfolio/common/SectionHeader';
import Badge from '../../components/portfolio/common/Badge';

const About: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedEndorsement, setExpandedEndorsement] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleEndorsement = (index: number) => {
    setExpandedEndorsement(expandedEndorsement === index ? null : index);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-8 bg-white dark:bg-slate-950 transition-colors">
      {/* Profile Header Section */}
      <section className="flex flex-col gap-8 mb-16 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start gap-8">
          <div className="relative w-[120px] h-[120px] min-w-[120px]">
            <img src="/img/profile/profile-agus.webp" alt="Agus Budiman" width={120} height={120} loading="eager" fetchPriority="high" decoding="async" className="w-full h-full object-cover rounded-3xl border-[4px] border-white dark:border-slate-900 shadow-xl shadow-blue-500/10" />
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-[3px] border-white dark:border-slate-900 rounded-full"></span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white m-0 leading-tight">Agus <span className="text-blue-500">Budiman</span></h1>
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm">
              <MapPin size={16} />
              <span>Jakarta, Indonesia</span>
            </div>
            <div className="flex gap-2.5 mt-2 flex-wrap">
              <Badge>QA Engineer</Badge>
              <Badge>Fullstack QA</Badge>
              <Badge>5+ Years Exp</Badge>
            </div>
          </div>
        </div>
        <div className="max-w-[800px] text-lg text-slate-650 dark:text-slate-405 leading-relaxed">
          <p>
            <strong>QA Engineer</strong> with 6+ years of experience in Manual and Automation
            Testing across Healthcare, FinTech, OTA, EduTech, and ITSM
            domains. Proven ability to analyze requirements, design and
            execute comprehensive test plans, and collaborate effectively with
            cross-functional teams.
          </p>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="mb-16 animate-fade-in">
        <SectionHeader
          icon={<Briefcase size={20} />}
          title="Work"
          titleSpan="Experience"
          subtitle="A timeline of my professional career, milestones, and key contributions."
        />

        <div className="flex flex-col relative">
          {experienceData.map((exp, index) => (
            <div key={index} className="flex gap-4 relative">
              <div className="flex flex-col items-center w-5">
                <div className={`w-3 h-3 rounded-full z-10 mt-6 ${index === 0 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-950'}`}></div>
                {index < experienceData.length - 1 && <div className="flex-grow w-0.5 bg-slate-100 dark:bg-slate-800/80 my-1"></div>}
              </div>

              <div
                className="flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-4 sm:p-6 mb-6 cursor-pointer transition-all duration-300 relative overflow-hidden hover:shadow-md hover:border-blue-500"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                  <div className="flex items-start gap-5">
                    <div className="w-[60px] h-[60px] min-w-[50px] flex items-center justify-center bg-white rounded-xl overflow-hidden shadow-sm">
                      <img src={exp.logo} alt={exp.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">{exp.company}</h3>
                        {index === 0 && <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-[10px] font-bold">Current</span>}
                      </div>
                      <h4 className="text-sm font-semibold text-blue-550 dark:text-blue-400 m-0">{exp.role}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <span>{exp.period}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-405 dark:text-slate-500 mb-0">
                  <span>{exp.employmentType} · {exp.locationType}</span>
                  <span>•</span>
                  <MapPin size={12} />
                  <span>{exp.location}</span>
                </div>

                {/* Collapsible Details */}
                <div className={`grid transition-all duration-300 ease-in-out ${expandedIndex === index ? 'grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800/80' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                  <div className="overflow-hidden">
                    <ul className="list-none p-0 m-0 flex flex-col gap-3">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed relative pl-5 before:content-['•'] before:absolute before:left-0 before:text-blue-500">
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="absolute bottom-3 right-4 text-slate-400 dark:text-slate-500 opacity-60">
                  {expandedIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="mb-16 animate-fade-in">
        <SectionHeader
          icon={<GraduationCap size={20} />}
          title="Education"
          titleSpan=""
          subtitle="Academic foundations and certifications that shaped my technical expertise."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educationData.map((edu, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-4 sm:p-6">
              <div className="flex items-start gap-5">
                <div className="w-[50px] h-[50px] min-w-[50px] flex items-center justify-center bg-white border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-1">
                  <img src={edu.logo} alt={edu.institution} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">{edu.institution}</h3>
                  <p className="text-xs text-slate-650 dark:text-slate-400 m-0 leading-normal">
                    <strong>{edu.degree}</strong> · {edu.major}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-555 font-medium">{edu.period}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Endorsement Section */}
      <section id="endorsement" className="mb-16 animate-fade-in">
        <SectionHeader
          icon={<Quote size={20} />}
          title="Endorsements"
          titleSpan=""
          subtitle="Testimonials from colleagues and leaders I've collaborated with."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endorsementData.map((endorsement, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-4 sm:p-8 flex flex-col gap-6 transition-all duration-300 hover:shadow-md hover:border-blue-500"
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
                <div className="overflow-hidden">
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
      </section>
    </div>
  );
};

export default About;
