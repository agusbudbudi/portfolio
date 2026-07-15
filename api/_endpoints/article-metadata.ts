import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveSession } from '../_lib/auth.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

// Any authenticated user: given an article URL, fetches the page server-side
// (avoids browser CORS) and scrapes <head> meta tags for the Article preview
// card (title/description/thumbnail/source) in the portfolio admin and member editor.
const FETCH_TIMEOUT_MS = 8000;
const MAX_HEAD_BYTES = 300 * 1024; // <head> is always well under this; caps a malicious/huge response
const MAX_REDIRECTS = 5;
const ARTICLE_METADATA_RATE_LIMIT = { maxAttempts: 20, windowMs: 60 * 60 * 1000 };

// SSRF guard: blocks loopback, RFC1918, link-local (incl. the cloud metadata
// endpoint at 169.254.169.254), CGNAT, and IPv6 ULA/link-local. Checked on
// every hop of a redirect chain, not just the initial URL — see fetchFollowingRedirects.
function isPrivateHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h === '0.0.0.0' || h === '::1' || h === '::' || h.endsWith('.local')) return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true; // link-local, incl. cloud metadata (169.254.169.254)
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(h)) return true; // CGNAT 100.64.0.0/10
  if (/^f[cd][0-9a-f]{2}:/.test(h)) return true; // IPv6 ULA fc00::/7
  if (/^fe[89ab][0-9a-f]:/.test(h)) return true; // IPv6 link-local fe80::/10
  return false;
}

// fetch()'s redirect:'follow' would resolve+request each hop without ever
// re-running isPrivateHostname on it — an attacker-controlled first hop can
// pass validation cleanly, then 302 to an internal address. Following
// redirects manually re-validates the Location on every hop instead.
async function fetchFollowingRedirects(startUrl: URL, signal: AbortSignal): Promise<Response> {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (isPrivateHostname(current.hostname)) {
      throw new Error('blocked_host');
    }
    const response = await fetch(current.toString(), {
      signal,
      redirect: 'manual',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MentorQABot/1.0; +https://www.mentorqa.com)' },
    });
    const isRedirect = response.status >= 300 && response.status < 400;
    const location = response.headers.get('location');
    if (!isRedirect || !location) return response;
    current = new URL(location, current);
    if (current.protocol !== 'http:' && current.protocol !== 'https:') throw new Error('blocked_host');
  }
  throw new Error('too_many_redirects');
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

  const session = await resolveSession(req, res);
  if (!session) return;

  const allowed = await checkRateLimit(
    `article-metadata:${session.userId}`,
    ARTICLE_METADATA_RATE_LIMIT.maxAttempts,
    ARTICLE_METADATA_RATE_LIMIT.windowMs
  );
  if (!allowed) {
    return res.status(429).json({ error: 'rate_limited', message: 'Terlalu banyak permintaan. Coba lagi nanti.' });
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
    const response = await fetchFollowingRedirects(parsed, controller.signal);
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
    if (err instanceof Error && (err.message === 'blocked_host' || err.message === 'too_many_redirects')) {
      return res.status(400).json({ error: 'invalid_url', message: 'URL tidak diizinkan.' });
    }
    const message = err instanceof Error && err.name === 'AbortError'
      ? 'Timeout saat mengambil URL.'
      : 'Gagal mengambil metadata dari URL.';
    return res.status(502).json({ error: 'fetch_failed', message });
  } finally {
    clearTimeout(timeout);
  }
}
