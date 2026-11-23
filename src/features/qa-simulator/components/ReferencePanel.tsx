import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ExternalLink, FileText, GraduationCap, Library } from 'lucide-react';
import type { SimulatorPhase, SimulatorProject } from '../../../types/qaSimulator';
import { articleSlugFromUrl, usePhaseArticles } from '../hooks/usePhaseArticles';
import Markdown from './Markdown';
import PrdPanel from './PrdPanel';
import TeamAvatar from './TeamAvatar';

interface ReferencePanelProps {
  project: SimulatorProject;
  /** Phase being viewed — controls which PRD addenda are visible. */
  phaseIndex: number;
  className?: string;
}

type Tab = 'prd' | 'context' | 'articles';

// Everything the learner *reads* (as opposed to *writes*) lives here: the PRD
// and the project/team background. Keeps the work column focused on tasks.
const ReferencePanel: React.FC<ReferencePanelProps> = ({ project, phaseIndex, className = '' }) => {
  const [tab, setTab] = useState<Tab>('prd');
  const phase = project.phases[phaseIndex];
  const resources = phase?.learn.resources ?? [];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'prd', label: 'PRD', icon: <FileText size={14} /> },
    { id: 'context', label: 'Konteks & tim', icon: <BookOpen size={14} /> },
    ...(resources.length > 0 ? [{ id: 'articles' as const, label: 'Materi', icon: <GraduationCap size={14} /> }] : []),
  ];
  const activeTab: Tab = tab === 'articles' && resources.length === 0 ? 'prd' : tab;

  return (
    <div className={`bg-white rounded-lg border border-ld-frost/70 shadow-[0_4px_18px_rgba(30,27,75,0.035)] flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-0 border-b border-ld-frost/60 bg-ld-cloud/50">
        <p className="m-0 pl-1 pb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Dokumen referensi</p>
        <div className="flex gap-1" role="tablist" aria-label="Dokumen referensi">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 -mb-px rounded-t-lg text-xs font-semibold border cursor-pointer transition-colors ${
                activeTab === t.id
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

      {activeTab === 'prd' ? (
        <PrdPanel project={project} phaseIndex={phaseIndex} embedded className="flex-1 min-h-0" />
      ) : activeTab === 'articles' && phase ? (
        <ArticlesTab key={phase.id} phase={phase} />
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

// Reading list for the viewed phase: the same links as "Pelajari konsepnya",
// with QA Library articles enriched into thumbnail cards. Opens in a new tab
// so the learner keeps their place (and unsaved answers) in the simulator.
const ArticlesTab: React.FC<{ phase: SimulatorPhase }> = ({ phase }) => {
  const resources = phase.learn.resources ?? [];
  const slugs = resources.map((r) => articleSlugFromUrl(r.url)).filter((s): s is string => s !== null);
  const { articles, loading } = usePhaseArticles(slugs);

  return (
    <div className="overflow-y-auto px-4 md:px-5 py-4 flex-1 min-h-0">
      <p className="m-0 mb-3 text-xs text-ld-slate">Materi bacaan untuk phase <span className="font-semibold text-ld-graphite">{phase.title}</span>.</p>
      <ul className="m-0 p-0 list-none space-y-2.5">
        {resources.map((r) => {
          const slug = articleSlugFromUrl(r.url);
          const article = slug ? articles[slug] : undefined;
          const external = /^https?:\/\//.test(r.url);
          const linkProps = { target: '_blank', rel: 'noreferrer' } as const;
          const cls = 'group flex gap-3 p-2.5 rounded-lg border border-ld-frost bg-white no-underline hover:border-ld-violet transition-colors';

          const body = (
            <>
              <span className="w-24 sm:w-28 aspect-video shrink-0 rounded-md overflow-hidden bg-ld-cloud flex items-center justify-center text-ld-fog">
                {article?.thumbnailUrl ? (
                  <img src={article.thumbnailUrl} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
                ) : slug && loading ? (
                  <span className="w-full h-full animate-pulse bg-ld-frost/60" />
                ) : external ? (
                  <ExternalLink size={18} />
                ) : (
                  <Library size={18} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-ld-onyx leading-snug line-clamp-2 group-hover:text-ld-violet transition-colors">
                  {article?.title ?? r.label}
                </span>
                {article?.excerpt && <span className="mt-1 text-xs text-ld-slate leading-relaxed line-clamp-2">{article.excerpt}</span>}
                <span className="mt-1.5 flex items-center gap-1 text-[11px] text-ld-fog">
                  {article ? (
                    <><Clock size={11} /> {article.readingTimeMinutes} menit baca</>
                  ) : external ? (
                    <>{r.url.replace(/^https?:\/\//, '').split('/')[0]}</>
                  ) : (
                    <>QA Library</>
                  )}
                </span>
              </span>
            </>
          );

          return (
            <li key={r.url}>
              {external ? (
                <a href={r.url} className={cls} {...linkProps}>{body}</a>
              ) : (
                <Link to={r.url} className={cls} {...linkProps}>{body}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ReferencePanel;
