// Thin fetch wrappers for the admin dashboard → /api endpoints.
import type { BookingRulesDocument, BookingsDocument, MentorConfig, TopicsDocument } from '../types/mentoring';
import type { PortfolioData, PortfolioRecord, PortfolioStatus, PortfolioSummary, ToolsDocument } from '../types/portfolio';

export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'UnauthorizedError';
  }
}

export class ConflictError<T = unknown> extends Error {
  current: T;
  constructor(current: T) {
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

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roles: string[];
}

export async function apiLogin(credential: string): Promise<{ token: string; expiresAt: number; user: AdminUser }> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Login gagal (HTTP ${res.status}).`);
  return res.json();
}

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

// Bookings contain mentee PII, so unlike the other resources its GET also
// requires the admin session token.
async function apiGetAuth<T>(url: string, token: string): Promise<T> {
  const res = await fetch(`${url}?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

async function apiPut<T>(
  url: string,
  body: unknown,
  updatedAt: string | undefined,
  updatedAtHeader: string,
  token: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (updatedAt) headers[updatedAtHeader] = updatedAt;

  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });

  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 409) {
    const body = await res.json();
    throw new ConflictError<T>(body.current as T);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, `Gagal menyimpan (HTTP ${res.status}).`, body?.errors);
  }
  return res.json();
}

export function apiGetTopics(): Promise<TopicsDocument> {
  return apiGet<TopicsDocument>('/api/topics');
}

export function apiPutTopics(
  doc: Pick<TopicsDocument, 'topics'>,
  updatedAt: string | undefined,
  token: string
): Promise<TopicsDocument> {
  return apiPut<TopicsDocument>('/api/topics', doc, updatedAt, 'x-topics-updated-at', token);
}

export type MentorWritePayload = Omit<MentorConfig, 'updatedAt'>;

