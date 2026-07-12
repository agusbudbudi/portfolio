import { create } from 'zustand';
import type { BookingConfig, BookingStatus } from '../types/mentoring';
import {
  apiGetBookings, apiPutBookings, ConflictError, UnauthorizedError,
} from '../lib/adminApi';
import { validateBookings } from '../lib/configValidation';
import { useAdminAuthStore } from './useAdminAuthStore';
import { useAdminConfigStore } from './useAdminConfigStore';
import { useAdminMentorStore } from './useAdminMentorStore';

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export type ActionResult = { ok: boolean; reason?: string };

// One-way state machine — a booking can only move forward (or to canceled).
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  booked: ['confirmed', 'canceled'],
  confirmed: ['completed', 'canceled'],
  completed: [],
  canceled: [],
};

interface AdminBookingsState {
  bookings: BookingConfig[];
  bookingsUpdatedAt?: string;
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  upsertBooking: (booking: BookingConfig) => Promise<ActionResult>;
  transitionBooking: (bookingId: string, newStatus: BookingStatus) => Promise<ActionResult>;
}

// Validates + PUTs the full bookings array immediately. On conflict, resyncs
// local state to the server's current doc (returned by the API on 409) so
// the next action starts from fresh data instead of requiring a manual reload.
async function commitBookings(
  set: (partial: Partial<AdminBookingsState>) => void,
  get: () => AdminBookingsState,
  bookings: BookingConfig[]
): Promise<ActionResult> {
  const { topics } = useAdminConfigStore.getState();
  const { mentors } = useAdminMentorStore.getState();
  const validMentorIds = new Set(mentors.map((m) => m.id));
  const validTopicIds = new Set(topics.map((t) => t.id));
  const result = validateBookings({ bookings }, validMentorIds, validTopicIds);
  if (!result.ok) return { ok: false, reason: result.errors.join(' ') };

  const token = useAdminAuthStore.getState().token;
  if (!token) {
    useAdminAuthStore.getState().logout();
    return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
  }

  try {
    const saved = await apiPutBookings({ bookings: result.bookings }, get().bookingsUpdatedAt, token);
    set({ bookings: deepCopy(saved.bookings), bookingsUpdatedAt: saved.updatedAt });
    return { ok: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      useAdminAuthStore.getState().logout();
      return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    }
    if (err instanceof ConflictError) {
      const current = err.current as { bookings: BookingConfig[]; updatedAt: string };
      set({ bookings: deepCopy(current.bookings), bookingsUpdatedAt: current.updatedAt });
      return { ok: false, reason: 'Bookings berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
    }
    return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan booking.' };
  }
}

export const useAdminBookingsStore = create<AdminBookingsState>((set, get) => ({
  bookings: [],
  bookingsUpdatedAt: undefined,
  loading: true,
  loadError: null,

  load: async () => {
    const token = useAdminAuthStore.getState().token;
    if (!token) {
      useAdminAuthStore.getState().logout();
      return;
    }
    set({ loading: true, loadError: null });
    try {
      const doc = await apiGetBookings(token);
      set({
        bookings: deepCopy(doc.bookings),
        bookingsUpdatedAt: doc.updatedAt,
      });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        useAdminAuthStore.getState().logout();
        return;
      }
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat bookings.' });
    } finally {
      set({ loading: false });
    }
  },

  upsertBooking: async (booking) => {
    const bookings = deepCopy(get().bookings);
    const idx = bookings.findIndex((b) => b.id === booking.id);
    if (idx >= 0) bookings[idx] = booking;
    else bookings.push(booking);
    return commitBookings(set, get, bookings);
  },

  transitionBooking: async (bookingId, newStatus) => {
    const bookings = deepCopy(get().bookings);
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { ok: false, reason: 'Booking tidak ditemukan.' };
    if (!ALLOWED_TRANSITIONS[booking.status].includes(newStatus)) {
      return { ok: false, reason: `Booking dengan status "${booking.status}" tidak bisa diubah ke "${newStatus}".` };
    }
    booking.status = newStatus;
    booking.updatedAt = new Date().toISOString();
    return commitBookings(set, get, bookings);
  },
}));
