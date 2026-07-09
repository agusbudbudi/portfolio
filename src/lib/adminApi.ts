// Thin fetch wrappers for the admin dashboard → /api endpoints.
import type { MentoringConfig } from '../types/mentoring';

export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError extends Error {
  current: MentoringConfig;
  constructor(current: MentoringConfig) {
    super('conflict');
    this.name = 'ConflictError';
    this.current = current;
  }
}

export class ApiError extends Error {
  status: number;
  errors?: string[];
  constructor(status: number, message: string, errors?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiLogin(password: string): Promise<{ token: string; expiresAt: number }> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Login gagal (HTTP ${res.status}).`);
  return res.json();
}

export async function apiGetConfig(): Promise<MentoringConfig> {
  const res = await fetch(`/api/config?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat config (HTTP ${res.status}).`);
  return res.json();
}

export async function apiPutConfig(
  config: MentoringConfig,
  updatedAt: string | undefined,
  token: string
): Promise<MentoringConfig> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (updatedAt) headers['x-config-updated-at'] = updatedAt;

  const res = await fetch('/api/config', {
    method: 'PUT',
    headers,
    body: JSON.stringify(config),
  });

  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 409) {
    const body = await res.json();
    throw new ConflictError(body.current as MentoringConfig);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, `Gagal menyimpan config (HTTP ${res.status}).`, body?.errors);
  }
  return res.json();
}
