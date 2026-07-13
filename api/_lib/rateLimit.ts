// Fixed-window request counter backed by Turso — throttles scripted abuse of
// low-volume self-serve actions (e.g. mentor applications). Not exact under
// heavy concurrency (read-then-write, no row lock), but that's an acceptable
// trade-off for an action real users only ever trigger a handful of times.
import { getClient, migrate } from './turso.js';

export async function checkRateLimit(key: string, maxAttempts: number, windowMs: number): Promise<boolean> {
  await migrate();
  const db = getClient();
  const now = Date.now();

  const result = await db.execute({ sql: 'SELECT count, window_start FROM rate_limits WHERE key = ?', args: [key] });
  const row = result.rows[0];
  const windowExpired = !row || now - new Date(row.window_start as string).getTime() > windowMs;

  if (windowExpired) {
    await db.execute({
      sql: `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
            ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start`,
      args: [key, new Date(now).toISOString()],
    });
    return true;
  }

  if (Number(row.count) >= maxAttempts) return false;

  await db.execute({ sql: 'UPDATE rate_limits SET count = count + 1 WHERE key = ?', args: [key] });
  return true;
}
