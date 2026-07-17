import React, { useRef, useState } from 'react';
import { Apple, ChevronLeft, ChevronRight, ExternalLink, Globe, Monitor, Rocket, Smartphone } from 'lucide-react';
import { PROJECT_TYPE_BADGE_COLOR, PROJECT_TYPE_OPTIONS, type ProjectEntry, type ProjectPlatform, type ProjectType, type ToolConfig } from '../../../../types/portfolio';
import { useEdgeGutter } from '../../../../hooks/useEdgeGutter';
import ProjectDetailModal from './ProjectDetailModal';

const PLATFORM_ICON: Record<ProjectPlatform, React.ComponentType<{ size?: number }>> = {
  web: Globe,
  ios: Apple,
  android: Smartphone,
  desktop: Monitor,
  other: ExternalLink,
};

// flushBottom: true when the next visible section is also a banded
// (full-bleed violet) section — drops the bottom margin so the two colored
// bands sit flush against each other instead of showing a white seam.
const ProjectsSection: React.FC<{ projects: ProjectEntry[]; toolById: Map<string, ToolConfig>; flushBottom?: boolean }> = ({
  projects, toolById, flushBottom,
}) => {
  const [activeProject, setActiveProject] = useState<ProjectEntry | null>(null);
  const [activeType, setActiveType] = useState<ProjectType | 'all'>('all');
  const tools = Array.from(toolById.values());
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sectionRef, gutter] = useEdgeGutter<HTMLElement>();

  const usedTypes = PROJECT_TYPE_OPTIONS.filter((opt) => projects.some((p) => p.projectType === opt.value));
  const filteredProjects = activeType === 'all' ? projects : projects.filter((p) => p.projectType === activeType);

  const scroll = (dir: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className={`relative isolate pt-10 pb-4 ${flushBottom ? '' : 'mb-14'}`}>
      <div className="absolute -z-10 top-0 bottom-0 left-1/2 w-screen -translate-x-1/2 bg-gradient-to-b from-ld-violet to-transparent" />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-white/15 text-white">
            <Rocket size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-white mb-1">Project Showcase</h2>
            <p className="text-sm text-white/80">Kumpulan project yang pernah dikerjakan.</p>
          </div>
        </div>
        {filteredProjects.length > 3 && (
          <div className="hidden md:flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Sebelumnya"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Berikutnya"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white hover:bg-white/20 cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {usedTypes.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveType('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${activeType === 'all' ? 'bg-white text-ld-violet' : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'}`}
          >
            Semua
          </button>
          {usedTypes.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActiveType(opt.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${activeType === opt.value ? 'bg-white text-ld-violet' : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative w-screen left-1/2 -translate-x-1/2">
        <div
          ref={sliderRef}
          style={{ paddingLeft: gutter, scrollPaddingLeft: gutter }}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-none snap-x snap-mandatory scroll-pr-4 pr-4 pb-1"
        >
          {filteredProjects.map((project) => {
            const projectTools = project.toolIds
              .map((id) => toolById.get(id))
              .filter((t): t is ToolConfig => Boolean(t?.logo));
            const visibleProjectTools = projectTools.slice(0, 5);
            const extraProjectToolsCount = projectTools.length - visibleProjectTools.length;
            const platformEntries = project.platforms ?? [];
            const hasFooter = projectTools.length > 0 || Boolean(project.projectUrl);
            const hasPlatforms = platformEntries.length > 0;

            return (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveProject(project)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveProject(project); }
                }}
                className="snap-start shrink-0 w-[85vw] sm:w-[340px] lg:w-[calc((100%-2rem)/3)] text-left bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden flex flex-col transition-shadow hover:shadow-ld-subtle-3 cursor-pointer"
              >
                <div className="relative w-full aspect-video overflow-hidden bg-ld-cloud border-b border-ld-ash flex items-center justify-center group">
                  {project.projectType && (
                    <span
                      className={`absolute bottom-0 right-0 px-3 py-1 rounded-tl-lg text-[11px] font-semibold shadow-sm ${PROJECT_TYPE_BADGE_COLOR[project.projectType]}`}
                    >
                      {PROJECT_TYPE_OPTIONS.find((o) => o.value === project.projectType)?.label}
                    </span>
                  )}
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <Rocket size={28} className="text-ld-mist" />
                  )}
                  <div className="absolute inset-0 bg-ld-violet/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-ld-canvas text-ld-violet px-4 py-2 rounded-full font-medium text-xs shadow-ld-subtle-2">
                      Lihat Detail
                    </span>
                  </div>
                </div>
                <div className="p-4 pb-2 flex-grow">
                  <h4 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-2">{project.name}</h4>
                  <p className="text-ld-slate text-xs leading-relaxed mb-4 line-clamp-3">{project.description}</p>
                  {hasPlatforms && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {platformEntries.map((link, i) => {
                        const Icon = PLATFORM_ICON[link.platform];
                        const url = link.url?.trim();
                        const label = link.platform === 'ios' ? 'iOS' : link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                        const iconWrap = (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ld-violet text-white shrink-0">
                            <Icon size={11} />
                          </span>
                        );
                        if (url) {
                          return (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ld-graphite no-underline hover:text-ld-violet"
                            >
                              {iconWrap} {label}
                            </a>
                          );
                        }
                        return (
                          <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ld-graphite">
                            {iconWrap} {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
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
                        onClick={(e) => e.stopPropagation()}
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
      </div>

      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          tools={tools}
          platformIcon={PLATFORM_ICON}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  );
};

export default ProjectsSection;
