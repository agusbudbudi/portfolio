// Dynamic sitemap: static routes + verified mentors + published portfolios,
// so search engines discover mentor/portfolio pages without a manual
// re-publish (the old public/sitemap.xml only listed the fixed page set).
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listMentors } from './_lib/mentorStore.js';
import { listPortfolios } from './_lib/portfolioStore.js';

const SITE_URL = 'https://portfolio-qa-agus.vercel.app';

interface UrlEntry {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: string;
  lastmod?: string;
}

const STATIC_ROUTES: UrlEntry[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/mentoring/booking', changefreq: 'weekly', priority: '0.9' },
  { loc: '/portfolio', changefreq: 'weekly', priority: '0.8' },
  { loc: '/personal-portfolio', changefreq: 'monthly', priority: '0.9' },
  { loc: '/personal-portfolio/about', changefreq: 'monthly', priority: '0.6' },
  { loc: '/personal-portfolio/projects', changefreq: 'monthly', priority: '0.7' },
  { loc: '/personal-portfolio/certifications', changefreq: 'monthly', priority: '0.5' },
];

function toXml(entries: UrlEntry[]): string {
  const urls = entries
    .map((e) => {
      const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : '';
      return `  <url>\n    <loc>${SITE_URL}${e.loc}</loc>${lastmod}\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const [mentors, portfolios] = await Promise.all([
    listMentors({ verifiedOnly: true }),
    listPortfolios(),
  ]);

  const mentorEntries: UrlEntry[] = mentors.map((m) => ({
    loc: `/mentor/${m.id}`,
    changefreq: 'weekly',
    priority: '0.7',
    lastmod: m.updatedAt,
  }));

  const portfolioEntries: UrlEntry[] = portfolios
    .filter((p) => p.status === 'published')
    .map((p) => ({
      loc: `/portfolio/${p.slug}`,
      changefreq: 'monthly',
      priority: '0.6',
      lastmod: p.updatedAt,
    }));

  const xml = toXml([...STATIC_ROUTES, ...mentorEntries, ...portfolioEntries]);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
