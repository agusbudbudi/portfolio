// Public aggregate read of the mentoring config — merges the three
// independently-stored resources (topics, mentors, booking-rules) into the
// full MentoringConfig shape the public site (useConfig) expects.
// Read-only: writes go through /api/admin-config/topics, /api/mentors, /api/admin-config/booking-rules.
//
// Also serves /sitemap.xml (via ?format=sitemap, rewritten in vercel.json) —
// folded in here rather than its own function to stay under the Hobby plan's
// 12-serverless-function cap; both are public read-only GETs anyway.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readBookingRules, readTopics } from '../_lib/configStore.js';
import { listMentors } from '../_lib/mentorStore.js';
import { listPortfolios } from '../_lib/portfolioStore.js';
import type { MentoringConfig } from '../../src/types/mentoring';

const SITE_URL = 'https://www.mentorqa.com';

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

async function handleSitemap(res: VercelResponse) {
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

async function handleConfig(res: VercelResponse) {
  const [topicsDoc, mentors, rulesDoc] = await Promise.all([
    readTopics(),
    listMentors({ verifiedOnly: true }),
    readBookingRules(),
  ]);

  const config: MentoringConfig = {
    metadata: rulesDoc.metadata,
    topics: topicsDoc.topics,
    mentors,
    availableDays: rulesDoc.availableDays,
    bookingRules: rulesDoc.bookingRules,
  };

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(config);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (req.query.format === 'sitemap') {
    return handleSitemap(res);
  }
  return handleConfig(res);
}
