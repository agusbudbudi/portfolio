// Resolve an article author to a registered user, the same snapshot the admin
// form's author picker stores (authorUserId + name + avatar at save time).
import { listUsers } from '../../api/_lib/userStore.js';

/** Default author for course content: Agus Budiman's users.id. */
export const DEFAULT_AUTHOR_ID = '5104244e-8f70-4161-a43a-cbd7ae8e16c9';

export interface ResolvedAuthor {
  authorName: string;
  authorUserId: string;
  authorAvatarUrl?: string;
}

export async function resolveAuthor(userId: string = DEFAULT_AUTHOR_ID): Promise<ResolvedAuthor> {
  const u = (await listUsers()).find((x) => x.id === userId.trim());
  if (!u) throw new Error(`User dengan id "${userId}" tidak ditemukan di tabel users.`);
  return { authorName: u.name, authorUserId: u.id, authorAvatarUrl: u.avatarUrl ?? undefined };
}
