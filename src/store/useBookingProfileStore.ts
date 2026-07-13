import { create } from 'zustand';
import type { BookingConfig } from '../types/mentoring';
import {
  apiCreateMyBooking, apiGetMyBookings, apiUpdateBooking, ApiError, UnauthorizedError,
} from '../lib/adminApi';
import { useAdminAuthStore } from './useAdminAuthStore';

export type ActionResult = { ok: boolean; reason?: string };

// Self-serve counterpart to useAdminBookingsStore — "my own bookings,"
// scoped to whoever is currently logged in. Create + cancel only — a
// mentee can't reschedule or confirm/complete their own booking (that's
// mentor/admin territory), server-enforced in api/bookings/[id].ts.
interface BookingProfileState {
  bookings: BookingConfig[];
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  create: (booking: BookingConfig) => Promise<ActionResult>;
  cancel: (bookingId: string) => Promise<ActionResult>;
}

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

export const useBookingProfileStore = create<BookingProfileState>((set, get) => ({
  bookings: [],
  loading: true,
  loadError: null,

  load: async () => {
    const token = requireToken();
    if (!token) return;
    set({ loading: true, loadError: null });
    try {
      const { bookings } = await apiGetMyBookings(token);
      set({ bookings });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat booking.' });
    } finally {
      set({ loading: false });
    }
  },

  create: async (booking) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    try {
      await apiCreateMyBooking(booking, token);
      await get().load();
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal membuat booking.' };
    }
  },

  cancel: async (bookingId) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (!booking) return { ok: false, reason: 'Booking tidak ditemukan.' };
    try {
      const saved = await apiUpdateBooking(
        bookingId,
        { ...booking, status: 'canceled', updatedAt: new Date().toISOString() },
        booking.updatedAt,
        token
      );
      set({ bookings: get().bookings.map((b) => (b.id === bookingId ? saved : b)) });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal membatalkan booking.' };
    }
  },
}));
