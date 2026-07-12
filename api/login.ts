import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { signSession } from './_lib/auth.js';
import { upsertUserByGoogleSub } from './_lib/userStore.js';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!googleClientId || !sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'GOOGLE_CLIENT_ID / SESSION_SECRET env vars are not set.' });
  }

  const credential = typeof req.body === 'object' && req.body !== null ? (req.body as { credential?: unknown }).credential : undefined;
  if (typeof credential !== 'string' || credential.length === 0) {
    return res.status(400).json({ error: 'missing_credential' });
  }

  let payload;
  try {
    const result = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: GOOGLE_ISSUERS,
      audience: googleClientId,
    });
    payload = result.payload;
  } catch {
    return res.status(401).json({ error: 'invalid_credential' });
  }

  const googleSub = typeof payload.sub === 'string' ? payload.sub : undefined;
  const email = typeof payload.email === 'string' ? payload.email : undefined;
  if (!googleSub || !email || payload.email_verified === false) {
    return res.status(401).json({ error: 'invalid_credential' });
  }
  const name = typeof payload.name === 'string' ? payload.name : email;
  const avatarUrl = typeof payload.picture === 'string' ? payload.picture : null;

  const user = await upsertUserByGoogleSub({ googleSub, email, name, avatarUrl });
  const { token, expiresAt } = await signSession(sessionSecret, user.id, user.roles);

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
    },
  });
}
