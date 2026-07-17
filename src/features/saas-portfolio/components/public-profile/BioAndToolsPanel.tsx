import React from 'react';
import { Briefcase, Building2, Clock, MapPin } from 'lucide-react';
import { EMPLOYMENT_TYPE_LABEL } from '../../../../lib/portfolioFormat';
import { WORK_ARRANGEMENT_OPTIONS, type AvailabilityConfig, type ToolConfig } from '../../../../types/portfolio';

const TOOLS_LIMIT = 20;
const WORK_ARRANGEMENT_LABEL = Object.fromEntries(WORK_ARRANGEMENT_OPTIONS.map((o) => [o.value, o.label]));

const PreferenceBadge: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost text-ld-graphite text-xs font-medium">
    {icon} {children}
  </span>
);

const BioAndToolsPanel: React.FC<{ bio: string; availability?: AvailabilityConfig; tools: ToolConfig[] }> = ({ bio, availability, tools }) => {
  const hasMoreTools = tools.length > TOOLS_LIMIT;
  const visibleTools = hasMoreTools ? tools.slice(0, TOOLS_LIMIT - 1) : tools;
  const remainingToolsCount = tools.length - visibleTools.length;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 mb-14">
      <div className="lg:col-span-3 flex flex-col gap-8">
        <div className="max-w-[800px]">
          {availability?.showPreferences && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {availability.noticePeriod && (
                <PreferenceBadge icon={<Clock size={12} />}>{availability.noticePeriod}</PreferenceBadge>
              )}
              {availability.location && (
                <PreferenceBadge icon={<MapPin size={12} />}>{availability.location}</PreferenceBadge>
              )}
              {availability.employmentTypes.length > 0 && (
                <PreferenceBadge icon={<Briefcase size={12} />}>
                  {availability.employmentTypes.map((t) => EMPLOYMENT_TYPE_LABEL[t]).join(', ')}
                </PreferenceBadge>
              )}
              {availability.workArrangements.length > 0 && (
                <PreferenceBadge icon={<Building2 size={12} />}>
                  {availability.workArrangements.map((w) => WORK_ARRANGEMENT_LABEL[w]).join(', ')}
                </PreferenceBadge>
              )}
            </div>
          )}
          <p className="text-base text-ld-slate leading-relaxed whitespace-pre-line m-0">{bio}</p>
        </div>
      </div>

      {tools.length > 0 && (
        <div className="lg:col-span-2">
          <div className="grid grid-cols-5 gap-3">
            {visibleTools.map((tool) => (
              <div
                key={tool.id}
                className="aspect-square flex items-center justify-center rounded-2xl border border-ld-ash/50 p-1 transition-shadow hover:shadow-ld-subtle-3"
              >
                {tool.logo ? (
                  <img src={tool.logo} alt={tool.name} title={tool.name} loading="lazy" decoding="async" className="w-1/2 h-1/2 object-contain" />
                ) : (
                  <span className="text-[10px] font-medium text-ld-graphite text-center leading-tight">{tool.name}</span>
                )}
              </div>
            ))}
            {remainingToolsCount > 0 && (
              <div className="aspect-square flex items-center justify-center rounded-2xl border border-ld-ash/50 p-1">
                <span className="text-sm font-semibold text-ld-violet text-center leading-tight">+{remainingToolsCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BioAndToolsPanel;
