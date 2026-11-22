import type { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readQaLibraryArticleBySlug } from './_lib/qaLibraryStore.js';
import { readQaCourseBySlug } from './_lib/qaCourseStore.js';
import { readPublicByShareId, SHARE_ID_PATTERN } from './_lib/simulatorStore.js';

// Bot-only HTML shell for /qa-library/:slug — vercel.json rewrites requests
// whose User-Agent matches a known crawler (social preview bots + search
// engines) here before they'd hit the SPA's static index.html. Non-JS
// crawlers never run react-helmet-async, so without this they'd see the
// generic site-wide OG tags baked into index.html instead of the article's
// own title/description/thumbnail. Real browsers never match the rewrite
// and get the normal React app.
const SITE_URL = 'https://www.mentorqa.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/shared/img/DEFAULT_OG_IMAGE.png`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Social platforms (LinkedIn, Facebook, WhatsApp, X) don't render SVG as a
// preview image, so an SVG thumbnail falls back to the site's default card.
function ogImage(...candidates: (string | undefined)[]): string {
  const usable = candidates.find((u) => u && !/\.svg(\?|$)/i.test(u));
  return usable ?? DEFAULT_OG_IMAGE;
}

interface OgPage {
  url: string;
  title: string;
  description: string;
  image: string;
  type: 'article' | 'website' | 'profile';
  noindex?: boolean;
  jsonLd?: object;
  bodyHtml: string;
}

function renderOgHtml(p: OgPage): string {
  const title = escapeHtml(p.title);
  const description = escapeHtml(p.description);
  const image = escapeHtml(p.image);
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
${p.noindex ? '<meta name="robots" content="noindex, nofollow" />\n' : ''}<link rel="canonical" href="${p.url}" />
<meta property="og:type" content="${p.type}" />
<meta property="og:site_name" content="Mentor.QA | QA Engineer" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${p.url}" />
<meta property="og:image" content="${image}" />
<meta property="og:locale" content="id_ID" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
${p.jsonLd ? `<script type="application/ld+json">${JSON.stringify(p.jsonLd).replace(/</g, '\\u003c')}</script>\n` : ''}</head>
<body>
${p.bodyHtml}
</body>
</html>`;
}

function sendHtml(res: VercelResponse, status: number, html: string, cache: string) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  return res.status(status).send(html);
}

const firstParam = (v: unknown) => (typeof v === 'string' ? v : Array.isArray(v) ? String(v[0] ?? '') : '');

// /courses/:slug for bots: the course's own title, description and card.
async function handleCourse(res: VercelResponse, slug: string) {
  const course = slug ? await readQaCourseBySlug(slug) : null;
  if (!course || course.status !== 'published') return sendHtml(res, 404, notFoundHtml(), 'no-store');
  const url = `${SITE_URL}/courses/${course.slug}`;
  const description = course.seoMetaDescription || course.description;
  return sendHtml(res, 200, renderOgHtml({
    url,
    title: course.seoMetaTitle || `${course.title} | QA Course`,
    description,
    image: ogImage(course.seoOgImage, course.thumbnailUrl),
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.description,
      url,
      inLanguage: 'id',
      isAccessibleForFree: true,
      provider: { '@type': 'Organization', name: 'Mentor.QA', url: SITE_URL },
    },
    bodyHtml: `<main><h1>${escapeHtml(course.title)}</h1><p>${escapeHtml(description)}</p><ol>${course.modules
      .map((m) => `<li>${escapeHtml(m.title)}</li>`)
      .join('')}</ol></main>`,
  }), 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
}

// Shared simulator portfolio for bots (LinkedIn preview of a learner's link):
// owner + project name, never indexed. Project titles live in static JSON,
// read from this deployment's own origin.
async function handleShare(req: VercelRequest, res: VercelResponse, shareId: string) {
  const found = SHARE_ID_PATTERN.test(shareId) ? await readPublicByShareId(shareId) : null;
  if (!found) return sendHtml(res, 404, notFoundHtml(), 'no-store');
  const { portfolio } = found;
  let product = portfolio.projectId;
  let projectTitle = '';
  try {
    const host = req.headers['x-forwarded-host'] ?? req.headers.host;
    const proto = req.headers['x-forwarded-proto'] ?? 'https';
    const r = await fetch(`${proto}://${host}/qa-simulator/config/${encodeURIComponent(portfolio.projectId)}.json`);
    if (r.ok) {
      const project = (await r.json()) as { product?: string; title?: string };
      product = project.product ?? product;
      projectTitle = project.title ?? '';
    }
  } catch {
    // Fall back to the project id; the preview still works.
  }
  const url = `${SITE_URL}/qa-simulator/${portfolio.projectId}/portfolio/${portfolio.shareId}`;
  const title = `Portfolio QA: ${portfolio.owner.name} · ${product}`;
  const description = `QA case study ${projectTitle ? `"${projectTitle}" ` : ''}oleh ${portfolio.owner.name}: analisis PRD, test case, dan bug report yang dikerjakan di QA Simulator Mentor.QA.`;
  return sendHtml(res, 200, renderOgHtml({
    url,
    title,
    description,
    image: DEFAULT_OG_IMAGE,
    type: 'profile',
    noindex: true,
    bodyHtml: `<main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></main>`,
  }), 'public, max-age=0, s-maxage=10');
}

function notFoundHtml(): string {
  return '<!doctype html><html lang="id"><head><meta charset="UTF-8" /><meta name="robots" content="noindex, nofollow" /><title>Halaman tidak ditemukan | Mentor.QA</title></head><body>Halaman tidak ditemukan.</body></html>';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // One function serves every bot-only preview (Hobby plan function cap):
  // ?type=course&slug=… · ?type=share&shareId=… · default: library article.
  const type = firstParam(req.query.type);
  if (type === 'course') return handleCourse(res, firstParam(req.query.slug));
  if (type === 'share') return handleShare(req, res, firstParam(req.query.shareId));

  const slugParam = req.query.slug;
  const slug = typeof slugParam === 'string' ? slugParam : Array.isArray(slugParam) ? slugParam[0] : '';
  const article = slug ? await readQaLibraryArticleBySlug(slug) : null;

  if (!article || article.status !== 'published') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).send(notFoundHtml());
  }

  const url = `${SITE_URL}/qa-library/${article.slug}`;
  const title = escapeHtml(article.seoMetaTitle || `${article.title} | QA Library`);
  const description = escapeHtml(article.seoMetaDescription || article.excerpt);
  const image = escapeHtml(ogImage(article.seoOgImage, article.thumbnailUrl));
  const bodyHtml = renderToStaticMarkup(React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, article.body));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Person', name: article.authorName },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Mentor.QA | QA Engineer" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:locale" content="id_ID" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
</head>
<body>
<article>
<h1>${escapeHtml(article.title)}</h1>
<p>${description}</p>
${bodyHtml}
</article>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).send(html);
}
