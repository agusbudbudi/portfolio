import React from 'react';
import { GraduationCap } from 'lucide-react';
import { formatMonth } from '../../../../lib/portfolioFormat';
import type { EducationEntry } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';
import TimelineRail from './TimelineRail';

const EducationSection: React.FC<{ education: EducationEntry[] }> = ({ education }) => (
  <section className="mb-14">
    <SectionHeading
      icon={<GraduationCap size={20} />}
      iconClassName="bg-emerald-500/10 text-emerald-600"
      title={<>Riwayat <span className="text-ld-violet">Pendidikan</span></>}
      subtitle="Latar belakang akademik dan bidang studi."
    />

    <div className="flex flex-col relative">
      {education.map((entry, index) => (
        <TimelineRail key={entry.id} isCurrent={entry.isCurrent} isLast={index === education.length - 1}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
            <div className="flex items-start gap-5">
              <div className="w-[50px] h-[50px] min-w-[50px] flex items-center justify-center bg-ld-canvas rounded-lg overflow-hidden">
                {entry.institutionLogo ? (
                  <img src={entry.institutionLogo} alt={entry.institution} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                ) : (
                  <GraduationCap size={20} className="text-ld-mist" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{entry.institution}</h3>
                  {entry.isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-[10px] font-semibold">Current</span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-ld-violet m-0">
                  {entry.degree}{entry.fieldOfStudy ? ` — ${entry.fieldOfStudy}` : ''}
                </h4>
              </div>
            </div>
            <div className="flex flex-row items-center sm:flex-col sm:items-end gap-2 sm:gap-1 text-xs text-ld-fog">
              <span>{formatMonth(entry.startDate)} — {entry.isCurrent ? 'Sekarang' : formatMonth(entry.endDate)}</span>
            </div>
          </div>

          {entry.description && (
            <p className="text-sm text-ld-slate leading-relaxed whitespace-pre-line mt-4 pt-4 border-t border-dashed border-ld-ash">
              {entry.description}
            </p>
          )}
        </TimelineRail>
      ))}
    </div>
  </section>
);

export default EducationSection;
