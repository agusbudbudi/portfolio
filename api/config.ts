import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bearerToken, verifyToken } from './_lib/auth';
import { readConfigBlob, writeConfigBlob } from './_lib/configStore';
import { validateMentoringConfig } from '../src/lib/configValidation';
import type { MentoringConfig } from '../src/types/mentoring';
// Bundled into the function at build time — the pre-seed fallback and the
// permanent degradation path if Blob is unavailable. Imported (not fetched over
// HTTP) because the SPA rewrite swallows /config/*.json under `vercel dev`.
import staticConfig from '../public/config/qa-mentoring-config.json';

async function handleGet(_req: VercelRequest, res: VercelResponse) {
  const fromBlob = await readConfigBlob();
  const config = fromBlob ?? (staticConfig as unknown as MentoringConfig);
  res.setHeader('x-config-source', fromBlob ? 'blob' : 'static');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(config);
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }

  if (!(await verifyToken(sessionSecret, bearerToken(req.headers.authorization)))) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const result = validateMentoringConfig(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_config', errors: result.errors });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded.
  // Skipped when the blob doesn't exist yet (first save = seed).
  const current = await readConfigBlob();
  if (current?.metadata.updatedAt) {
    const clientVersion = req.headers['x-config-updated-at'];
    if (clientVersion !== current.metadata.updatedAt) {
      return res.status(409).json({ error: 'conflict', current });
    }
  }

  const config = result.config;
  config.metadata.updatedAt = new Date().toISOString();
  await writeConfigBlob(config);

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(config);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'PUT') return handlePut(req, res);
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}
