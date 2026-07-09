// Read/write the mentoring config document in Vercel Blob.
// Stable pathname (no random suffix) so head() can find it and writes overwrite in place.
import { head, put } from '@vercel/blob';
import type { MentoringConfig } from '../../src/types/mentoring';

const PATHNAME = 'mentoring/config.json';

export async function readConfigBlob(): Promise<MentoringConfig | null> {
  try {
    const meta = await head(PATHNAME);
    // cache: 'no-store' bypasses the Blob CDN so admins always read their latest write.
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as MentoringConfig;
  } catch {
    return null; // BlobNotFoundError (not seeded yet) or network failure
  }
}

export async function writeConfigBlob(config: MentoringConfig): Promise<void> {
  await put(PATHNAME, JSON.stringify(config, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}
