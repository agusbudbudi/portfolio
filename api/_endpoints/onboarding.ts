import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveSession } from '../_lib/auth.js';
import {
  markSkipped,
  readLatestResult,
  readOnboardingConfig,
  readOnboardingStatus,
  saveResult,
} from '../_lib/onboardingStore.js';
import { scoreOnboarding, validateOnboardingAnswers } from '../../src/lib/onboarding.js';

// Routes:
//   GET  /api/onboarding/config  → OnboardingConfig (public; questions, weights, catalog)
//   GET  /api/onboarding/me      → { status, latest } (session)
//   POST /api/onboarding         { answers } → { status, result } (session; scored server-side)
//   POST /api/onboarding/skip    → { status } (session)

async function handleConfig(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const config = await readOnboardingConfig();
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(config);
}

async function handleMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const session = await resolveSession(req, res);
  if (!session) return;
  const [status, latest] = await Promise.all([readOnboardingStatus(session.userId), readLatestResult(session.userId)]);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ status, latest });
}

async function handleSubmit(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const session = await resolveSession(req, res);
  if (!session) return;

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const config = await readOnboardingConfig();
  const parsed = validateOnboardingAnswers(body.answers, config);
  if (!parsed.ok) return res.status(400).json({ error: 'invalid_answers', errors: parsed.errors });

  // Always scored here (never trusted from the client) so stored results are
  // consistent and auditable against the config version.
  const recommendation = scoreOnboarding(parsed.answers, config);
  const result = await saveResult(session.userId, config.version, parsed.answers, recommendation);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ status: 'completed', result });
}

async function handleSkip(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const session = await resolveSession(req, res);
  if (!session) return;
  const status = await markSkipped(session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ status });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];
  const [first] = path;

  if (!first) return handleSubmit(req, res);
  if (first === 'config') return handleConfig(req, res);
  if (first === 'me') return handleMe(req, res);
  if (first === 'skip') return handleSkip(req, res);
  return res.status(404).json({ error: 'not_found' });
}
