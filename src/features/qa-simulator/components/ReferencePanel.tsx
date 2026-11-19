import React, { useState } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import type { SimulatorProject } from '../../../types/qaSimulator';
import Markdown from './Markdown';
import PrdPanel from './PrdPanel';
import TeamAvatar from './TeamAvatar';

interface ReferencePanelProps {
  project: SimulatorProject;
  /** Phase being viewed — controls which PRD addenda are visible. */
  phaseIndex: number;
  className?: string;
}

type Tab = 'prd' | 'context';

// Everything the learner *reads* (as opposed to *writes*) lives here: the PRD
// and the project/team background. Keeps the work column focused on tasks.
const ReferencePanel: React.FC<ReferencePanelProps> = ({ project, phaseIndex, className = '' }) => {
  const [tab, setTab] = useState<Tab>('prd');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'prd', label: 'PRD', icon: <FileText size={14} /> },
    { id: 'context', label: 'Konteks & tim', icon: <BookOpen size={14} /> },
  ];

  return (
    <div className={`bg-white rounded-lg border border-ld-frost/70 shadow-[0_4px_18px_rgba(30,27,75,0.035)] flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-0 border-b border-ld-frost/60 bg-ld-cloud/50">
        <p className="m-0 pl-1 pb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Dokumen referensi</p>
        <div className="flex gap-1" role="tablist" aria-label="Dokumen referensi">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 -mb-px rounded-t-lg text-xs font-semibold border cursor-pointer transition-colors ${
                tab === t.id
                  ? 'bg-white text-ld-violet border-ld-frost/60 border-b-white'
                  : 'bg-transparent text-ld-slate border-transparent hover:text-ld-graphite'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'prd' ? (
        <PrdPanel project={project} phaseIndex={phaseIndex} embedded className="flex-1 min-h-0" />
      ) : (
        <div className="overflow-y-auto px-4 md:px-5 py-4 flex-1 min-h-0 space-y-5">
          <Markdown className="text-[13px]">{project.context}</Markdown>
          <div>
            <p className="m-0 mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Tim squad</p>
            <ul className="m-0 p-0 list-none space-y-3">
              {project.team.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <TeamAvatar member={m} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ld-onyx">{m.name}</span>
                    <span className="block text-xs text-ld-fog">{m.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {project.productUrl && (
            <p className="m-0 text-xs text-ld-slate">
              Produk asli:{' '}
              <a href={project.productUrl} target="_blank" rel="noreferrer" className="text-ld-violet">
                {project.productUrl.replace(/^https?:\/\//, '')}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferencePanel;
