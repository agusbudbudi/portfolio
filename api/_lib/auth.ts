// HMAC-SHA256 session tokens via Web Crypto — no auth library needed.
// Token format: base64url(JSON payload) + "." + base64url(HMAC signature).
// Payload carries the identity (userId + roles) resolved at login time by
// verifying a Google-signed ID token — see api/login.ts.
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
  roles: string[];
  exp: number;
}

export async function signSession(
  secret: string,
  userId: string,
  roles: string[],
  ttlMs = TOKEN_TTL_MS
): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Date.now() + ttlMs;
  const payload = enc.encode(JSON.stringify({ userId, roles, exp: expiresAt }));
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
    return { userId: parsed.userId, roles: parsed.roles, exp: parsed.exp };
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
