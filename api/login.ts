import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkPassword, signToken } from './_lib/auth.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;
  if (!adminPassword || !sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'ADMIN_PASSWORD / SESSION_SECRET env vars are not set.' });
  }

  const password = typeof req.body === 'object' && req.body !== null ? (req.body as { password?: unknown }).password : undefined;
  if (typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'missing_password' });
  }

  if (!(await checkPassword(sessionSecret, password, adminPassword))) {
    await sleep(300); // cheap brute-force friction
    return res.status(401).json({ error: 'invalid_password' });
  }

  const { token, expiresAt } = await signToken(sessionSecret);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ token, expiresAt });
}
