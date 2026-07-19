import type { VercelRequest, VercelResponse } from '@vercel/node';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { readQaLibraryArticleBySlug } from './_lib/qaLibraryStore.js';

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

function notFoundHtml(): string {
  return '<!doctype html><html lang="id"><head><meta charset="UTF-8" /><meta name="robots" content="noindex, nofollow" /><title>Artikel tidak ditemukan | QA Library</title></head><body>Artikel tidak ditemukan.</body></html>';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  const image = escapeHtml(article.seoOgImage || article.thumbnailUrl || DEFAULT_OG_IMAGE);
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
