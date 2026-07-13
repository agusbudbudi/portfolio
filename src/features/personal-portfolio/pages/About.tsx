import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Briefcase, MapPin, GraduationCap, ChevronDown, ChevronUp, Quote, Linkedin } from 'lucide-react';
import experienceData from '../data/experience.json';
import educationData from '../data/education.json';
import endorsementData from '../data/endorsements.json';

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const parsePeriodDate = (part: string): { year: number; month: number } | null => {
  const trimmed = part.trim();
  if (/present/i.test(trimmed)) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  const match = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const monthIndex = MONTHS.findIndex(m => match[1].toLowerCase().startsWith(m));
  if (monthIndex === -1) return null;
  return { year: parseInt(match[2], 10), month: monthIndex };
};

const formatDuration = (period: string): string | null => {
  const [startPart, endPart] = period.split('-').map(p => p.trim());
  const start = startPart && parsePeriodDate(startPart);
  const end = endPart && parsePeriodDate(endPart);
  if (!start || !end) return null;

  const totalMonths = Math.max(1, (end.year - start.year) * 12 + (end.month - start.month) + 1);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yrs = `${years} yr${years === 1 ? '' : 's'}`;
  const mos = `${months} mo${months === 1 ? '' : 's'}`;

  if (years === 0) return mos;
  if (months === 0) return yrs;
  return `${yrs} ${mos}`;
};

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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 pb-16 font-ld-sans bg-ld-canvas">
      {/* Profile Header Section */}
      <section className="flex flex-col gap-8 mb-14">
        <div className="flex flex-col sm:flex-row sm:items-start gap-8">
          <div className="relative w-[120px] h-[120px] min-w-[120px]">
            <img src="/personal-portfolio/img/profile/profile-agus.webp" alt="Agus Budiman" width={120} height={120} loading="eager" fetchPriority="high" decoding="async" className="w-full h-full object-cover rounded-2xl border-[4px] border-ld-canvas shadow-ld-subtle-3" />
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-[3px] border-ld-canvas rounded-full"></span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-ld-display font-semibold text-3xl sm:text-5xl tracking-[-0.02em] text-ld-graphite m-0 leading-tight">Agus <span className="text-ld-violet">Budiman</span></h1>
            <div className="flex items-center gap-2 text-ld-slate text-sm">
              <MapPin size={16} />
              <span>Jakarta, Indonesia</span>
            </div>
            <div className="flex gap-2.5 mt-2 flex-wrap">
              <span className="inline-flex items-center text-xs px-3 py-1 bg-ld-cloud text-ld-graphite rounded-full font-medium whitespace-nowrap">QA Engineer</span>
              <span className="inline-flex items-center text-xs px-3 py-1 bg-ld-cloud text-ld-graphite rounded-full font-medium whitespace-nowrap">Fullstack QA</span>
              <span className="inline-flex items-center text-xs px-3 py-1 bg-ld-cloud text-ld-graphite rounded-full font-medium whitespace-nowrap">5+ Years Exp</span>
            </div>
          </div>
        </div>
        <div className="max-w-[800px] text-lg text-ld-slate leading-relaxed">
          <p>
            <strong className="text-ld-graphite">QA Engineer</strong> with 6+ years of experience in Manual and Automation
            Testing across Healthcare, FinTech, OTA, EduTech, and ITSM
            domains. Proven ability to analyze requirements, design and
            execute comprehensive test plans, and collaborate effectively with
            cross-functional teams.
          </p>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="mb-14">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-blue-500/10 text-blue-500">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              Work <span className="text-ld-violet">Experience</span>
            </h2>
            <p className="text-sm text-ld-slate">A timeline of my professional career, milestones, and key contributions.</p>
          </div>
        </div>

        <div className="flex flex-col relative">
          {experienceData.map((exp, index) => (
            <div key={index} className="flex gap-4 relative">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full z-10 mt-6 ${index === 0 ? 'bg-ld-violet' : 'bg-ld-ash border-2 border-ld-canvas'}`}></div>
                {index < experienceData.length - 1 && <div className="flex-grow w-0.5 bg-ld-frost my-1"></div>}
              </div>

              <div
                className="flex-grow bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-6 mb-6 cursor-pointer transition-shadow relative overflow-hidden hover:shadow-ld-subtle-3"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                  <div className="flex items-start gap-5">
                    <div className="w-[60px] h-[60px] min-w-[50px] flex items-center justify-center bg-ld-canvas rounded-lg overflow-hidden shadow-ld-subtle-2">
                      <img src={exp.logo} alt={exp.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{exp.company}</h3>
                        {index === 0 && <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-[10px] font-semibold">Current</span>}
                      </div>
                      <h4 className="text-sm font-medium text-ld-violet m-0">{exp.role}</h4>
                    </div>
                  </div>
                  <div className="flex flex-row items-center sm:flex-col sm:items-end gap-2 sm:gap-1 text-xs text-ld-fog">
                    <span>{exp.period}</span>
                    {formatDuration(exp.period) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-ld-cloud text-ld-graphite text-[10px] font-medium">
                        {formatDuration(exp.period)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-ld-fog mb-0">
                  <span>{exp.employmentType} · {exp.locationType}</span>
                  <span>•</span>
                  <MapPin size={12} />
                  <span>{exp.location}</span>
                </div>

                {/* Collapsible Details */}
                <div className={`grid transition-all duration-300 ease-in-out ${expandedIndex === index ? 'grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-dashed border-ld-ash' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                  <div className="overflow-hidden">
                    <ul className="list-none p-0 m-0 flex flex-col gap-3">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i} className="text-sm text-ld-slate leading-relaxed relative pl-5 before:content-['•'] before:absolute before:left-0 before:text-ld-violet">
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="absolute bottom-3 right-4 text-ld-fog opacity-60">
                  {expandedIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="mb-14">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-blue-500/10 text-blue-500">
            <GraduationCap size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              Education
            </h2>
            <p className="text-sm text-ld-slate">Academic foundations and certifications that shaped my technical expertise.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educationData.map((edu, index) => (
            <div key={index} className="bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-5">
                <div className="w-[50px] h-[50px] min-w-[50px] flex items-center justify-center bg-ld-canvas border border-ld-ash rounded-lg overflow-hidden p-1">
                  <img src={edu.logo} alt={edu.institution} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{edu.institution}</h3>
                  <p className="text-xs text-ld-slate m-0 leading-normal">
                    <strong>{edu.degree}</strong> · {edu.major}
                  </p>
                  <span className="text-[11px] text-ld-fog font-medium">{edu.period}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Endorsement Section */}
      <section id="endorsement">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-blue-500/10 text-blue-500">
            <Quote size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              Endorsements
            </h2>
            <p className="text-sm text-ld-slate">Testimonials from colleagues and leaders I've collaborated with.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endorsementData.map((endorsement, index) => (
            <div
              key={index}
              className="bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-8 flex flex-col gap-6 transition-shadow hover:shadow-ld-subtle-3"
            >
              <div className="flex items-center gap-5">
                <div className="relative w-[60px] h-[60px]">
                  <img src={endorsement.image} alt={endorsement.name} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-xl border-2 border-ld-canvas shadow-ld-subtle-2" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-ld-canvas border border-ld-ash rounded flex items-center justify-center shadow-ld-subtle-2 overflow-hidden">
                    <img src={endorsement.logo} alt={endorsement.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{endorsement.name}</h3>
                    <a href={endorsement.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:opacity-75 transition-opacity">
                      <Linkedin size={16} />
                    </a>
                  </div>
                  <p className="text-xs text-ld-slate m-0">{endorsement.relation}</p>
                </div>
              </div>

              <div className="relative">
                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${expandedEndorsement === index ? 'max-h-[1000px]' : 'max-h-[4.5rem]'
                  }`}>
                  <p className="text-ld-slate text-sm leading-relaxed italic m-0 whitespace-pre-line">
                    {endorsement.content}
                  </p>
                </div>
                {endorsement.content.length > 200 && (
                  <button
                    className="mt-3 bg-transparent border-none text-ld-violet font-medium text-xs cursor-pointer p-0 hover:opacity-75 transition-opacity"
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
