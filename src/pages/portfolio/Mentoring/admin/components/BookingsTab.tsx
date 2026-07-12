import React, { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { useAdminConfigStore } from '../../../../../store/useAdminConfigStore';
import { useAdminBookingsStore } from '../../../../../store/useAdminBookingsStore';
import type { BookingConfig, BookingStatus } from '../../../../../types/mentoring';
import { formatDateLabel, parseDateId } from '../../../../../lib/dates';
import { usePagination } from '../../../../../hooks/usePagination';
import { sortByUpdatedAtDesc } from '../../../../../lib/sortByUpdatedAt';
import LoadingState from '../../../../../components/portfolio/common/LoadingState';
import AdminBookingForm from './AdminBookingForm';
import Pagination from './Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';

const STATUS_BADGE: Record<BookingStatus, string> = {
  booked: 'bg-sky-50 text-sky-600 border-sky-200',
  confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  completed: 'bg-ld-cloud text-ld-slate border-ld-frost',
  canceled: 'bg-red-50 text-red-500 border-red-200',
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  booked: 'Booked',
  confirmed: 'Confirmed',
  completed: 'Completed',
  canceled: 'Canceled',
};

// Statuses that occupy a mentor's slot — canceled frees it up, matching the
// server-side conflict check in validateBookings.
const OCCUPYING_STATUSES: BookingStatus[] = ['booked', 'confirmed', 'completed'];

const BookingsTab: React.FC = () => {
  const { topics, mentors, bookingRules } = useAdminConfigStore();
  const {
    bookings, loading, loadError, load, upsertBooking, transitionBooking,
  } = useAdminBookingsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BookingConfig | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);
  const sorted = sortByUpdatedAtDesc(bookings);
  const { page, setPage, totalPages, pageItems: pagedBookings } = usePagination(sorted);

  useEffect(() => {
    load();
  }, [load]);

  const mentorName = (id: string) => mentors.find((m) => m.id === id)?.name ?? id;
  const topicLabels = (ids: string[]) => ids.map((id) => topics.find((t) => t.id === id)?.label ?? id).join(', ');

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (booking: BookingConfig) => { setEditing(booking); setFormOpen(true); };

  const handleTransition = async (booking: BookingConfig, newStatus: BookingStatus) => {
    setActionError(null);
    if (newStatus === 'canceled' && !window.confirm(`Batalkan booking "${booking.menteeName}"?`)) return;
    setTransitioningId(booking.id);
    const result = await transitionBooking(booking.id, newStatus);
    setTransitioningId(null);
    if (!result.ok) setActionError(result.reason ?? 'Gagal mengubah status booking.');
  };

  if (loading) {
    return (
      <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY}`}>
        <LoadingState label="Memuat bookings…" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY}`}>
        <p className="text-sm text-red-500 m-0">{loadError}</p>
      </div>
    );
  }

  if (formOpen) {
    const occupiedSlots = new Map<string, string>();
    bookings.forEach((b) => {
      if (OCCUPYING_STATUSES.includes(b.status)) occupiedSlots.set(`${b.mentorId}|${b.date}|${b.time}`, b.id);
    });
    return (
      <AdminBookingForm
        onClose={() => setFormOpen(false)}
        onSubmit={upsertBooking}
        booking={editing}
        mentors={mentors}
        topics={topics}
        maxTopicsSelectable={bookingRules.maxTopicsSelectable}
        sessionDurationMinutes={bookingRules.sessionDurationMinutes}
        occupiedSlots={occupiedSlots}
      />
    );
  }

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Bookings</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{bookings.length} booking dibuat dari admin.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Booking
        </button>
      </div>

      <div className={ADMIN_CARD_BODY}>
        {actionError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{actionError}</p>
        )}

        <div className="overflow-x-auto border border-ld-frost rounded-xl">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-ld-cloud text-left">
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Mentee</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Mentor</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel">Topic</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Jadwal</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedBookings.map((booking) => (
                <tr key={booking.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <button
                      onClick={() => openEdit(booking)}
                      className="text-xs font-mono text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0"
                      aria-label={`Lihat detail booking ${booking.id}`}
                    >
                      {booking.id}
                    </button>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="min-w-[160px]">
                      <span className="block text-sm font-medium text-ld-onyx">{booking.menteeName}</span>
                      <p className="text-xs text-ld-fog m-0 mt-0.5">{booking.menteeEmail}</p>
                      <p className="text-xs text-ld-fog m-0">{booking.menteeWhatsapp}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-ld-slate whitespace-nowrap">{mentorName(booking.mentorId)}</td>
                  <td className="px-4 py-3 align-top text-xs text-ld-fog">
                    <span className="min-w-[160px] block">{topicLabels(booking.topics)}</span>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-ld-slate whitespace-nowrap">
                    {formatDateLabel(parseDateId(booking.date))}<br />{booking.time} WIB
                  </td>
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-widest ${STATUS_BADGE[booking.status]}`}>
                      {STATUS_LABEL[booking.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {booking.status === 'booked' && (
                        <button
                          onClick={() => handleTransition(booking, 'confirmed')}
                          disabled={transitioningId === booking.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 cursor-pointer border border-emerald-200 bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleTransition(booking, 'completed')}
                          disabled={transitioningId === booking.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-ld-slate hover:bg-ld-cloud cursor-pointer border border-ld-frost bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Complete
                        </button>
                      )}
                      {(booking.status === 'booked' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleTransition(booking, 'canceled')}
                          disabled={transitioningId === booking.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 cursor-pointer border border-red-200 bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(booking)}
                        disabled={transitioningId === booking.id}
                        className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Edit booking ${booking.menteeName}`}
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-ld-fog">Belum ada booking.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} totalItems={sorted.length} pageSize={10} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default BookingsTab;
