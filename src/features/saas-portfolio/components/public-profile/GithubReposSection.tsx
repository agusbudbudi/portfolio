import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, FolderGit2 } from 'lucide-react';
import { useGithubRepos } from '../../../../hooks/useGithubRepos';
import type { GithubRepoEntry } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';
import GithubRepoSlider from './GithubRepoSlider';
import type { SliderHandle } from './ArticleSlider';

const GithubReposSection: React.FC<{ repos: GithubRepoEntry[] }> = ({ repos }) => {
  const { repos: details, loading } = useGithubRepos(repos);
  const sliderRef = useRef<SliderHandle>(null);

  if (!loading && details.length === 0) return null;

  return (
    <section className="mb-14">
      <SectionHeading
        icon={<FolderGit2 size={20} />}
        iconClassName="bg-ld-graphite/10 text-ld-graphite"
        title="GitHub Repos"
        subtitle="Repository publik yang pernah dikerjakan."
        action={!loading && details.length > 3 && (
          <div className="hidden md:flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => sliderRef.current?.scroll('left')}
              aria-label="Sebelumnya"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-ld-ash bg-ld-canvas text-ld-slate hover:text-ld-violet hover:border-ld-violet cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => sliderRef.current?.scroll('right')}
              aria-label="Berikutnya"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-ld-ash bg-ld-canvas text-ld-slate hover:text-ld-violet hover:border-ld-violet cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      />

      {loading ? (
        <div className="flex gap-4 overflow-x-hidden pb-1">
          {repos.map((r) => (
            <div key={r.id} className="shrink-0 w-[280px] sm:w-[320px] rounded-xl border border-ld-ash overflow-hidden animate-pulse">
              <div className="w-full aspect-[2/1] bg-ld-cloud" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 w-2/3 bg-ld-cloud rounded" />
                <div className="h-3 w-full bg-ld-cloud rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <GithubRepoSlider ref={sliderRef} repos={details} />
      )}
    </section>
  );
};

export default GithubReposSection;
