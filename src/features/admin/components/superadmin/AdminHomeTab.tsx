import React, { useEffect, useMemo } from 'react';
import { ArrowRight, CalendarCheck, CalendarDays, Clock, Trophy, UserSquare2, Users } from 'lucide-react';
import { useAdminBookingsStore } from '../../../../store/useAdminBookingsStore';
import { useAdminMentorStore } from '../../../../store/useAdminMentorStore';
import { useAdminPortfolioStore } from '../../../../store/useAdminPortfolioStore';
import { formatDateId, formatDateLabel, parseDateId } from '../../../../lib/dates';
import LoadingState from '../../../../components/common/LoadingState';
import type { BookingConfig, BookingStatus } from '../../../../types/mentoring';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';
import StatTile from '../shared/StatTile';
import BookingTrendChart from './BookingTrendChart';

const BOOKING_STATUS_TONE: Record<BookingStatus, StatusBadgeTone> = {
  booked: 'sky',
  confirmed: 'emerald',
  completed: 'slate',
  canceled: 'red',
};

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  booked: 'Booked',
  confirmed: 'Confirmed',
  completed: 'Completed',
  canceled: 'Canceled',
};

const TREND_DAYS = 14;

/** Count of bookings created on each of the last N local days, oldest → newest. */
function buildDailyTrend(bookings: BookingConfig[], days: number): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const booking of bookings) {
    const key = formatDateId(new Date(booking.createdAt));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = formatDateId(d);
    return { date: key, count: counts.get(key) ?? 0 };
  });
}

/** Bookings created within [daysAgoStart, daysAgoEnd) of today, e.g. (7, 0) = last 7 days. */
function countCreatedInWindow(bookings: BookingConfig[], daysAgoStart: number, daysAgoEnd: number): number {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const from = now - daysAgoStart * dayMs;
  const to = now - daysAgoEnd * dayMs;
  return bookings.filter((b) => {
    const t = new Date(b.createdAt).getTime();
    return t >= from && t < to;
  }).length;
}

function percentDelta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

interface AdminHomeTabProps {
  onNavigate: (id: 'bookings' | 'mentors' | 'portfolios') => void;
}

