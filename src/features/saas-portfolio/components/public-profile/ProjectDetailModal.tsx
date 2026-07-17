import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Rocket, X } from 'lucide-react';
import type { ProjectEntry, ProjectPlatform, ToolConfig } from '../../../../types/portfolio';

interface ProjectDetailModalProps {
  project: ProjectEntry;
  tools: ToolConfig[];
  platformIcon: Record<ProjectPlatform, React.ComponentType<{ size?: number }>>;
  onClose: () => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, tools, platformIcon, onClose }) => {
  const projectTools = project.toolIds
    .map((id) => tools.find((t) => t.id === id))
    .filter((t): t is ToolConfig => Boolean(t?.logo));
  const platformEntries = project.platforms ?? [];

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-detail-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl sm:mx-4 bg-ld-canvas rounded-t-2xl sm:rounded-xl border border-ld-ash shadow-[var(--shadow-ld-lg)] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Mobile bottom-sheet grab handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <span className="w-10 h-1 rounded-full bg-ld-ash" />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail project"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 text-ld-fog hover:text-ld-graphite border border-ld-ash cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto grow">
          <div className="w-full aspect-video overflow-hidden bg-ld-cloud border-b border-ld-ash flex items-center justify-center shrink-0">
            {project.thumbnail ? (
              <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
            ) : (
              <Rocket size={32} className="text-ld-mist" />
            )}
          </div>

          <div className="p-5 flex flex-col gap-4">
            <h3 id="project-detail-title" className="text-lg font-ld-display font-semibold text-ld-graphite tracking-[-0.01em]">
              {project.name}
            </h3>

            <p className="text-sm text-ld-slate leading-relaxed whitespace-pre-line">{project.description}</p>

            {projectTools.length > 0 && (
              <div>
                <span className="block text-[11px] font-medium text-ld-fog uppercase tracking-wide mb-2">Tools</span>
                <div className="flex gap-2.5 flex-wrap items-center">
                  {projectTools.map((tool) => (
                    <img key={tool.id} src={tool.logo} alt={tool.name} title={tool.name} className="h-6 object-contain" />
                  ))}
                </div>
              </div>
            )}

            {platformEntries.length > 0 && (
              <div>
                <span className="block text-[11px] font-medium text-ld-fog uppercase tracking-wide mb-2">Platform</span>
                <div className="flex flex-wrap gap-4">
                  {platformEntries.map((link, i) => {
                    const Icon = platformIcon[link.platform];
                    const url = link.url?.trim();
                    const label = link.platform === 'ios' ? 'iOS' : link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
                    const iconWrap = (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ld-violet text-white shrink-0">
                        <Icon size={11} />
                      </span>
                    );
                    return url ? (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-ld-graphite no-underline hover:text-ld-violet"
                      >
                        {iconWrap} {label}
                      </a>
                    ) : (
                      <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium text-ld-graphite">
                        {iconWrap} {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {project.projectUrl && (
          <div className="shrink-0 p-5 pt-4 border-t border-ld-ash bg-ld-canvas">
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 bg-ld-violet hover:bg-[#1f87e6] text-white rounded-lg font-medium text-sm no-underline transition-colors"
            >
              Lihat Project <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ProjectDetailModal;
