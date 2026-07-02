import React from 'react';
import { Briefcase, ArrowUpRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import experienceData from '../../../data/experience.json';

const WorkExperienceTimeline: React.FC = () => {
  const calculateDuration = (period: string) => {
    const parts = period.split(' - ');
    const startStr = parts[0];
    const endStr = parts[1] === 'Present' ? new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : parts[1];

    const start = new Date(startStr);
    const end = new Date(endStr);

    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    months += 1;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let durationStr = '';
    if (years > 0) durationStr += `${years} yr${years > 1 ? 's' : ''} `;
    if (remainingMonths > 0) durationStr += `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;

    return durationStr.trim();
  };

  return (
    <section className="p-0 overflow-hidden relative">
      <div className="relative py-20 bg-blue-500 dark:bg-blue-600 overflow-hidden">
        {/* Giant background text */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6rem] md:text-[15rem] font-black text-white opacity-[0.04] whitespace-nowrap pointer-events-none z-0 tracking-widest uppercase select-none">
          EXPERIENCE
        </div>

        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 min-w-10 rounded-xl flex items-center justify-center mt-1 bg-white/20 text-white">
                <Briefcase size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-white m-0">
                  Work <span className="font-normal italic text-white/80">Experience</span>
                </h2>
                <p className="text-sm text-white/90 m-0">My professional journey and career growth.</p>
              </div>
            </div>
            <NavLink
              to="/portfolio/about#experience"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-transparent text-white border border-white/40 hover:bg-white/10 hover:border-white rounded-2xl font-semibold text-sm transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start whitespace-nowrap decoration-none"
            >
              Lihat Detail <ArrowUpRight size={18} />
            </NavLink>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-none mt-12 timeline-scroll-container">
          <div className="flex gap-8 relative z-10 px-[max(24px,calc(50vw-580px))] w-fit">
            {/* Timeline horizontal rail */}
            <div className="absolute top-[30px] left-[calc(max(24px,50vw-580px)+175px)] right-[calc(max(24px,50vw-580px)+175px)] h-0.5 bg-white/30 dark:bg-white/15 -z-10"></div>

            {experienceData.map((exp, index) => (
              <div key={index} className="w-[280px] sm:w-[300px] md:w-[350px] flex flex-col flex-shrink-0 group">
                <div className="w-full h-[60px] flex items-center justify-center relative">
                  <div className="w-5 h-5 bg-white dark:bg-slate-900 border-4 border-blue-500 dark:border-blue-600 rounded-full z-10 shadow-[0_0_0_6px_rgba(59,130,246,1)] group-hover:scale-125 group-hover:bg-white group-hover:border-white group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300"></div>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[28px] p-4 md:p-6 w-full transition-all duration-400 ease-spring flex flex-col gap-2 shadow-md group-hover:-translate-y-3 group-hover:border-blue-500 dark:group-hover:border-blue-500">
                  <div className="flex gap-5 items-center">
                    <div className="w-[60px] h-[60px] min-w-[60px] bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm">
                      <img src={exp.logo} alt={exp.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white m-0 leading-tight">{exp.role}</h3>
                      <p className="text-sm text-blue-500 dark:text-blue-400 m-0 font-semibold">{exp.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800/80 mt-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{exp.period}</span>
                    <span className="text-[10px] bg-blue-500/10 dark:bg-blue-500/20 text-blue-550 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
                      {calculateDuration(exp.period)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkExperienceTimeline;
