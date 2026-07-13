import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminSession } from '../_lib/auth.js';
import { listUsers } from '../_lib/userStore.js';

// User records carry PII (email, name, avatar) — admin-only, same gate as bookings.ts.
async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;
  const users = await listUsers();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  res.setHeader('Allow', 'GET');
  return res.status(405).json({ error: 'method_not_allowed' });
}
