// Full-page Google sign-in for in-app browsers (Threads, Instagram, ...).
//
// The Google Identity Services button signs in through a popup, which these
// webviews open as a blank page that never posts the credential back. A
// same-tab redirect works there, so in-app browsers go to Google's OAuth
// endpoint with `response_type=id_token` and come back to /login with the ID
// token in the URL fragment. That token is the same kind of credential the
// GIS button returns, so it goes through the existing `login()` unchanged.
//
// The redirect URI must be listed under "Authorized redirect URIs" of the
// OAuth client in Google Cloud Console (https://www.mentorqa.com/login).

const STORAGE_KEY = 'google_redirect_auth';
const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export const REDIRECT_PATH = '/login';

export interface PendingRedirect {
  state: string;
  nonce: string;
  returnTo: string;
}

export type RedirectResult =
  | { kind: 'success'; credential: string; returnTo: string }
  | { kind: 'error'; message: string; returnTo: string | null };

function randomToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Only same-site paths, so `returnTo` can't send the user off-site. */
export function safeReturnTo(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return '/dashboard';
  return path;
}

export function buildGoogleAuthUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string;
}): string {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    response_type: 'id_token',
    scope: 'openid email profile',
    state: opts.state,
    nonce: opts.nonce,
    prompt: 'select_account',
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

/** Leaves the page for Google's account chooser; comes back to /login. */
export function startGoogleRedirect(clientId: string, returnTo: string): void {
  const pending: PendingRedirect = {
    state: randomToken(),
    nonce: randomToken(),
    returnTo: safeReturnTo(returnTo),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    // Storage blocked: the return trip will fail the state check and show
    // the "open in browser" fallback instead of logging in unverified.
  }
  window.location.assign(buildGoogleAuthUrl({
    clientId,
    redirectUri: `${window.location.origin}${REDIRECT_PATH}`,
    state: pending.state,
    nonce: pending.nonce,
  }));
}

function decodeJwtPayload(jwt: string): Record<string, unknown> | null {
  const part = jwt.split('.')[1];
  if (!part) return null;
  try {
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Reads Google's reply from a URL fragment. Returns null when the fragment
 * isn't an OAuth reply. Pure (storage is passed in) so it can be tested.
 */
export function parseGoogleRedirect(hash: string, pending: PendingRedirect | null): RedirectResult | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const idToken = params.get('id_token');
  const error = params.get('error');
  if (!idToken && !error) return null;

  const returnTo = pending?.returnTo ?? null;
  if (error) {
    const message = error === 'access_denied' ? 'Login dibatalkan.' : 'Login Google gagal. Coba lagi.';
    return { kind: 'error', message, returnTo };
  }
  if (!pending || params.get('state') !== pending.state) {
    return { kind: 'error', message: 'Sesi login kedaluwarsa. Coba lagi.', returnTo };
  }
  const payload = decodeJwtPayload(idToken!);
  if (!payload || payload.nonce !== pending.nonce) {
    return { kind: 'error', message: 'Login Google gagal. Coba lagi.', returnTo };
  }
  return { kind: 'success', credential: idToken!, returnTo: pending.returnTo };
}

/** Consumes the pending redirect: reads it once, then clears it. */
export function takePendingRedirect(): PendingRedirect | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingRedirect) : null;
  } catch {
    return null;
  }
}
