// useGithubActivity – loads recent public events for a GitHub username via
// the unauthenticated REST API, for the public portfolio's GitHub Activity
// section. Best-effort: on failure (rate limit, invalid username, network)
// it just returns an empty list rather than surfacing an error banner —
// the section quietly falls back to showing only the contribution graph.
import { useEffect, useState } from 'react';

export type GithubActivityItem = {
  id: string;
  label: string;
  repo: string;
  repoUrl: string;
  createdAt: string;
};

interface GithubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload?: {
    action?: string;
    ref_type?: string;
    commits?: unknown[];
    pull_request?: { title?: string };
    issue?: { title?: string };
  };
}

function describeEvent(event: GithubEvent): string | null {
  const { type, payload } = event;
  switch (type) {
    case 'PushEvent': {
      const count = payload?.commits?.length ?? 0;
      return count > 0 ? `Push ${count} commit${count > 1 ? 's' : ''}` : null;
    }
    case 'PullRequestEvent':
      return payload?.action === 'opened' ? 'Membuka pull request' : payload?.action === 'closed' ? 'Menutup pull request' : null;
    case 'IssuesEvent':
      return payload?.action === 'opened' ? 'Membuka issue' : null;
    case 'CreateEvent':
      return payload?.ref_type === 'repository' ? 'Membuat repository baru' : payload?.ref_type === 'branch' ? 'Membuat branch baru' : null;
    case 'ForkEvent':
      return 'Fork repository';
    case 'WatchEvent':
      return 'Star repository';
    default:
      return null;
  }
}

export function useGithubActivity(username: string, limit = 5): { items: GithubActivityItem[]; loading: boolean } {
  const [items, setItems] = useState<GithubActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((events: GithubEvent[]) => {
        if (cancelled) return;
        const parsed: GithubActivityItem[] = [];
        for (const event of events) {
          const label = describeEvent(event);
          if (!label) continue;
          parsed.push({
            id: event.id,
            label,
            repo: event.repo.name,
            repoUrl: `https://github.com/${event.repo.name}`,
            createdAt: event.created_at,
          });
          if (parsed.length >= limit) break;
        }
        setItems(parsed);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [username, limit]);

  return { items, loading };
}
