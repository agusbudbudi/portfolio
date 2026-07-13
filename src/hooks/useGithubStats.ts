// useGithubStats – loads the GitHub profile + repo-derived stats for a
// username via the unauthenticated REST API (no token, no serverless proxy).
// Best-effort like useGithubActivity: the profile fetch and the repos fetch
// are independent, so a repos failure (e.g. rate limit) still leaves the
// profile header intact — each half quietly hides only its own data.
import { useEffect, useState } from 'react';

export type GithubLanguageStat = { name: string; percent: number };

export type GithubTopRepo = { name: string; url: string; stars: number; description: string | null };

export type GithubProfile = {
  login: string;
  name: string | null;
  avatarUrl: string;
  htmlUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  hireable: boolean | null;
  publicRepos: number;
  followers: number;
  createdAt: string;
};

export type GithubRepoStats = {
  totalStars: number;
  topLanguages: GithubLanguageStat[];
  topRepo: GithubTopRepo | null;
};

interface GithubUserResponse {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  hireable: boolean | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

interface GithubRepoResponse {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  fork: boolean;
  stargazers_count: number;
}

const LANGUAGES_LIMIT = 4;

// Empty strings from the API count as "no data" same as null/undefined.
function orNull(value: string | null | undefined): string | null {
  return value && value.trim() ? value.trim() : null;
}

function deriveRepoStats(repos: GithubRepoResponse[]): GithubRepoStats {
  const ownRepos = repos.filter((r) => !r.fork);

  let totalStars = 0;
  let topRepo: GithubTopRepo | null = null;
  const languageCounts = new Map<string, number>();

  for (const repo of ownRepos) {
    totalStars += repo.stargazers_count;
    if (!topRepo || repo.stargazers_count > topRepo.stars) {
      topRepo = { name: repo.name, url: repo.html_url, stars: repo.stargazers_count, description: repo.description };
    }
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
    }
  }

  const totalWithLanguage = Array.from(languageCounts.values()).reduce((sum, n) => sum + n, 0);
  const topLanguages: GithubLanguageStat[] = Array.from(languageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, LANGUAGES_LIMIT)
    .map(([name, count]) => ({ name, percent: Math.round((count / totalWithLanguage) * 100) }));

  return { totalStars, topLanguages, topRepo };
}

export function useGithubStats(username: string): { profile: GithubProfile | null; stats: GithubRepoStats | null; loading: boolean } {
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [stats, setStats] = useState<GithubRepoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`).then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))),
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&type=owner`).then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))),
    ]).then(([userResult, reposResult]) => {
      if (cancelled) return;

      if (userResult.status === 'fulfilled') {
        const user = userResult.value as GithubUserResponse;
        setProfile({
          login: user.login,
          name: orNull(user.name),
          avatarUrl: user.avatar_url,
          htmlUrl: user.html_url,
          bio: orNull(user.bio),
          company: orNull(user.company),
          location: orNull(user.location),
          blog: orNull(user.blog),
          twitterUsername: orNull(user.twitter_username),
          hireable: user.hireable ?? null,
          publicRepos: user.public_repos,
          followers: user.followers,
          createdAt: user.created_at,
        });
      } else {
        setProfile(null);
      }

      if (reposResult.status === 'fulfilled') {
        setStats(deriveRepoStats(reposResult.value as GithubRepoResponse[]));
      } else {
        setStats(null);
      }

      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [username]);

  return { profile, stats, loading };
}
