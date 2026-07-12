import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bearerToken, verifyToken } from './_lib/auth.js';

// Admin-only: given an article URL, fetches the page server-side (avoids
// browser CORS) and scrapes <head> meta tags for the Article preview card
// (title/description/thumbnail/source) in the portfolio admin.
const FETCH_TIMEOUT_MS = 8000;
const MAX_HEAD_BYTES = 300 * 1024; // <head> is always well under this; caps a malicious/huge response

function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1' || h.endsWith('.local')) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  return false;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

function firstMatch(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m?.[1] ? decodeEntities(m[1].trim()) : undefined;
}

// <meta> attributes can appear in either order (property/name before or
// after content), so try both.
function metaContent(html: string, attr: 'property' | 'name', key: string): string | undefined {
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']*)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${key}["']`, 'i');
  return firstMatch(html, re1) ?? firstMatch(html, re2);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }
  if (!(await verifyToken(sessionSecret, bearerToken(req.headers.authorization)))) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const { url } = body as { url?: unknown };
  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'invalid_url' });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'invalid_url', message: 'URL tidak valid.' });
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'invalid_url', message: 'URL harus diawali http:// atau https://.' });
  }
  if (isPrivateHostname(parsed.hostname)) {
    return res.status(400).json({ error: 'invalid_url', message: 'URL tidak diizinkan.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MentorQABot/1.0; +https://portfolio-qa-agus.vercel.app)' },
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'fetch_failed', message: `Gagal mengambil URL (HTTP ${response.status}).` });
    }

    let html = '';
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let received = 0;
      while (received < MAX_HEAD_BYTES) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (/<\/head>/i.test(html)) break;
      }
      await reader.cancel().catch(() => {});
    } else {
      html = await response.text();
    }

    const title = metaContent(html, 'property', 'og:title') ?? firstMatch(html, /<title[^>]*>([^<]*)<\/title>/i);
    const description = metaContent(html, 'property', 'og:description') ?? metaContent(html, 'name', 'description');
    let thumbnail = metaContent(html, 'property', 'og:image');
    if (thumbnail) {
      try {
        thumbnail = new URL(thumbnail, parsed).toString();
      } catch {
        thumbnail = undefined;
      }
    }
    const source = metaContent(html, 'property', 'og:site_name') ?? parsed.hostname.replace(/^www\./, '');

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ title, description, thumbnail, source });
  } catch (err) {
    const message = err instanceof Error && err.name === 'AbortError'
      ? 'Timeout saat mengambil URL.'
      : 'Gagal mengambil metadata dari URL.';
    return res.status(502).json({ error: 'fetch_failed', message });
  } finally {
    clearTimeout(timeout);
  }
}
