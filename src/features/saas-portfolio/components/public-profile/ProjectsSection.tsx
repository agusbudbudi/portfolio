import React from 'react';
import { ExternalLink, Rocket } from 'lucide-react';
import type { ProjectEntry, ToolConfig } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';

const ProjectsSection: React.FC<{ projects: ProjectEntry[]; toolById: Map<string, ToolConfig> }> = ({ projects, toolById }) => (
  <section className="mb-14">
    <SectionHeading
      icon={<Rocket size={20} />}
      iconClassName="bg-amber-500/10 text-amber-500"
      title={<>Project <span className="text-ld-violet">Showcase</span></>}
      subtitle="Kumpulan project yang pernah dikerjakan."
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((project) => {
        const projectTools = project.toolIds
          .map((id) => toolById.get(id))
          .filter((t): t is ToolConfig => Boolean(t?.logo));
        const visibleProjectTools = projectTools.slice(0, 5);
        const extraProjectToolsCount = projectTools.length - visibleProjectTools.length;
        const hasFooter = projectTools.length > 0 || Boolean(project.projectUrl);

        return (
          <div key={project.id} className="bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden flex flex-col transition-shadow hover:shadow-ld-subtle-3">
            <div className="w-full aspect-video overflow-hidden bg-ld-cloud border-b border-ld-ash flex items-center justify-center">
              {project.thumbnail ? (
                <img src={project.thumbnail} alt={project.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <Rocket size={28} className="text-ld-mist" />
              )}
            </div>
            <div className="p-4 pb-2 flex-grow">
              <h4 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-2">{project.name}</h4>
              <p className="text-ld-slate text-xs leading-relaxed mb-4">{project.description}</p>
            </div>
            {hasFooter && (
              <div className="px-4 py-3 flex justify-between items-center border-t border-ld-ash bg-ld-cloud/50 gap-3">
                <div className="flex gap-2.5 flex-wrap items-center">
                  {visibleProjectTools.map((tool) => (
                    <img key={tool.id} src={tool.logo} alt={tool.name} title={tool.name} loading="lazy" decoding="async" className="h-5 object-contain" />
                  ))}
                  {extraProjectToolsCount > 0 && (
                    <span className="text-xs font-medium text-ld-violet">+{extraProjectToolsCount}</span>
                  )}
                </div>
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-ld-canvas text-ld-violet border border-ld-ash rounded-lg font-medium text-xs no-underline transition-colors hover:bg-ld-violet hover:text-white hover:border-ld-violet whitespace-nowrap"
                  >
                    Lihat Project <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </section>
);

export default ProjectsSection;
