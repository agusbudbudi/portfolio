// Thin fetch wrappers for the admin dashboard → /api endpoints.
import type { BookingConfig, BookingRulesDocument, MentorConfig, TopicsDocument } from '../types/mentoring';
import type { PortfolioData, PortfolioRecord, PortfolioStatus, PortfolioSummary, SkillsDocument, ToolsDocument } from '../types/portfolio';
import type { QaLibraryArticle, QaLibraryArticleData, QaLibraryArticleSummary, QaLibraryCategoriesDocument } from '../types/qaLibrary';

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

export interface AdminUserRecord extends AdminUser {
  createdAt: string;
  updatedAt: string;
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
  return apiGet<TopicsDocument>('/api/admin-config/topics');
}

export function apiPutTopics(
  doc: Pick<TopicsDocument, 'topics'>,
  updatedAt: string | undefined,
  token: string
): Promise<TopicsDocument> {
  return apiPut<TopicsDocument>('/api/admin-config/topics', doc, updatedAt, 'x-topics-updated-at', token);
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
  return apiGet<BookingRulesDocument>('/api/admin-config/booking-rules');
}

export function apiPutBookingRules(
  doc: Pick<BookingRulesDocument, 'metadata' | 'availableDays' | 'bookingRules'>,
  updatedAt: string | undefined,
  token: string
): Promise<BookingRulesDocument> {
  return apiPut<BookingRulesDocument>('/api/admin-config/booking-rules', doc, updatedAt, 'x-booking-rules-updated-at', token);
}

export function apiListUsers(token: string): Promise<{ users: AdminUserRecord[] }> {
  return apiGetAuth<{ users: AdminUserRecord[] }>('/api/users', token);
}

export function apiListBookings(token: string): Promise<{ bookings: BookingConfig[] }> {
  return apiGetAuth<{ bookings: BookingConfig[] }>('/api/bookings', token);
}

export function apiCreateBooking(payload: BookingConfig, token: string): Promise<BookingConfig> {
  return apiPostAuth<BookingConfig>('/api/bookings', payload, token);
}

export function apiUpdateBooking(
  id: string,
  payload: BookingConfig,
  updatedAt: string,
  token: string
): Promise<BookingConfig> {
  return apiPut<BookingConfig>(`/api/bookings/${encodeURIComponent(id)}`, payload, updatedAt, 'x-booking-updated-at', token);
}

