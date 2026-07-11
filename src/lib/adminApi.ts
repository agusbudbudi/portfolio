// Thin fetch wrappers for the admin dashboard → /api endpoints.
import type { BookingRulesDocument, BookingsDocument, MentorsDocument, TopicsDocument } from '../types/mentoring';

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

export function apiGetMentors(): Promise<MentorsDocument> {
  return apiGet<MentorsDocument>('/api/mentors');
}

export function apiPutMentors(
  doc: Pick<MentorsDocument, 'mentors'>,
  updatedAt: string | undefined,
  token: string
): Promise<MentorsDocument> {
  return apiPut<MentorsDocument>('/api/mentors', doc, updatedAt, 'x-mentors-updated-at', token);
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
