// Client-side search index for the thesvg.org CDN (glincker/thesvg) icon
// registry — lets ToolForm suggest a name + matching icon slug as the admin
// types, instead of guessing the slug blind. Registry is ~200KB gzipped and
// doesn't change during a session, so it's fetched once and cached at
// module scope (survives remounts of ToolForm, not page reloads).
export interface ThesvgIcon {
  slug: string;
  title: string;
  aliases: string[];
}

const REGISTRY_URL = 'https://thesvg.org/api/registry.json';
export const THESVG_CDN_BASE = 'https://thesvg.org/icons';

export function thesvgIconUrl(slug: string, variant: 'default' | 'mono' | 'color' = 'default'): string {
  return `${THESVG_CDN_BASE}/${slug}/${variant}.svg`;
}

interface RawRegistry {
  icons: { slug: string; title: string; aliases?: string[]; variants?: string[] }[];
}

let cache: ThesvgIcon[] | null = null;
let inflight: Promise<ThesvgIcon[]> | null = null;

export async function loadThesvgRegistry(): Promise<ThesvgIcon[]> {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = fetch(REGISTRY_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`registry fetch failed: ${res.status}`);
      return res.json() as Promise<RawRegistry>;
    })
    .then((data) => {
      const icons = data.icons
        .filter((icon) => !icon.variants || icon.variants.includes('default'))
        .map((icon) => ({ slug: icon.slug, title: icon.title, aliases: icon.aliases ?? [] }));
      cache = icons;
      return icons;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

// Exact-match lookup (title/slug/alias) — used where a wrong guess would be
// worse than no icon at all, e.g. auto-labelling a GitHub repo language.
export function findThesvgIconByName(icons: ThesvgIcon[], name: string): ThesvgIcon | null {
  const q = name.trim().toLowerCase();
  return icons.find((icon) =>
    icon.title.toLowerCase() === q || icon.slug.toLowerCase() === q || icon.aliases.some((a) => a.toLowerCase() === q)
  ) ?? null;
}

export function searchThesvgIcons(icons: ThesvgIcon[], query: string, limit = 8): ThesvgIcon[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const scored: { icon: ThesvgIcon; rank: number }[] = [];
  for (const icon of icons) {
    const title = icon.title.toLowerCase();
    const slug = icon.slug.toLowerCase();
    let rank = -1;
    if (title === q || slug === q) rank = 0;
    else if (title.startsWith(q) || slug.startsWith(q)) rank = 1;
    else if (title.includes(q) || slug.includes(q)) rank = 2;
    else if (icon.aliases.some((a) => a.toLowerCase().includes(q))) rank = 3;
    if (rank >= 0) scored.push({ icon, rank });
  }

  scored.sort((a, b) => a.rank - b.rank || a.icon.title.length - b.icon.title.length);
  return scored.slice(0, limit).map((s) => s.icon);
}
