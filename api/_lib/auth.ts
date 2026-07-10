// HMAC-SHA256 session tokens via Web Crypto — no auth library needed.
// Token format: base64url(JSON payload) + "." + base64url(HMAC signature).
import { timingSafeEqual } from 'node:crypto';

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

export async function signToken(secret: string, ttlMs = TOKEN_TTL_MS): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Date.now() + ttlMs;
  const payload = enc.encode(JSON.stringify({ exp: expiresAt }));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), payload);
  return { token: `${b64url(payload)}.${b64url(sig)}`, expiresAt };
}

export async function verifyToken(secret: string, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [p, s] = token.split('.');
  if (!p || !s) return false;
  try {
    const payload = Buffer.from(p, 'base64url');
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      Buffer.from(s, 'base64url'),
      payload
    );
    if (!ok) return false;
    const { exp } = JSON.parse(payload.toString('utf8'));
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

// Constant-time password check: compare HMACs of both values, never raw strings.
export async function checkPassword(secret: string, given: string, actual: string): Promise<boolean> {
  const key = await hmacKey(secret);
  const [a, b] = await Promise.all([
    crypto.subtle.sign('HMAC', key, enc.encode(given)),
    crypto.subtle.sign('HMAC', key, enc.encode(actual)),
  ]);
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization?.startsWith('Bearer ')) return undefined;
  return authorization.slice('Bearer '.length);
}
