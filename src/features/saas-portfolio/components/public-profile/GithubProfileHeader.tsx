import React from 'react';
import {
  AtSign, Building2, Calendar, FolderGit2, Github, Link2, MapPin, Star, Users,
} from 'lucide-react';
import type { GithubProfile, GithubRepoStats } from '../../../../hooks/useGithubStats';
import { normalizeUrl } from '../../../../lib/portfolioFormat';

const GithubProfileHeader: React.FC<{ profile: GithubProfile; stats: GithubRepoStats | null; username: string }> = ({ profile, stats, username }) => {
  const statTiles = [
    { label: 'Public Repos', value: profile.publicRepos, icon: <FolderGit2 size={14} /> },
    { label: 'Followers', value: profile.followers, icon: <Users size={14} /> },
    ...(stats ? [{ label: 'Total Stars', value: stats.totalStars, icon: <Star size={14} /> }] : []),
  ];

  const metaItems: { key: string; icon: React.ReactNode; node: React.ReactNode }[] = [];
  if (profile.company) metaItems.push({ key: 'company', icon: <Building2 size={12} />, node: <span>{profile.company}</span> });
  if (profile.location) metaItems.push({ key: 'location', icon: <MapPin size={12} />, node: <span>{profile.location}</span> });
  if (profile.blog) {
    metaItems.push({
      key: 'blog',
      icon: <Link2 size={12} />,
      node: <a href={normalizeUrl(profile.blog)} target="_blank" rel="noopener noreferrer" className="text-ld-violet no-underline hover:opacity-75">{profile.blog}</a>,
    });
  }
  if (profile.twitterUsername) {
    metaItems.push({
      key: 'twitter',
      icon: <AtSign size={12} />,
      node: <a href={`https://twitter.com/${profile.twitterUsername}`} target="_blank" rel="noopener noreferrer" className="text-ld-violet no-underline hover:opacity-75">{profile.twitterUsername}</a>,
    });
  }
  metaItems.push({
    key: 'joined',
    icon: <Calendar size={12} />,
    node: <span>Bergabung sejak {new Date(profile.createdAt).getFullYear()}</span>,
  });

  return (
    <div className="bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-6 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <img
              src={profile.avatarUrl}
              alt={profile.name ?? profile.login}
              loading="lazy"
              decoding="async"
              className="w-20 h-20 min-w-20 rounded-full border border-ld-ash object-cover"
            />
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{profile.name ?? profile.login}</h3>
                <a
                  href={profile.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ld-cloud text-ld-violet text-xs font-medium no-underline hover:bg-ld-violet hover:text-white transition-colors"
                >
                  <Github size={12} /> @{profile.login}
                </a>
                {profile.hireable && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold uppercase tracking-wide">
                    Available for hire
                  </span>
                )}
              </div>
              {profile.bio && <p className="text-sm text-ld-slate leading-relaxed m-0">{profile.bio}</p>}
              {metaItems.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ld-fog">
                  {metaItems.map((item) => (
                    <span key={item.key} className="inline-flex items-center gap-1.5">{item.icon} {item.node}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-dashed border-ld-ash pt-4">
            {statTiles.map((tile) => (
              <div key={tile.label} className="inline-flex items-center gap-1.5 bg-ld-cloud rounded-lg px-2.5 py-1.5">
                <span className="text-ld-violet shrink-0">{tile.icon}</span>
                <span className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em]">{tile.value.toLocaleString('id-ID')}</span>
                <span className="text-[10px] text-ld-fog uppercase tracking-wide">{tile.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-dashed border-ld-ash pt-5 lg:pt-0 lg:pl-6">
          <span className="text-[11px] font-semibold text-ld-fog uppercase tracking-wide mb-2.5">Contribution Graph</span>
          <img
            src={`https://ghchart.rshah.org/3b9eff/${username}`}
            alt={`Contribution graph GitHub ${username}`}
            loading="lazy"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default GithubProfileHeader;
