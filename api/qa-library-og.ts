import type { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readQaLibraryArticleBySlug } from './_lib/qaLibraryStore.js';
import { readQaCourseBySlug } from './_lib/qaCourseStore.js';
import { readPublicByShareId, SHARE_ID_PATTERN } from './_lib/simulatorStore.js';
import { listMentors } from './_lib/mentorStore.js';
import { readPortfolioBySlug } from './_lib/portfolioStore.js';
import { DEFAULT_OG_IMAGE, SITE_URL, findPageSeo, ogImageUrl } from '../src/lib/pageSeo.js';

// Bot-only HTML shell for /qa-library/:slug — vercel.json rewrites requests
// whose User-Agent matches a known crawler (social preview bots + search
// engines) here before they'd hit the SPA's static index.html. Non-JS
// crawlers never run react-helmet-async, so without this they'd see the
// generic site-wide OG tags baked into index.html instead of the article's
// own title/description/thumbnail. Real browsers never match the rewrite
// and get the normal React app.

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
  /** og:/twitter: copy; falls back to title/description. */
  shareTitle?: string;
  shareDescription?: string;
  image: string;
  type: 'article' | 'website' | 'profile';
  noindex?: boolean;
  jsonLd?: object;
  bodyHtml: string;
}

function renderOgHtml(p: OgPage): string {
  const title = escapeHtml(p.title);
  const description = escapeHtml(p.description);
  const shareTitle = escapeHtml(p.shareTitle ?? p.title);
  const shareDescription = escapeHtml(p.shareDescription ?? p.description);
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
<meta property="og:title" content="${shareTitle}" />
<meta property="og:description" content="${shareDescription}" />
<meta property="og:url" content="${p.url}" />
<meta property="og:image" content="${image}" />
<meta property="og:locale" content="id_ID" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${shareTitle}" />
<meta name="twitter:description" content="${shareDescription}" />
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
    image: ogImage(course.seoOgImage, course.thumbnailUrl, ogImageUrl('courses')),
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
    image: ogImageUrl('qa-simulator'),
    type: 'profile',
    noindex: true,
    bodyHtml: `<main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></main>`,
  }), 'public, max-age=0, s-maxage=10');
}

const CACHE_PUBLIC = 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600';
const clip = (s: string, n = 200) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

// Static public pages (/, /courses, /mentoring, ...): copy + image from
// src/lib/pageSeo.ts, the same map the SPA's <Seo> reads.
function handlePage(res: VercelResponse, path: string) {
  const seo = findPageSeo(path);
  if (!seo) return sendHtml(res, 404, notFoundHtml(), 'no-store');
  return sendHtml(res, 200, renderOgHtml({
    url: `${SITE_URL}${seo.path === '/' ? '/' : seo.path}`,
    title: seo.title,
    description: seo.description,
    shareTitle: seo.shareTitle,
    shareDescription: seo.shareDescription,
    image: seo.image,
    noindex: seo.noindex,
    type: seo.path.startsWith('/personal-portfolio') ? 'profile' : 'website',
    bodyHtml: `<main><h1>${escapeHtml(seo.title)}</h1><p>${escapeHtml(seo.description)}</p></main>`,
  }), CACHE_PUBLIC);
}

// /mentor/:slug — same visibility as the public page (verified mentors only).
async function handleMentor(res: VercelResponse, id: string) {
  const mentor = id ? (await listMentors({ verifiedOnly: true })).find((m) => m.id === id) : undefined;
  if (!mentor) return sendHtml(res, 404, notFoundHtml(), 'no-store');
  const description = clip(mentor.bio || `Mentor QA di Mentor.QA. Keahlian: ${mentor.expertise.join(', ')}.`);
  return sendHtml(res, 200, renderOgHtml({
    url: `${SITE_URL}/mentor/${encodeURIComponent(mentor.id)}`,
    title: `${mentor.name} - Mentor QA | Mentor.QA`,
    description,
    shareTitle: `Mentoring QA 1-on-1 bareng ${mentor.name}`,
    image: ogImageUrl('mentoring'),
    type: 'profile',
    bodyHtml: `<main><h1>${escapeHtml(mentor.name)}</h1><p>${escapeHtml(description)}</p></main>`,
  }), CACHE_PUBLIC);
}

