// New-user onboarding: questionnaire/catalog config + per-user results.
// Config is a whole-document row in config_documents (key 'onboarding'),
// falling back to the bundled default until an admin saves one — same
// pattern as the mentoring config. Results are append-only (one row per
// submission, latest wins) so retakes keep history.
import { randomUUID } from 'node:crypto';
import { getClient, migrate } from './turso.js';
import { toOnboardingStatus } from './userStore.js';
import {
  DEFAULT_ONBOARDING_CONFIG,
  ONBOARDING_CONFIG_KEY,
  isOnboardingConfig,
} from '../../src/lib/onboarding.js';
import type {
  OnboardingAnswers,
  OnboardingConfig,
  OnboardingRecommendation,
  OnboardingResultRecord,
  OnboardingStatus,
} from '../../src/types/onboarding.js';

export async function readOnboardingConfig(): Promise<OnboardingConfig> {
  await migrate();
  const result = await getClient().execute({
    sql: 'SELECT data, updated_at FROM config_documents WHERE key = ?',
    args: [ONBOARDING_CONFIG_KEY],
  });
  const row = result.rows[0];
  if (!row) return DEFAULT_ONBOARDING_CONFIG;
  try {
    const data: unknown = JSON.parse(row.data as string);
    if (!isOnboardingConfig(data)) return DEFAULT_ONBOARDING_CONFIG;
    // A saved config older than the bundled matrix (e.g. a v2 row without
    // QA Course) is stale: serve the new default until an admin saves again.
    if (data.version < DEFAULT_ONBOARDING_CONFIG.version) return DEFAULT_ONBOARDING_CONFIG;
    return { ...data, updatedAt: (row.updated_at as string | null) ?? undefined };
  } catch {
    return DEFAULT_ONBOARDING_CONFIG;
  }
}

export async function readOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  await migrate();
  const result = await getClient().execute({ sql: 'SELECT onboarding_status FROM users WHERE id = ?', args: [userId] });
  return toOnboardingStatus(result.rows[0]?.onboarding_status);
}

function toRecord(row: Record<string, unknown>): OnboardingResultRecord {
  return {
    id: row.id as string,
    questionnaireVersion: Number(row.questionnaire_version),
    answers: JSON.parse(row.answers as string) as OnboardingAnswers,
    recommendation: JSON.parse(row.recommendation as string) as OnboardingRecommendation,
    createdAt: row.created_at as string,
  };
}

export async function readLatestResult(userId: string): Promise<OnboardingResultRecord | null> {
  await migrate();
  const result = await getClient().execute({
    sql: `SELECT id, questionnaire_version, answers, recommendation, created_at
          FROM user_onboarding WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
    args: [userId],
  });
  const row = result.rows[0];
  return row ? toRecord(row as unknown as Record<string, unknown>) : null;
}

// Result row + status flip in one batch so a user never ends up "completed"
// without a stored result (or vice versa).
export async function saveResult(
  userId: string,
  version: number,
  answers: OnboardingAnswers,
  recommendation: OnboardingRecommendation
): Promise<OnboardingResultRecord> {
  await migrate();
  const id = randomUUID();
  const now = new Date().toISOString();
  await getClient().batch(
    [
      {
        sql: `INSERT INTO user_onboarding
                (id, user_id, questionnaire_version, answers, scores, primary_program, secondary_programs, recommendation, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          id, userId, version,
          JSON.stringify(answers),
          JSON.stringify(recommendation.scores),
          recommendation.primary.id,
          JSON.stringify(recommendation.secondary.map((p) => p.id)),
          JSON.stringify(recommendation),
          now,
        ],
      },
      {
        sql: `UPDATE users SET onboarding_status = 'completed', onboarding_completed_at = ?, updated_at = ? WHERE id = ?`,
        args: [now, now, userId],
      },
    ],
    'write'
  );
  return { id, questionnaireVersion: version, answers, recommendation, createdAt: now };
}

// Only a still-pending user moves to 'skipped' — skipping must never
// downgrade someone who already completed (e.g. a second open tab).
export async function markSkipped(userId: string): Promise<OnboardingStatus> {
  await migrate();
  const now = new Date().toISOString();
  const result = await getClient().execute({
    sql: `UPDATE users SET onboarding_status = 'skipped', onboarding_completed_at = ?, updated_at = ?
          WHERE id = ? AND onboarding_status = 'pending'
          RETURNING onboarding_status`,
    args: [now, now, userId],
  });
  // No row returned = the user wasn't pending (already completed/skipped):
  // report their current status instead.
  return result.rows[0] ? 'skipped' : readOnboardingStatus(userId);
}
