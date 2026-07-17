import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { ExternalLink, Github, Star } from 'lucide-react';
import type { GithubRepoDetails } from '../../../../hooks/useGithubRepos';
import { useEdgeGutter } from '../../../../hooks/useEdgeGutter';
import type { SliderHandle } from './ArticleSlider';

const RepoThumbnail: React.FC<{ repo: GithubRepoDetails }> = ({ repo }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-ld-cloud">
        <Github size={28} className="text-ld-mist" />
      </div>
    );
  }

  return (
    <img
      src={repo.thumbnail}
      alt={repo.fullName}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover"
      onError={() => setFailed(true)}
    />
  );
};

const GithubRepoSlider = forwardRef<SliderHandle, { repos: GithubRepoDetails[] }>(({ repos }, ref) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [wrapRef, gutter] = useEdgeGutter<HTMLDivElement>();

  useImperativeHandle(ref, () => ({
    scroll: (dir) => {
      const el = sliderRef.current;
      if (!el) return;
      const amount = el.clientWidth * 0.9;
      el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    },
  }));

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative w-screen left-1/2 -translate-x-1/2">
        <div
          ref={sliderRef}
          style={{ paddingLeft: gutter, scrollPaddingLeft: gutter }}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-none snap-x snap-mandatory scroll-pr-4 pr-4 pb-1"
        >
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group snap-start shrink-0 w-[280px] sm:w-[320px] bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden flex flex-col no-underline transition-shadow hover:shadow-ld-subtle-3"
            >
              <div className="w-full aspect-[2/1] overflow-hidden bg-ld-cloud border-b border-ld-ash">
                <RepoThumbnail repo={repo} />
              </div>
              <div className="p-4 flex flex-col gap-1.5 flex-grow">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0 truncate group-hover:text-ld-violet transition-colors">
                    {repo.fullName}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-xs text-ld-fog shrink-0">
                    <Star size={12} /> {repo.stars}
                  </span>
                </div>
                {repo.description && (
                  <p className="text-ld-slate text-xs leading-relaxed line-clamp-2 m-0">{repo.description}</p>
                )}
                <span className="inline-flex items-center gap-1 mt-auto pt-2 text-[11px] font-medium text-ld-violet">
                  Lihat Repo <ExternalLink size={11} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});

GithubRepoSlider.displayName = 'GithubRepoSlider';

export default GithubRepoSlider;
