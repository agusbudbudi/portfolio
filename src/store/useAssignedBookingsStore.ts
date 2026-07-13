import { create } from 'zustand';
import type { BookingConfig, BookingStatus } from '../types/mentoring';
import {
  apiGetAssignedBookings, apiUpdateBooking, ApiError, UnauthorizedError,
} from '../lib/adminApi';
import { ALLOWED_BOOKING_TRANSITIONS } from '../lib/configValidation';
import { useAdminAuthStore } from './useAdminAuthStore';

export type ActionResult = { ok: boolean; reason?: string };

// Mentor-side counterpart to useAdminBookingsStore — bookings assigned to
// whoever is currently logged in (resolved server-side via their own mentor
// record, see api/bookings/assigned.ts). Status-transition only: the server
// (api/bookings/[id].ts) rejects any other field change for a non-admin
// caller, so there's no separate "edit" action here.
interface AssignedBookingsState {
  bookings: BookingConfig[];
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  transition: (bookingId: string, newStatus: BookingStatus) => Promise<ActionResult>;
}

function requireToken(): string | null {
  const token = useAdminAuthStore.getState().token;
  if (!token) useAdminAuthStore.getState().logout();
  return token;
}

export const useAssignedBookingsStore = create<AssignedBookingsState>((set, get) => ({
  bookings: [],
  loading: true,
  loadError: null,

  load: async () => {
    const token = requireToken();
    if (!token) return;
    set({ loading: true, loadError: null });
    try {
      const { bookings } = await apiGetAssignedBookings(token);
      set({ bookings });
    } catch (err) {
      if (err instanceof UnauthorizedError) return;
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat booking.' });
    } finally {
      set({ loading: false });
    }
  },

  transition: async (bookingId, newStatus) => {
    const token = requireToken();
    if (!token) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (!booking) return { ok: false, reason: 'Booking tidak ditemukan.' };
    if (!ALLOWED_BOOKING_TRANSITIONS[booking.status].includes(newStatus)) {
      return { ok: false, reason: `Booking dengan status "${booking.status}" tidak bisa diubah ke "${newStatus}".` };
    }
    try {
      const saved = await apiUpdateBooking(
        bookingId,
        { ...booking, status: newStatus, updatedAt: new Date().toISOString() },
        booking.updatedAt,
        token
      );
      set({ bookings: get().bookings.map((b) => (b.id === bookingId ? saved : b)) });
      return { ok: true };
    } catch (err) {
      if (err instanceof UnauthorizedError) return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
      if (err instanceof ApiError && err.errors?.length) return { ok: false, reason: err.errors.join(' ') };
      return { ok: false, reason: err instanceof Error ? err.message : 'Gagal mengubah status booking.' };
    }
  },
}));