// /portfolio/:slug — published portfolios only; the owner's photo when it's
// a raster image, else the Portfolio QA card.
async function handlePortfolio(res: VercelResponse, slug: string) {
  const portfolio = slug ? await readPortfolioBySlug(slug) : null;
  if (!portfolio || portfolio.status !== 'published') return sendHtml(res, 404, notFoundHtml(), 'no-store');
  const { profile } = portfolio.data;
  const description = clip(profile.bio || `${profile.role ?? 'QA Engineer'}. Lihat project, skill, dan sertifikasinya di Mentor.QA.`);
  return sendHtml(res, 200, renderOgHtml({
    url: `${SITE_URL}/portfolio/${encodeURIComponent(portfolio.slug)}`,
    title: `${profile.name} - Portfolio QA | Mentor.QA`,
    description,
    shareTitle: `${profile.name}${profile.role ? `, ${profile.role}` : ''} | Portfolio QA`,
    image: ogImage(profile.photo, ogImageUrl('portfolio')),
    type: 'profile',
    bodyHtml: `<main><h1>${escapeHtml(profile.name)}</h1><p>${escapeHtml(description)}</p></main>`,
  }), CACHE_PUBLIC);
}

// /qa-simulator/:projectId — project list is static JSON on this deployment.
async function handleProject(req: VercelRequest, res: VercelResponse, projectId: string) {
  let project: { id: string; title: string; summary: string } | undefined;
  try {
    const host = req.headers['x-forwarded-host'] ?? req.headers.host;
    const proto = req.headers['x-forwarded-proto'] ?? 'https';
    const r = await fetch(`${proto}://${host}/qa-simulator/config/index.json`);
    if (r.ok) {
      const index = (await r.json()) as { projects: { id: string; title: string; summary: string }[] };
      project = index.projects.find((p) => p.id === projectId);
    }
  } catch {
    // Fall through to the QA Simulator landing copy below.
  }
  if (!project) return handlePage(res, '/qa-simulator');
  const description = clip(project.summary);
  return sendHtml(res, 200, renderOgHtml({
    url: `${SITE_URL}/qa-simulator/${encodeURIComponent(project.id)}`,
    title: `${project.title} | QA Simulator`,
    description,
    shareTitle: `Simulasi QA: ${project.title}`,
    image: ogImageUrl('qa-simulator'),
    type: 'website',
    bodyHtml: `<main><h1>${escapeHtml(project.title)}</h1><p>${escapeHtml(description)}</p></main>`,
  }), CACHE_PUBLIC);
}

function notFoundHtml(): string {
  return '<!doctype html><html lang="id"><head><meta charset="UTF-8" /><meta name="robots" content="noindex, nofollow" /><title>Halaman tidak ditemukan | Mentor.QA</title></head><body>Halaman tidak ditemukan.</body></html>';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // One function serves every bot-only preview (Hobby plan function cap):
  // ?type=course&slug=… · ?type=share&shareId=… · ?type=page&path=… ·
  // ?type=mentor&slug=… · ?type=portfolio&slug=… · ?type=project&id=… ·
  // default: library article.
  const type = firstParam(req.query.type);
  if (type === 'course') return handleCourse(res, firstParam(req.query.slug));
  if (type === 'share') return handleShare(req, res, firstParam(req.query.shareId));
  if (type === 'page') return handlePage(res, firstParam(req.query.path));
  if (type === 'mentor') return handleMentor(res, firstParam(req.query.slug));
  if (type === 'portfolio') return handlePortfolio(res, firstParam(req.query.slug));
  if (type === 'project') return handleProject(req, res, firstParam(req.query.id));

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
  const image = escapeHtml(ogImage(article.seoOgImage, article.thumbnailUrl, ogImageUrl('qa-library')));
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
