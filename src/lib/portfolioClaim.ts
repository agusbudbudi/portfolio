import { slugify } from './portfolioValidation';

// Portfolio URL a guest "claimed" on the /portfolio landing before logging
// in. Parked in localStorage (survives the Google redirect login) and used only
// as a prefill for the member's first portfolio, so a stale value on a shared
// device costs nothing: it is a suggestion, not a reservation.

export const PORTFOLIO_CLAIM_KEY = 'portfolio-claim-slug';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const SLUG_MAX_LENGTH = 60;

/**
 * Live-typing cleanup for the claim input: lowercase, accents stripped, any
 * run of other characters becomes one hyphen, no leading hyphen. A single
 * trailing hyphen is kept so "budi-" can still become "budi-santoso".
 */
export function sanitizeSlugInput(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, SLUG_MAX_LENGTH);
}

/** Final slug on submit (no leading/trailing/double hyphens). */
export function finalizeSlug(raw: string): string {
  return slugify(raw).slice(0, SLUG_MAX_LENGTH).replace(/-+$/, '');
}

/** A close alternative to offer when the slug is taken. */
export function suggestSlug(slug: string): string {
  return slug.endsWith('-qa') ? `${slug}-${new Date().getFullYear()}` : `${slug}-qa`;
}

export function parsePortfolioClaim(raw: string | null, now: number): string | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { slug?: unknown; at?: unknown };
    if (typeof parsed.slug !== 'string' || typeof parsed.at !== 'number') return null;
    if (now - parsed.at > MAX_AGE_MS) return null;
    const slug = finalizeSlug(parsed.slug);
    return slug || null;
  } catch {
    return null;
  }
}

export function parkPortfolioClaim(slug: string): void {
  try { localStorage.setItem(PORTFOLIO_CLAIM_KEY, JSON.stringify({ slug, at: Date.now() })); } catch { /* prefill is best-effort */ }
}

export function readPortfolioClaim(): string | null {
  try {
    const slug = parsePortfolioClaim(localStorage.getItem(PORTFOLIO_CLAIM_KEY), Date.now());
    if (!slug) localStorage.removeItem(PORTFOLIO_CLAIM_KEY);
    return slug;
  } catch {
    return null;
  }
}

export function clearPortfolioClaim(): void {
  try { localStorage.removeItem(PORTFOLIO_CLAIM_KEY); } catch { /* nothing to clear */ }
}
