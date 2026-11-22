import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveSession } from '../_lib/auth.js';
import {
  SHARE_ID_PATTERN, listProgress, readProgress, readPublicByShareId, setShare, writeProgress,
} from '../_lib/simulatorStore.js';
import { SIMULATOR_ID_PATTERN, validateProjectProgress } from '../../src/lib/qaSimulatorValidation.js';
import { coursesForProjectWithProgress } from '../_lib/qaCourseStore.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

// Routes. Progress routes are scoped to the logged-in user (a learner only
// ever sees their own progress; there's no admin/mentor view yet):
//   GET /api/simulator/progress                  → { items: ProjectProgressRecord[] }
//   GET /api/simulator/progress/:projectId       → ProjectProgressRecord | 404
//   PUT /api/simulator/progress/:projectId       { data: ProjectProgress } → ProjectProgressRecord
//   PUT /api/simulator/progress/:projectId/share { enabled: boolean } → ProjectProgressRecord | 404
// Public, no auth (only for a share link the owner turned on):
//   GET /api/simulator/public/:shareId           → PublicSimulatorPortfolio | 404

async function handleList(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const session = await resolveSession(req, res);
  if (!session) return;

  const items = await listProgress(session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ items });
}

async function handleProject(req: VercelRequest, res: VercelResponse, projectId: string) {
  if (!SIMULATOR_ID_PATTERN.test(projectId)) return res.status(400).json({ error: 'invalid_project_id' });

  if (req.method === 'GET') {
    const session = await resolveSession(req, res);
    if (!session) return;
    const record = await readProgress(session.userId, projectId);
    res.setHeader('Cache-Control', 'no-store');
    if (!record) return res.status(404).json({ error: 'not_found' });
    return res.status(200).json(record);
  }

  if (req.method === 'PUT') {
    const session = await resolveSession(req, res);
    if (!session) return;
    const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
    const result = validateProjectProgress(body.data);
    if (!result.ok) return res.status(400).json({ error: 'invalid_progress', errors: result.errors });

    const record = await writeProgress(session.userId, projectId, result.data);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(record);
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}

async function handleShare(req: VercelRequest, res: VercelResponse, projectId: string) {
  if (!SIMULATOR_ID_PATTERN.test(projectId)) return res.status(400).json({ error: 'invalid_project_id' });
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const session = await resolveSession(req, res);
  if (!session) return;
  // Each "on" mints a new token: cap toggling so links can't be churned.
  if (!(await checkRateLimit(`simulator-share:${session.userId}`, 20, 60 * 60_000))) {
    return res.status(429).json({ error: 'rate_limited', message: 'Terlalu sering mengubah link share. Coba lagi nanti.' });
  }
  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  if (typeof body.enabled !== 'boolean') return res.status(400).json({ error: 'invalid_body', errors: ['enabled: wajib boolean.'] });

  const record = await setShare(session.userId, projectId, body.enabled);
  res.setHeader('Cache-Control', 'no-store');
  if (!record) return res.status(404).json({ error: 'not_found' });
  return res.status(200).json(record);
}

async function handlePublic(req: VercelRequest, res: VercelResponse, shareId: string) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!SHARE_ID_PATTERN.test(shareId)) return res.status(404).json({ error: 'not_found' });
  const found = await readPublicByShareId(shareId);
  if (!found) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(404).json({ error: 'not_found' });
  }
  // Courses practicing on this project, with the owner's article progress,
  // for the portfolio's "QA Course" tab (completion is derived client-side).
  const courses = await coursesForProjectWithProgress(found.ownerId, found.portfolio.projectId);
  // Very short edge cache so a revoked link stops serving within ~10s.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10');
  return res.status(200).json({ ...found.portfolio, courses });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];
  const [first, second, third] = path;

  if (first === 'progress' && !second) return handleList(req, res);
  if (first === 'progress' && second && third === 'share' && path.length === 3) return handleShare(req, res, second);
  if (first === 'progress' && second && path.length === 2) return handleProject(req, res, second);
  if (first === 'public' && second && path.length === 2) return handlePublic(req, res, second);
  return res.status(404).json({ error: 'not_found' });
}