// 404 -> [] not expected (mine.ts always 200s with an array), but keep the
// same UnauthorizedError shape as the other apiGetMy* wrappers.
export async function apiGetMyBookings(token: string): Promise<{ bookings: BookingConfig[] }> {
  const res = await fetch(`/api/bookings/mine?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

// Mentor-side counterpart — bookings assigned to the logged-in mentor.
export async function apiGetAssignedBookings(token: string): Promise<{ bookings: BookingConfig[] }> {
  const res = await fetch(`/api/bookings/assigned?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

export function apiCreateMyBooking(payload: BookingConfig, token: string): Promise<BookingConfig> {
  return apiPostAuth<BookingConfig>('/api/bookings/mine', payload, token);
}

export async function apiCheckBookingAvailability(mentorId: string, date: string): Promise<{ occupiedTimes: string[] }> {
  const params = new URLSearchParams({ mentorId, date });
  const res = await fetch(`/api/bookings/availability?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new ApiError(res.status, `Gagal cek ketersediaan (HTTP ${res.status}).`);
  return res.json();
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
  return apiGet<ToolsDocument>('/api/admin-config/tools');
}

export function apiPutTools(
  doc: Pick<ToolsDocument, 'tools'>,
  updatedAt: string | undefined,
  token: string
): Promise<ToolsDocument> {
  return apiPut<ToolsDocument>('/api/admin-config/tools', doc, updatedAt, 'x-tools-updated-at', token);
}

export function apiGetSkills(): Promise<SkillsDocument> {
  return apiGet<SkillsDocument>('/api/admin-config/skills');
}

export function apiPutSkills(
  doc: Pick<SkillsDocument, 'skills'>,
  updatedAt: string | undefined,
  token: string
): Promise<SkillsDocument> {
  return apiPut<SkillsDocument>('/api/admin-config/skills', doc, updatedAt, 'x-skills-updated-at', token);
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

// 404 -> null (no portfolio yet) rather than throwing, mirroring apiGetMyMentor.
export async function apiGetMyPortfolio(token: string): Promise<PortfolioRecord | null> {
  const res = await fetch(`/api/portfolios/mine?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

export function apiCreateMyPortfolio(payload: PortfolioWritePayload, token: string): Promise<PortfolioRecord> {
  return apiPostAuth<PortfolioRecord>('/api/portfolios/mine', payload, token);
}

// Mentor-side lookup — does this mentee (booking.menteeUserId) have a
// published portfolio/CV? 404 -> null, same not-found-is-fine pattern as
// apiGetMyPortfolio (draft portfolios also read as "nothing to show" here).
export async function apiGetPortfolioByOwner(userId: string, token: string): Promise<{ slug: string | null; cvUrl: string | null } | null> {
  const res = await fetch(`/api/portfolios/by-owner/${encodeURIComponent(userId)}?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat data (HTTP ${res.status}).`);
  return res.json();
}

export async function apiCheckSlug(slug: string, excludeId?: string): Promise<{ available: boolean }> {
  const params = new URLSearchParams({ slug });
  if (excludeId) params.set('excludeId', excludeId);
  const res = await fetch(`/api/portfolios/check-slug?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new ApiError(res.status, `Gagal cek slug (HTTP ${res.status}).`);
  return res.json();
}

export type UploadFeature = 'mentor' | 'portfolio' | 'cv' | 'tools' | 'qaLibrary';

export async function apiUploadImage(
  file: { filename: string; contentType: string; dataBase64: string; feature: UploadFeature },
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

export function apiGetQaLibraryCategories(): Promise<QaLibraryCategoriesDocument> {
  return apiGet<QaLibraryCategoriesDocument>('/api/admin-config/qa-library-categories');
}

export function apiPutQaLibraryCategories(
  doc: Pick<QaLibraryCategoriesDocument, 'categories'>,
  updatedAt: string | undefined,
  token: string
): Promise<QaLibraryCategoriesDocument> {
  return apiPut<QaLibraryCategoriesDocument>(
    '/api/admin-config/qa-library-categories', doc, updatedAt, 'x-qa-library-categories-updated-at', token
  );
}

export function apiListQaLibraryArticlesAdmin(token: string): Promise<{ articles: QaLibraryArticleSummary[] }> {
  return apiGetAuth<{ articles: QaLibraryArticleSummary[] }>('/api/qa-library/admin', token);
}

export function apiGetQaLibraryArticle(slug: string, token: string): Promise<QaLibraryArticle> {
  return apiGetAuth<QaLibraryArticle>(`/api/qa-library/${encodeURIComponent(slug)}`, token);
}

export type QaLibraryArticleWritePayload = QaLibraryArticleData & { slug: string };

export function apiCreateQaLibraryArticle(payload: QaLibraryArticleWritePayload, token: string): Promise<QaLibraryArticle> {
  return apiPostAuth<QaLibraryArticle>('/api/qa-library', payload, token);
}

export function apiUpdateQaLibraryArticle(
  currentSlug: string,
  payload: QaLibraryArticleWritePayload,
  updatedAt: string,
  token: string
): Promise<QaLibraryArticle> {
  return apiPut<QaLibraryArticle>(
    `/api/qa-library/${encodeURIComponent(currentSlug)}`, payload, updatedAt, 'x-qa-library-article-updated-at', token
  );
}

export function apiDeleteQaLibraryArticle(slug: string, token: string): Promise<void> {
  return apiDeleteAuth(`/api/qa-library/${encodeURIComponent(slug)}`, token);
}
