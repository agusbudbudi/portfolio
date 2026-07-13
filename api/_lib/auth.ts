// HMAC-SHA256 session tokens via Web Crypto — no auth library needed.
// Token format: base64url(JSON payload) + "." + base64url(HMAC signature).
// Payload carries the identity (userId + roles) resolved at login time by
// verifying a Google-signed ID token — see api/login.ts.
import type { VercelRequest, VercelResponse } from '@vercel/node';

const enc = new TextEncoder();

function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

const b64url = (buf: ArrayBuffer | Uint8Array) => Buffer.from(buf as ArrayBuffer).toString('base64url');

export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export interface SessionPayload {
  userId: string;
  email?: string;
  roles: string[];
  exp: number;
}

export async function signSession(
  secret: string,
  userId: string,
  roles: string[],
  email?: string,
  ttlMs = TOKEN_TTL_MS
): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Date.now() + ttlMs;
  const payload = enc.encode(JSON.stringify({ userId, email, roles, exp: expiresAt }));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), payload);
  return { token: `${b64url(payload)}.${b64url(sig)}`, expiresAt };
}

export async function verifySession(secret: string, token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [p, s] = token.split('.');
  if (!p || !s) return null;
  try {
    const payload = Buffer.from(p, 'base64url');
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      Buffer.from(s, 'base64url'),
      payload
    );
    if (!ok) return null;
    const parsed = JSON.parse(payload.toString('utf8'));
    if (
      typeof parsed?.userId !== 'string' ||
      !Array.isArray(parsed?.roles) ||
      !parsed.roles.every((r: unknown) => typeof r === 'string') ||
      typeof parsed?.exp !== 'number' ||
      Date.now() >= parsed.exp
    ) {
      return null;
    }
    return {
      userId: parsed.userId,
      email: typeof parsed.email === 'string' ? parsed.email : undefined,
      roles: parsed.roles,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization?.startsWith('Bearer ')) return undefined;
  return authorization.slice('Bearer '.length);
}

// Any authenticated user, any role — used where the caller just needs to be
// a real logged-in account (e.g. submitting a mentor application), not
// specifically an admin.
export async function requireSession(
  secret: string,
  authorization: string | undefined
): Promise<SessionPayload | null> {
  return verifySession(secret, bearerToken(authorization));
}

// Boundary-preserving admin gate: same effective restriction as the old
// single-shared-password check, just identity-backed instead of
// password-backed. Every current admin-only endpoint uses this.
export async function requireAdminSession(
  secret: string,
  authorization: string | undefined
): Promise<SessionPayload | null> {
  const session = await verifySession(secret, bearerToken(authorization));
  if (!session || !session.roles.includes('admin')) return null;
  return session;
}

// req/res-aware wrappers around requireSession/requireAdminSession — every
// protected route handler used to repeat the SESSION_SECRET-missing (500) +
// unauthorized (401) boilerplate inline. These write that response directly
// and return null on failure, so a handler's auth check collapses to:
//   const session = await resolveSession(req, res);
//   if (!session) return;
// Route-specific authorization (ownership, role beyond "admin", field-locks)
// stays in the route — only the session-resolution boilerplate is shared.
export async function resolveSession(req: VercelRequest, res: VercelResponse): Promise<SessionPayload | null> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
    return null;
  }
  const session = await requireSession(sessionSecret, req.headers.authorization);
  if (!session) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  return session;
}

// Pure ownership match — no admin bypass. Used both standalone (a route with
// several possible "owner" relations, e.g. bookings' mentee-vs-mentor) and as
// a building block for requireOwnerOrAdmin below.
export function isResourceOwner(session: SessionPayload, ownerId: string | null | undefined): boolean {
  return ownerId != null && ownerId === session.userId;
}

// Collapses the "admin, or the record's own owner, else 403" check repeated
// across mentors/[id].ts and portfolios/[slug].ts into one call. Resources
// with more than one ownership relation (bookings: mentee vs. assigned
// mentor) don't fit this shape and keep their own inline logic.
export function requireOwnerOrAdmin(
  res: VercelResponse,
  session: SessionPayload,
  ownerId: string | null | undefined
): boolean {
  if (session.roles.includes('admin') || isResourceOwner(session, ownerId)) return true;
  res.status(403).json({ error: 'forbidden' });
  return false;
}

export async function resolveAdminSession(req: VercelRequest, res: VercelResponse): Promise<SessionPayload | null> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
    return null;
  }
  const session = await requireAdminSession(sessionSecret, req.headers.authorization);
  if (!session) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  return session;
}
