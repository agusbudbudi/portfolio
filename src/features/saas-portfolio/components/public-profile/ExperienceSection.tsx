import React, { useState } from 'react';
import { Briefcase, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { EMPLOYMENT_TYPE_LABEL, formatDuration, formatMonth } from '../../../../lib/portfolioFormat';
import { WORK_ARRANGEMENT_OPTIONS, type ExperienceEntry } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';
import TimelineRail from './TimelineRail';

const WORK_ARRANGEMENT_LABEL = Object.fromEntries(WORK_ARRANGEMENT_OPTIONS.map((o) => [o.value, o.label]));

const ExperienceSection: React.FC<{ experience: ExperienceEntry[] }> = ({ experience }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="mb-14">
      <SectionHeading
        icon={<Briefcase size={20} />}
        iconClassName="bg-blue-500/10 text-blue-500"
        title={<>Pengalaman <span className="text-ld-violet">Kerja</span></>}
        subtitle="Riwayat karier profesional dan kontribusi utama."
      />

      <div className="flex flex-col relative">
        {experience.map((entry, index) => {
          const duration = formatDuration(entry.startDate, entry.endDate, entry.isCurrent);
          const typeArrangement = [
            entry.employmentType && EMPLOYMENT_TYPE_LABEL[entry.employmentType],
            entry.workArrangement && WORK_ARRANGEMENT_LABEL[entry.workArrangement],
          ].filter(Boolean).join(' · ');
          return (
            <TimelineRail
              key={entry.id}
              isCurrent={entry.isCurrent}
              isLast={index === experience.length - 1}
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                <div className="flex items-start gap-5">
                  <div className="w-[50px] h-[50px] min-w-[50px] flex items-center justify-center bg-ld-canvas rounded-lg overflow-hidden">
                    {entry.companyLogo ? (
                      <img src={entry.companyLogo} alt={entry.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                    ) : (
                      <Briefcase size={20} className="text-ld-mist" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{entry.company}</h3>
                      {entry.isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-[10px] font-semibold">Current</span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-ld-violet m-0">{entry.position}</h4>
                    {(typeArrangement || entry.location) && (
                      <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-xs text-ld-fog">
                        {typeArrangement && <span>{typeArrangement}</span>}
                        {entry.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={11} /> {entry.location}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row items-center sm:flex-col sm:items-end gap-2 sm:gap-1 text-xs text-ld-fog">
                  <span>{formatMonth(entry.startDate)} - {entry.isCurrent ? 'Sekarang' : formatMonth(entry.endDate)}</span>
                  {duration && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-ld-cloud text-ld-graphite text-[10px] font-medium">
                      {duration}
                    </span>
                  )}
                </div>
              </div>

              <div className={`grid transition-all duration-300 ease-in-out ${expandedIndex === index ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-dashed border-ld-ash' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                <div className="overflow-hidden">
                  <p className="text-sm text-ld-slate leading-relaxed whitespace-pre-line">{entry.jobDesc}</p>
                </div>
              </div>

              <div className="absolute bottom-3 right-4 text-ld-fog opacity-60">
                {expandedIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </TimelineRail>
          );
        })}
      </div>
    </section>
  );
};

export default ExperienceSection;
