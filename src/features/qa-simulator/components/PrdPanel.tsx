import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import type { SimulatorProject } from '../../../types/qaSimulator';
import Markdown from './Markdown';

interface PrdPanelProps {
  project: SimulatorProject;
  /** Index of the phase being viewed — addenda from phases up to this one are shown. */
  phaseIndex: number;
  className?: string;
  /** Render without its own card shell (inside ReferencePanel). */
  embedded?: boolean;
}

// The PRD is the learner's main reference across every phase, so it sits in
// a sticky side panel. Later revisions (PM answers) show up as extra tabs
// once the phase that introduces them is reached.
const PrdPanel: React.FC<PrdPanelProps> = ({ project, phaseIndex, className = '', embedded = false }) => {
  const addenda = project.phases.slice(0, phaseIndex + 1).flatMap((p) => (p.prdAddendum ? [p.prdAddendum] : []));
  const versions = [{ version: project.prd.version, markdown: project.prd.markdown }, ...addenda];
  const [selected, setSelected] = useState<string | null>(null);
  const active = versions.find((v) => v.version === selected) ?? versions[versions.length - 1];

  return (
    <div className={`${embedded ? '' : 'bg-white rounded-lg border border-ld-frost/70 shadow-[0_4px_18px_rgba(30,27,75,0.035)]'} flex flex-col overflow-hidden ${className}`}>
      <div className={`px-4 pt-3 border-b border-ld-frost/60 ${versions.length > 1 ? '' : 'pb-3'}`}>
        <p className="m-0 flex items-start gap-2 text-sm font-semibold text-ld-onyx">
          <FileText size={16} className="text-ld-violet shrink-0 mt-0.5" />
          <span>{project.prd.title}</span>
        </p>
        {versions.length > 1 && (
          <div className="flex gap-4 mt-1.5 -mb-px overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Versi PRD">
            {versions.map((v) => (
              <button
                key={v.version}
                role="tab"
                aria-selected={v.version === active.version}
                onClick={() => setSelected(v.version)}
                className={`shrink-0 whitespace-nowrap px-0 py-2 bg-transparent text-xs font-semibold border-0 border-b-2 border-solid cursor-pointer transition-colors ${
                  v.version === active.version ? 'border-ld-violet text-ld-violet' : 'border-transparent text-ld-slate hover:text-ld-graphite'
                }`}
              >
                {v.version === project.prd.version ? v.version : `${v.version} · Addendum`}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="overflow-y-auto px-4 md:px-5 py-4 flex-1 min-h-0">
        <Markdown className="text-[13px]">{active.markdown}</Markdown>
      </div>
    </div>
  );
};

export default PrdPanel;
