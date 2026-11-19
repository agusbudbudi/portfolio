import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveSession } from '../_lib/auth.js';
import { listProgress, readProgress, writeProgress } from '../_lib/simulatorStore.js';
import { SIMULATOR_ID_PATTERN, validateProjectProgress } from '../../src/lib/qaSimulatorValidation.js';

// Routes (all scoped to the logged-in user — a learner only ever sees their
// own progress; there's no admin/mentor view yet):
//   GET /api/simulator/progress              → { items: ProjectProgressRecord[] }
//   GET /api/simulator/progress/:projectId   → ProjectProgressRecord | 404
//   PUT /api/simulator/progress/:projectId   { data: ProjectProgress } → ProjectProgressRecord

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];
  const [first, second] = path;

  if (first === 'progress' && !second) return handleList(req, res);
  if (first === 'progress' && second) return handleProject(req, res, second);
  return res.status(404).json({ error: 'not_found' });
}
