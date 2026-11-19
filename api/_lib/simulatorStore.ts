// QA Simulator progress — one whole-document row per (user, project). The
// learner is the only writer of their own row, so last-write-wins is fine
// (no compare-and-swap like config_documents).
import { getClient, migrate } from './turso.js';
import type { ProjectProgress, ProjectProgressRecord } from '../../src/types/qaSimulator.js';

function toRecord(row: Record<string, unknown>): ProjectProgressRecord {
  return {
    projectId: row.project_id as string,
    data: JSON.parse(row.data as string) as ProjectProgress,
    updatedAt: row.updated_at as string,
  };
}

export async function listProgress(userId: string): Promise<ProjectProgressRecord[]> {
  await migrate();
  const result = await getClient().execute({
    sql: 'SELECT project_id, data, updated_at FROM qa_simulator_progress WHERE user_id = ? ORDER BY updated_at DESC',
    args: [userId],
  });
  return result.rows.map((row) => toRecord(row as unknown as Record<string, unknown>));
}

export async function readProgress(userId: string, projectId: string): Promise<ProjectProgressRecord | null> {
  await migrate();
  const result = await getClient().execute({
    sql: 'SELECT project_id, data, updated_at FROM qa_simulator_progress WHERE user_id = ? AND project_id = ?',
    args: [userId, projectId],
  });
  const row = result.rows[0];
  return row ? toRecord(row as unknown as Record<string, unknown>) : null;
}

export async function writeProgress(userId: string, projectId: string, data: ProjectProgress): Promise<ProjectProgressRecord> {
  await migrate();
  const now = new Date().toISOString();
  await getClient().execute({
    sql: `INSERT INTO qa_simulator_progress (user_id, project_id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(user_id, project_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [userId, projectId, JSON.stringify(data), now, now],
  });
  return { projectId, data, updatedAt: now };
}
