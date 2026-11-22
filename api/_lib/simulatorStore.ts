// QA Simulator progress — one whole-document row per (user, project). The
// learner is the only writer of their own row, so last-write-wins is fine
// (no compare-and-swap like config_documents).
import { getClient, migrate } from './turso.js';
import type { ProjectProgress, ProjectProgressRecord, PublicSimulatorPortfolio } from '../../src/types/qaSimulator.js';

function toRecord(row: Record<string, unknown>): ProjectProgressRecord {
  return {
    projectId: row.project_id as string,
    data: JSON.parse(row.data as string) as ProjectProgress,
    updatedAt: row.updated_at as string,
    shareId: (row.share_id as string | null) ?? null,
  };
}

// Drafts stay private even when the portfolio is shared: only submitted
// assignments are served publicly.
function submittedOnly(data: ProjectProgress): ProjectProgress {
  const assignments = Object.fromEntries(
    Object.entries(data.assignments).filter(([, a]) => a.status === 'submitted')
  );
  return { ...data, assignments };
}

function toPublic(row: Record<string, unknown>): PublicSimulatorPortfolio {
  return {
    projectId: row.project_id as string,
    shareId: row.share_id as string,
    data: submittedOnly(JSON.parse(row.data as string) as ProjectProgress),
    updatedAt: row.updated_at as string,
    owner: {
      name: (row.owner_name as string | null) ?? 'QA Engineer',
      avatarUrl: (row.owner_avatar_url as string | null) ?? undefined,
    },
  };
}

const SHARE_ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const SHARE_ID_PATTERN = /^[A-Za-z0-9]{10}$/;

// 10 chars from a 56-symbol alphabet (no 0/O/1/l/I look-alikes) ≈ 58 bits —
// unguessable for a link that only exposes practice work.
function newShareId(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => SHARE_ID_ALPHABET[b % SHARE_ID_ALPHABET.length]).join('');
}

export async function listProgress(userId: string): Promise<ProjectProgressRecord[]> {
  await migrate();
  const result = await getClient().execute({
    sql: 'SELECT project_id, data, updated_at, share_id FROM qa_simulator_progress WHERE user_id = ? ORDER BY updated_at DESC',
    args: [userId],
  });
  return result.rows.map((row) => toRecord(row as unknown as Record<string, unknown>));
}

export async function readProgress(userId: string, projectId: string): Promise<ProjectProgressRecord | null> {
  await migrate();
  const result = await getClient().execute({
    sql: 'SELECT project_id, data, updated_at, share_id FROM qa_simulator_progress WHERE user_id = ? AND project_id = ?',
    args: [userId, projectId],
  });
  const row = result.rows[0];
  return row ? toRecord(row as unknown as Record<string, unknown>) : null;
}

export async function writeProgress(userId: string, projectId: string, data: ProjectProgress): Promise<ProjectProgressRecord> {
  await migrate();
  const now = new Date().toISOString();
  // share_id is untouched on update, so saving progress never changes or
  // revokes an existing share link.
  const result = await getClient().execute({
    sql: `INSERT INTO qa_simulator_progress (user_id, project_id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(user_id, project_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
          RETURNING share_id`,
    args: [userId, projectId, JSON.stringify(data), now, now],
  });
  const shareId = (result.rows[0]?.share_id as string | null | undefined) ?? null;
  return { projectId, data, updatedAt: now, shareId };
}

/**
 * Turn the public share link on or off. On = keep the existing token if
 * there is one (idempotent), otherwise mint a new one. Off = clear it, so the
 * old link 404s and turning it on again yields a different link.
 * Returns null when the user has no progress row for this project.
 */
export async function setShare(userId: string, projectId: string, enabled: boolean): Promise<ProjectProgressRecord | null> {
  const existing = await readProgress(userId, projectId);
  if (!existing) return null;
  if (enabled && existing.shareId) return existing;

  const shareId = enabled ? newShareId() : null;
  await getClient().execute({
    sql: 'UPDATE qa_simulator_progress SET share_id = ? WHERE user_id = ? AND project_id = ?',
    args: [shareId, userId, projectId],
  });
  return { ...existing, shareId };
}

/** The shared portfolio plus its owner's user id (server-side only, never sent). */
export async function readPublicByShareId(shareId: string): Promise<{ portfolio: PublicSimulatorPortfolio; ownerId: string } | null> {
  await migrate();
  const result = await getClient().execute({
    sql: `SELECT p.user_id, p.project_id, p.data, p.updated_at, p.share_id, u.name AS owner_name, u.avatar_url AS owner_avatar_url
          FROM qa_simulator_progress p LEFT JOIN users u ON u.id = p.user_id
          WHERE p.share_id = ?`,
    args: [shareId],
  });
  const row = result.rows[0];
  if (!row) return null;
  return { portfolio: toPublic(row as unknown as Record<string, unknown>), ownerId: row.user_id as string };
}

/** Shared (share_id set) projects of one user, limited to `projectIds`, in that order. */
export async function listPublicForOwner(userId: string, projectIds: string[]): Promise<PublicSimulatorPortfolio[]> {
  if (projectIds.length === 0) return [];
  await migrate();
  const placeholders = projectIds.map(() => '?').join(', ');
  const result = await getClient().execute({
    sql: `SELECT p.project_id, p.data, p.updated_at, p.share_id, u.name AS owner_name, u.avatar_url AS owner_avatar_url
          FROM qa_simulator_progress p LEFT JOIN users u ON u.id = p.user_id
          WHERE p.user_id = ? AND p.share_id IS NOT NULL AND p.project_id IN (${placeholders})`,
    args: [userId, ...projectIds],
  });
  const byId = new Map(result.rows.map((row) => {
    const item = toPublic(row as unknown as Record<string, unknown>);
    return [item.projectId, item] as const;
  }));
  return projectIds.map((id) => byId.get(id)).filter((p): p is PublicSimulatorPortfolio => Boolean(p));
}
