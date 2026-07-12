import type { VercelRequest, VercelResponse } from '@vercel/node';
import { BlobError, put } from '@vercel/blob';
import { bearerToken, verifyToken } from './_lib/auth.js';

// Admin-only file upload for the portfolio feature (profile photo, tool
// logo, project thumbnail, endorsement photo, CV). Body is base64-JSON rather
// than multipart — simplest to validate/size-cap without a form-data parser,
// and comfortably under Vercel's ~4.5MB serverless body limit at the 2MB
// pre-encode cap below.
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }
  if (!(await verifyToken(sessionSecret, bearerToken(req.headers.authorization)))) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'server_not_configured', message: 'BLOB_READ_WRITE_TOKEN env var is not set.' });
  }

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const { filename, contentType, dataBase64 } = body as { filename?: unknown; contentType?: unknown; dataBase64?: unknown };

  if (typeof filename !== 'string' || !filename.trim()) {
    return res.status(400).json({ error: 'invalid_filename' });
  }
  if (typeof contentType !== 'string' || !ALLOWED_TYPES.has(contentType)) {
    return res.status(400).json({ error: 'invalid_content_type', message: `Tipe file harus salah satu dari: ${[...ALLOWED_TYPES].join(', ')}.` });
  }
  if (typeof dataBase64 !== 'string' || !dataBase64) {
    return res.status(400).json({ error: 'invalid_data' });
  }

  const buffer = Buffer.from(dataBase64, 'base64');
  if (buffer.byteLength > MAX_BYTES) {
    return res.status(413).json({ error: 'file_too_large', message: `Ukuran file maksimal ${MAX_BYTES / (1024 * 1024)}MB.` });
  }

  try {
    const blob = await put(`portfolio/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    // Surfaces store misconfiguration (e.g. a private store rejecting
    // access: 'public') as a clean 500 instead of an uncaught throw.
    const message = err instanceof BlobError ? err.message : 'Gagal upload ke Blob storage.';
    return res.status(500).json({ error: 'blob_upload_failed', message });
  }
}
