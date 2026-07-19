import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { resolveAdminSession } from '../_lib/auth.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

// Client-direct-to-Blob upload token route — the QA Library document field
// (PDF/PPT, can be tens of MB) uploads straight from the browser to Blob
// storage instead of through /api/upload's base64-JSON-body path, which is
// capped at 2MB to stay well under Vercel's ~4.5MB serverless body limit.
// Admin-only for now, matching the QA Library feature's current scope.
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // legacy .ppt
];
const MAX_DOC_BYTES = 50 * 1024 * 1024;
const UPLOAD_RATE_LIMIT = { maxAttempts: 20, windowMs: 60 * 60 * 1000 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await resolveAdminSession(req, res);
  if (!session) return;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'server_not_configured', message: 'BLOB_READ_WRITE_TOKEN env var is not set.' });
  }

  const allowed = await checkRateLimit(`blob-upload:${session.userId}`, UPLOAD_RATE_LIMIT.maxAttempts, UPLOAD_RATE_LIMIT.windowMs);
  if (!allowed) {
    return res.status(429).json({ error: 'rate_limited', message: 'Terlalu banyak upload. Coba lagi nanti.' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_DOC_TYPES,
        maximumSizeInBytes: MAX_DOC_BYTES,
        addRandomSuffix: true,
      }),
      // No onUploadCompleted: it needs a publicly-reachable callback URL
      // (doesn't work on localhost), and isn't needed here — the admin form
      // persists the returned blob.url via the normal authenticated
      // create/update save, same as any other field.
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(jsonResponse);
  } catch (err) {
    return res.status(400).json({
      error: 'blob_token_failed',
      message: err instanceof Error ? err.message : 'Gagal membuat token upload.',
    });
  }
}
