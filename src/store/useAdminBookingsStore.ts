import { create } from 'zustand';
import type { BookingConfig, BookingStatus } from '../types/mentoring';
import {
  apiCreateBooking, apiListBookings, apiUpdateBooking, ApiError, ConflictError, UnauthorizedError,
} from '../lib/adminApi';
import { ALLOWED_BOOKING_TRANSITIONS } from '../lib/configValidation';
import { useAdminAuthStore } from './useAdminAuthStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export type ActionResult = { ok: boolean; reason?: string };

interface AdminBookingsState {
  bookings: BookingConfig[];
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  create: (booking: BookingConfig) => Promise<ActionResult>;
  update: (id: string, booking: BookingConfig) => Promise<ActionResult>;
  transitionBooking: (bookingId: string, newStatus: BookingStatus) => Promise<ActionResult>;
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminBookingsStore = create<AdminBookingsState>((set, get) => ({
  bookings: [],
  loading: true,
  loadError: null,

  load: () => dedupeInFlight(loadRef, async () => {
    const token = useAdminAuthStore.getState().token;
    if (!token) {
      useAdminAuthStore.getState().logout();
      return;
    }
    set({ loading: true, loadError: null });
    try {
      const { bookings } = await apiListBookings(token);
      set({ bookings: deepCopy(bookings) });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        useAdminAuthStore.getState().logout();
        return;
      }
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat bookings.' });
    } finally {
      set({ loading: false });
    }
  }),

  create: async (booking) => {
    const token = useAdminAuthStore.getState().token;
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      const saved = await apiCreateBooking(booking, token);
      set({ bookings: [saved, ...get().bookings] });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal membuat booking.' };
    }
  },

  update: async (id, booking) => {
    const token = useAdminAuthStore.getState().token;
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    const expectedUpdatedAt = get().bookings.find((b) => b.id === id)?.updatedAt;
    if (!expectedUpdatedAt) return { ok: false, reason: 'Booking tidak ditemukan.' };
    try {
      const saved = await apiUpdateBooking(id, booking, expectedUpdatedAt, token);
      set({ bookings: get().bookings.map((b) => (b.id === id ? saved : b)) });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ConflictError) {
        const current = err.current as BookingConfig;
        set({ bookings: get().bookings.map((b) => (b.id === id ? current : b)) });
        return { ok: false, reason: 'Booking ini berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
      }
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan booking.' };
    }
  },

  transitionBooking: async (bookingId, newStatus) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (!booking) return { ok: false, reason: 'Booking tidak ditemukan.' };
    if (!ALLOWED_BOOKING_TRANSITIONS[booking.status].includes(newStatus)) {
      return { ok: false, reason: `Booking dengan status "${booking.status}" tidak bisa diubah ke "${newStatus}".` };
    }
    return get().update(bookingId, { ...booking, status: newStatus, updatedAt: new Date().toISOString() });
  },
}));
