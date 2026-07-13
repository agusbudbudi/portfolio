// useThesvgIcons – resolves a list of names (e.g. GitHub repo languages) to
// thesvg.org CDN icon URLs via the shared registry. Exact-match only, so a
// name with no matching icon just gets no logo instead of a wrong one.
import { useEffect, useState } from 'react';
import { loadThesvgRegistry, findThesvgIconByName, thesvgIconUrl } from '../lib/thesvgRegistry';

export function useThesvgIcons(names: string[]): Record<string, string> {
  const [icons, setIcons] = useState<Record<string, string>>({});
  const key = names.join('|');

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    loadThesvgRegistry()
      .then((registry) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const name of key.split('|')) {
          const icon = findThesvgIconByName(registry, name);
          if (icon) map[name] = thesvgIconUrl(icon.slug);
        }
        setIcons(map);
      })
      .catch(() => {
        if (!cancelled) setIcons({});
      });

    return () => { cancelled = true; };
  }, [key]);

  return icons;
}
