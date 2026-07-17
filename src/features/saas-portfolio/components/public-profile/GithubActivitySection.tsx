import React from 'react';
import { FolderGit2, Github, GitPullRequest, Star } from 'lucide-react';
import { useGithubActivity } from '../../../../hooks/useGithubActivity';
import { useGithubStats } from '../../../../hooks/useGithubStats';
import { useThesvgIcons } from '../../../../hooks/useThesvgIcons';
import { ACTIVITY_ICON, formatTimeAgo } from '../../../../lib/portfolioFormat';
import SectionHeading from '../../../../components/common/SectionHeading';
import GithubProfileHeader from './GithubProfileHeader';

const GithubActivitySection: React.FC<{ username: string }> = ({ username }) => {
  const { items, loading } = useGithubActivity(username, 4);
  const { profile, stats } = useGithubStats(username);
  const hasStatsBlock = Boolean(stats && (stats.topLanguages.length > 0 || stats.topRepo));
  const languageIcons = useThesvgIcons(stats?.topLanguages.map((l) => l.name) ?? []);

  return (
    <section className="mb-14">
      <SectionHeading
        icon={<Github size={20} />}
        iconClassName="bg-ld-graphite/10 text-ld-graphite"
        title="GitHub Activity"
        subtitle="Kontribusi dan aktivitas terbaru di GitHub."
      />

      {profile && <GithubProfileHeader profile={profile} stats={stats} username={username} />}

      <div className="bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-6 flex flex-col gap-6">
        {hasStatsBlock && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.topLanguages.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-semibold text-ld-fog uppercase tracking-wide">Top Languages</span>
                {stats.topLanguages.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1.5 w-24 shrink-0">
                      {languageIcons[lang.name] && (
                        <img src={languageIcons[lang.name]} alt="" loading="lazy" className="w-3.5 h-3.5 object-contain shrink-0" />
                      )}
                      <span className="text-xs text-ld-graphite truncate">{lang.name}</span>
                    </span>
                    <div className="flex-grow h-2 rounded-full bg-ld-cloud overflow-hidden">
                      <div className="h-full rounded-full bg-ld-violet" style={{ width: `${lang.percent}%` }} />
                    </div>
                    <span className="text-[11px] text-ld-fog w-9 text-right shrink-0">{lang.percent}%</span>
                  </div>
                ))}
              </div>
            )}
            {stats.topRepo && (
              <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-semibold text-ld-fog uppercase tracking-wide">Repo Terpopuler</span>
                <a
                  href={stats.topRepo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-ld-cloud rounded-lg p-3.5 flex flex-col gap-1 no-underline hover:opacity-80 transition-opacity"
                >
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ld-graphite">
                    <FolderGit2 size={14} className="text-ld-violet shrink-0" /> {stats.topRepo.name}
                    <span className="inline-flex items-center gap-1 ml-auto text-xs text-ld-fog"><Star size={12} /> {stats.topRepo.stars}</span>
                  </span>
                  {stats.topRepo.description && (
                    <span className="text-xs text-ld-slate line-clamp-2">{stats.topRepo.description}</span>
                  )}
                </a>
              </div>
            )}
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className={`flex flex-col gap-3 m-0 p-0 list-none ${hasStatsBlock ? 'border-t border-dashed border-ld-ash pt-5' : ''}`}>
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                <span className="w-7 h-7 min-w-7 rounded-lg bg-ld-cloud flex items-center justify-center text-ld-violet">
                  {ACTIVITY_ICON[item.label] ?? <GitPullRequest size={14} />}
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="m-0 text-ld-graphite">
                    {item.label} di{' '}
                    <a href={item.repoUrl} target="_blank" rel="noopener noreferrer" className="text-ld-violet font-medium no-underline hover:opacity-75">
                      {item.repo}
                    </a>
                  </p>
                  <span className="text-[11px] text-ld-fog">{formatTimeAgo(item.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default GithubActivitySection;
