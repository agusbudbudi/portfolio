import { ApiError, UnauthorizedError } from '../../../lib/adminApi';
import type { ProjectProgress, ProjectProgressRecord, SimulatorIndex, SimulatorProject } from '../../../types/qaSimulator';

const CONFIG_BASE = '/qa-simulator/config';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

export function fetchSimulatorIndex(): Promise<SimulatorIndex> {
  return fetchJson<SimulatorIndex>(`${CONFIG_BASE}/index.json`);
}

export function fetchSimulatorProject(projectId: string): Promise<SimulatorProject> {
  if (!/^[a-z0-9-]+$/.test(projectId)) return Promise.reject(new ApiError(404, 'Project tidak ditemukan.'));
  return fetchJson<SimulatorProject>(`${CONFIG_BASE}/${projectId}.json`);
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function apiListSimulatorProgress(token: string): Promise<ProjectProgressRecord[]> {
  const res = await fetch(`/api/simulator/progress?t=${Date.now()}`, { cache: 'no-store', headers: authHeaders(token) });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat progress (HTTP ${res.status}).`);
  const body = (await res.json()) as { items: ProjectProgressRecord[] };
  return body.items;
}

export async function apiGetSimulatorProgress(projectId: string, token: string): Promise<ProjectProgressRecord | null> {
  const res = await fetch(`/api/simulator/progress/${encodeURIComponent(projectId)}?t=${Date.now()}`, {
    cache: 'no-store',
    headers: authHeaders(token),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat progress (HTTP ${res.status}).`);
  return res.json();
}

export async function apiPutSimulatorProgress(projectId: string, data: ProjectProgress, token: string): Promise<ProjectProgressRecord> {
  const res = await fetch(`/api/simulator/progress/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ data }),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, `Gagal menyimpan progress (HTTP ${res.status}).`, body.errors);
  }
  return res.json();
}
