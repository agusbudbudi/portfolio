// useGithubRepos – loads title/description/thumbnail for a list of GitHub
// repo URLs via the unauthenticated REST API (no token). Best-effort per
// repo like useGithubStats: one repo failing (bad URL, 404, rate limit)
// just drops that card instead of failing the whole section.
import { useEffect, useState } from 'react';
import type { GithubRepoEntry } from '../types/portfolio';

export interface GithubRepoDetails {
  id: string;
  owner: string;
  repo: string;
  fullName: string;
  description: string | null;
  stars: number;
  thumbnail: string;
  htmlUrl: string;
}

const GITHUB_REPO_URL_RE = /^https:\/\/github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9._-]+?)\/?$/;

interface GithubRepoResponse {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
}

export function useGithubRepos(repos: GithubRepoEntry[]): { repos: GithubRepoDetails[]; loading: boolean } {
  const [details, setDetails] = useState<GithubRepoDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const key = repos.map((r) => `${r.id}:${r.url}`).join('|');

  useEffect(() => {
    if (repos.length === 0) {
      setDetails([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.allSettled(
      repos.map(async (entry) => {
        const match = entry.url.trim().match(GITHUB_REPO_URL_RE);
        if (!match) throw new Error('invalid repo url');
        const [, owner, repo] = match;
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as GithubRepoResponse;
        const result: GithubRepoDetails = {
          id: entry.id,
          owner,
          repo,
          fullName: data.full_name,
          description: data.description,
          stars: data.stargazers_count,
          thumbnail: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
          htmlUrl: data.html_url,
        };
        return result;
      })
    ).then((results) => {
      if (cancelled) return;
      setDetails(
        results
          .filter((r): r is PromiseFulfilledResult<GithubRepoDetails> => r.status === 'fulfilled')
          .map((r) => r.value)
      );
      setLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { repos: details, loading };
}