// Optional token: admin sees every verification status, everyone else
// (including no token) only sees verified mentors — see api/mentors.ts.
export async function apiListMentors(token?: string): Promise<{ mentors: MentorConfig[] }> {
  const res = await fetch(`/api/mentors?t=${Date.now()}`, {
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

export function apiCreateMentor(payload: MentorWritePayload, token: string): Promise<MentorConfig> {
  return apiPostAuth<MentorConfig>('/api/mentors', payload, token);
}

export function apiUpdateMentor(
  id: string,
  payload: MentorWritePayload,
  updatedAt: string,
  token: string
): Promise<MentorConfig> {
  return apiPut<MentorConfig>(`/api/mentors/${encodeURIComponent(id)}`, payload, updatedAt, 'x-mentor-updated-at', token);
}

export function apiDeleteMentor(id: string, token: string): Promise<void> {
  return apiDeleteAuth(`/api/mentors/${encodeURIComponent(id)}`, token);
}

// 404 -> null (no application yet) rather than throwing, since "not applied"
// is an expected, normal state for this endpoint, not an error.
export async function apiGetMyMentor(token: string): Promise<MentorConfig | null> {
  const res = await fetch(`/api/mentors/me?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

export function apiApplyMentor(payload: MentorWritePayload, token: string): Promise<MentorConfig> {
  return apiPostAuth<MentorConfig>('/api/mentors/apply', payload, token);
}

export function apiReviewMentor(
  id: string,
  decision: 'verified' | 'rejected',
  rejectionReason: string | null,
  token: string
): Promise<MentorConfig> {
  return apiPostAuth<MentorConfig>(`/api/mentors/${encodeURIComponent(id)}/review`, { decision, rejectionReason }, token);
}

export function apiGetBookingRules(): Promise<BookingRulesDocument> {
  return apiGet<BookingRulesDocument>('/api/booking-rules');
}

export function apiPutBookingRules(
  doc: Pick<BookingRulesDocument, 'metadata' | 'availableDays' | 'bookingRules'>,
  updatedAt: string | undefined,
  token: string
): Promise<BookingRulesDocument> {
  return apiPut<BookingRulesDocument>('/api/booking-rules', doc, updatedAt, 'x-booking-rules-updated-at', token);
}

export function apiGetBookings(token: string): Promise<BookingsDocument> {
  return apiGetAuth<BookingsDocument>('/api/bookings', token);
}

export function apiPutBookings(
  doc: Pick<BookingsDocument, 'bookings'>,
  updatedAt: string | undefined,
  token: string
): Promise<BookingsDocument> {
  return apiPut<BookingsDocument>('/api/bookings', doc, updatedAt, 'x-bookings-updated-at', token);
}

// POST endpoints (create, upload) don't have an optimistic-concurrency
// "current doc" to resync from — a 409 here means a plain conflict (e.g.
// slug already taken), surfaced as ApiError with its error messages, not
// ConflictError (that's reserved for CAS version conflicts on PUT).
async function apiPostAuth<T>(url: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) {
    const resBody = await res.json().catch(() => null);
    throw new ApiError(res.status, resBody?.message ?? `Gagal menyimpan (HTTP ${res.status}).`, resBody?.errors);
  }
  return res.json();
}

async function apiDeleteAuth(url: string, token: string): Promise<void> {
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok && res.status !== 204) {
    const resBody = await res.json().catch(() => null);
    throw new ApiError(res.status, resBody?.message ?? `Gagal menghapus (HTTP ${res.status}).`);
  }
}

export function apiGetTools(): Promise<ToolsDocument> {
  return apiGet<ToolsDocument>('/api/tools');
}

export function apiPutTools(
  doc: Pick<ToolsDocument, 'tools'>,
  updatedAt: string | undefined,
  token: string
): Promise<ToolsDocument> {
  return apiPut<ToolsDocument>('/api/tools', doc, updatedAt, 'x-tools-updated-at', token);
}

export function apiListPortfolios(token: string): Promise<{ portfolios: PortfolioSummary[] }> {
  return apiGetAuth<{ portfolios: PortfolioSummary[] }>('/api/portfolios', token);
}

export function apiGetPortfolio(slug: string, token: string): Promise<PortfolioRecord> {
  return apiGetAuth<PortfolioRecord>(`/api/portfolios/${encodeURIComponent(slug)}`, token);
}

export interface PortfolioWritePayload {
  slug: string;
  status: PortfolioStatus;
  data: PortfolioData;
}

export function apiCreatePortfolio(payload: PortfolioWritePayload, token: string): Promise<PortfolioRecord> {
  return apiPostAuth<PortfolioRecord>('/api/portfolios', payload, token);
}

export function apiUpdatePortfolio(
  currentSlug: string,
  payload: PortfolioWritePayload,
  updatedAt: string,
  token: string
): Promise<PortfolioRecord> {
  return apiPut<PortfolioRecord>(`/api/portfolios/${encodeURIComponent(currentSlug)}`, payload, updatedAt, 'x-portfolio-updated-at', token);
}

export function apiDeletePortfolio(slug: string, token: string): Promise<void> {
  return apiDeleteAuth(`/api/portfolios/${encodeURIComponent(slug)}`, token);
}

export async function apiCheckSlug(slug: string, excludeId?: string): Promise<{ available: boolean }> {
  const params = new URLSearchParams({ slug });
  if (excludeId) params.set('excludeId', excludeId);
  const res = await fetch(`/api/portfolios/check-slug?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new ApiError(res.status, `Gagal cek slug (HTTP ${res.status}).`);
  return res.json();
}

export async function apiUploadImage(
  file: { filename: string; contentType: string; dataBase64: string },
  token: string
): Promise<{ url: string }> {
  return apiPostAuth<{ url: string }>('/api/upload', file, token);
}

export interface ArticleMetadata {
  title?: string;
  description?: string;
  thumbnail?: string;
  source?: string;
}

export function apiFetchArticleMetadata(url: string, token: string): Promise<ArticleMetadata> {
  return apiPostAuth<ArticleMetadata>('/api/article-metadata', { url }, token);
}