const AdminHomeTab: React.FC<AdminHomeTabProps> = ({ onNavigate }) => {
  const { bookings, loading: bookingsLoading, load: loadBookings } = useAdminBookingsStore();
  const { mentors, loading: mentorsLoading } = useAdminMentorStore();
  const { portfolios, load: loadPortfolios } = useAdminPortfolioStore();

  useEffect(() => { loadBookings(); loadPortfolios(); }, [loadBookings, loadPortfolios]);

  const bookingCounts: Record<BookingStatus, number> = {
    booked: bookings.filter((b) => b.status === 'booked').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    canceled: bookings.filter((b) => b.status === 'canceled').length,
  };

  const mentorStatusOf = (m: (typeof mentors)[number]) => m.verificationStatus ?? 'verified';
  const pendingMentors = mentors.filter((m) => mentorStatusOf(m) === 'pending').length;
  const verifiedMentors = mentors.filter((m) => mentorStatusOf(m) === 'verified').length;
  const rejectedMentors = mentors.filter((m) => mentorStatusOf(m) === 'rejected').length;

  const publishedPortfolios = portfolios.filter((p) => p.status === 'published').length;
  const draftPortfolios = portfolios.filter((p) => p.status === 'draft').length;

  const recentBookings = [...bookings]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const trend = useMemo(() => buildDailyTrend(bookings, TREND_DAYS), [bookings]);

  const last7 = countCreatedInWindow(bookings, 7, 0);
  const prev7 = countCreatedInWindow(bookings, 14, 7);

  const todayId = formatDateId(new Date());
  const todaySessions = bookings.filter((b) => b.date === todayId && b.status !== 'canceled').length;

  const topMentors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bookings) {
      if (b.status === 'canceled') continue;
      counts.set(b.mentorId, (counts.get(b.mentorId) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mentorId, count]) => ({
        mentorId,
        count,
        name: mentors.find((m) => m.id === mentorId)?.name ?? mentorId,
      }));
  }, [bookings, mentors]);

  const publishRate = portfolios.length > 0 ? Math.round((publishedPortfolios / portfolios.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={CalendarCheck}
          tone="violet"
          label="Booking (7 hari terakhir)"
          value={last7}
          delta={{ percent: percentDelta(last7, prev7), caption: 'vs 7 hari sebelumnya' }}
        />
        <StatTile
          icon={CalendarDays}
          tone="sky"
          label="Sesi hari ini"
          value={todaySessions}
        />
        <StatTile
          icon={Users}
          tone="amber"
          label="Mentor menunggu review"
          value={pendingMentors}
        />
        <StatTile
          icon={UserSquare2}
          tone="emerald"
          label="Portfolio published"
          value={`${publishRate}%`}
          breakdown={[
            { label: 'total', value: portfolios.length },
            { label: 'published', value: publishedPortfolios },
            { label: 'draft', value: draftPortfolios },
          ]}
          onViewAll={() => onNavigate('portfolios')}
        />
      </div>

      <div className={ADMIN_CARD}>
        <div className={ADMIN_CARD_HEADER}>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Tren Booking · {TREND_DAYS} Hari Terakhir</h2>
        </div>
        <div className={`${ADMIN_CARD_BODY} pt-2`}>
          {bookingsLoading ? <LoadingState label="Memuat tren booking…" /> : <BookingTrendChart data={trend} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className={ADMIN_CARD}>
          <div className={`${ADMIN_CARD_HEADER} justify-between`}>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Bookings</h2>
            <button
              onClick={() => onNavigate('bookings')}
              className="inline-flex items-center gap-1 text-xs font-medium text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0"
            >
              Lihat semua <ArrowRight size={12} />
            </button>
          </div>
          <div className={ADMIN_CARD_BODY}>
            {bookingsLoading ? (
              <LoadingState label="Memuat bookings…" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {(['booked', 'confirmed', 'completed', 'canceled'] as BookingStatus[]).map((status) => (
                  <div key={status} className="rounded-xl border border-ld-frost/70 p-3.5">
                    <p className="m-0 text-2xl font-semibold text-ld-onyx tabular-nums">{bookingCounts[status]}</p>
                    <StatusBadge tone={BOOKING_STATUS_TONE[status]} className="mt-1.5">
                      {BOOKING_STATUS_LABEL[status]}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={ADMIN_CARD}>
          <div className={`${ADMIN_CARD_HEADER} justify-between`}>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Mentor</h2>
            <button
              onClick={() => onNavigate('mentors')}
              className="inline-flex items-center gap-1 text-xs font-medium text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0"
            >
              Lihat semua <ArrowRight size={12} />
            </button>
          </div>
          <div className={ADMIN_CARD_BODY}>
            {mentorsLoading ? (
              <LoadingState label="Memuat mentors…" />
            ) : (
              <div>
                {pendingMentors > 0 && (
                  <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-amber-500 shrink-0" />
                      <p className="m-0 text-sm font-medium text-amber-700">
                        {pendingMentors} aplikasi menunggu review
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('mentors')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium cursor-pointer border-none transition-colors shrink-0"
                    >
                      Review
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl border border-ld-frost/70 p-3.5">
                    <p className="m-0 text-2xl font-semibold text-ld-onyx tabular-nums">{verifiedMentors}</p>
                    <p className="m-0 text-xs text-ld-fog mt-0.5">Verified</p>
                  </div>
                  <div className="rounded-xl border border-ld-frost/70 p-3.5">
                    <p className="m-0 text-2xl font-semibold text-ld-onyx tabular-nums">{rejectedMentors}</p>
                    <p className="m-0 text-xs text-ld-fog mt-0.5">Rejected</p>
                  </div>
                </div>

                {topMentors.length > 0 && (
                  <div className="pt-4 border-t border-ld-frost/70">
                    <p className="flex items-center gap-1.5 m-0 text-xs font-medium text-ld-fog mb-2.5">
                      <Trophy size={13} className="text-amber-500" /> Mentor paling aktif
                    </p>
                    <div className="space-y-2">
                      {topMentors.map((m, i) => (
                        <div key={m.mentorId} className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-ld-cloud text-ld-slate text-[10px] font-semibold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <p className="m-0 text-sm text-ld-graphite truncate flex-1 min-w-0">{m.name}</p>
                          <p className="m-0 text-xs text-ld-fog tabular-nums shrink-0">{m.count} sesi</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={ADMIN_CARD}>
        <div className={`${ADMIN_CARD_HEADER} justify-between`}>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Booking Terbaru</h2>
          <button
            onClick={() => onNavigate('bookings')}
            className="inline-flex items-center gap-1 text-xs font-medium text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0"
          >
            Lihat semua <ArrowRight size={12} />
          </button>
        </div>
        <div className={ADMIN_CARD_BODY}>
          {bookingsLoading ? (
            <LoadingState label="Memuat bookings…" />
          ) : recentBookings.length === 0 ? (
            <p className="text-sm text-ld-fog m-0">Belum ada booking.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentBookings.map((booking) => {
                const mentor = mentors.find((m) => m.id === booking.mentorId);
                return (
                  <div key={booking.id} className="rounded-xl border border-ld-frost/70 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <CalendarCheck size={14} className="text-ld-violet shrink-0" />
                        <span className="text-sm font-medium text-ld-graphite truncate uppercase">{booking.id}</span>
                        <StatusBadge tone={BOOKING_STATUS_TONE[booking.status]} className="shrink-0">
                          {BOOKING_STATUS_LABEL[booking.status]}
                        </StatusBadge>
                      </div>
                      <span className="text-xs text-ld-fog shrink-0">
                        {formatDateLabel(parseDateId(booking.date))} · {booking.time} WIB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <img
                        src={mentor?.avatar || '/admin/img/default-avatar-mentor.webp'}
                        alt=""
                        className="w-5 h-5 rounded-md object-cover border border-ld-frost shrink-0"
                      />
                      <p className="m-0 text-xs text-ld-slate truncate">
                        {mentor?.name ?? booking.mentorId}
                        <span className="text-ld-fog"> | Mentee: {booking.menteeName}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHomeTab;
