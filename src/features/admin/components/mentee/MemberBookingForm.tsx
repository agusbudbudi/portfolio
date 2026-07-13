import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, MessageCircle, Phone, User } from 'lucide-react';
import type { BookingConfig, MentorConfig, TopicConfig } from '../../../../types/mentoring';
import { getAvailableDates } from '../../../../lib/dates';
import { generateWhatsAppLink } from '../../../../lib/whatsapp';
import { apiCheckBookingAvailability } from '../../../../lib/adminApi';
import DateField from '../../../mentoring/components/booking/DateField';
import TimeField from '../../../mentoring/components/booking/TimeField';
import IntroField from '../../../mentoring/components/booking/IntroField';
import TopicsSelect from '../superadmin/TopicsSelect';
import MentorSelect from '../mentor/MentorSelect';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';

// Self-serve counterpart to AdminBookingForm — same field components, but
// (a) respects the real public booking window (daysInAdvanceMin/Max +
// availableDays) instead of admin's flat 120-day bypass, and (b) checks live
// slot availability against the DB (api/bookings/availability.ts) instead of
// a locally-loaded full bookings list (mentee has no access to that, it's PII).
interface MemberBookingFormProps {
  onClose: () => void;
  onSubmit: (booking: BookingConfig) => Promise<{ ok: boolean; reason?: string }>;
  mentors: MentorConfig[];
  topics: TopicConfig[];
  maxTopicsSelectable: number;
  sessionDurationMinutes: number;
  availableDays: string[];
  daysInAdvanceMin: number;
  daysInAdvanceMax: number;
  menteeName?: string;
  menteeEmail?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^\d{8,15}$/;

// M[yyyymmdd][3 random alphanumeric chars] — mirrors AdminBookingForm's
// generateBookingId, duplicated here since both forms need it independently.
function generateBookingId(): string {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 3; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `M${ymd}${suffix}`;
}

function emptyBooking(menteeName: string, menteeEmail: string): BookingConfig {
  const now = new Date().toISOString();
  return {
    id: generateBookingId(),
    menteeName,
    menteeEmail,
    menteeWhatsapp: '',
    topics: [],
    mentorId: '',
    date: '',
    time: '',
    notes: '',
    status: 'booked',
    createdAt: now,
    updatedAt: now,
  };
}

type FieldErrors = Partial<Record<
  'menteeName' | 'menteeEmail' | 'menteeWhatsapp' | 'topics' | 'date' | 'mentorId' | 'time' | 'introduction',
  string
>>;

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const MemberBookingForm: React.FC<MemberBookingFormProps> = ({
  onClose, onSubmit, mentors, topics, maxTopicsSelectable, sessionDurationMinutes,
  availableDays, daysInAdvanceMin, daysInAdvanceMax, menteeName = '', menteeEmail = '',
}) => {
  const [form, setForm] = useState<BookingConfig>(() => emptyBooking(menteeName, menteeEmail));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [occupiedTimes, setOccupiedTimes] = useState<Set<string>>(new Set());
  const clearError = (key: keyof FieldErrors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const selectedMentor = mentors.find((m) => m.id === form.mentorId) ?? null;

  const availableDates = useMemo(
    () => getAvailableDates(availableDays, mentors, daysInAdvanceMin, daysInAdvanceMax),
    [availableDays, mentors, daysInAdvanceMin, daysInAdvanceMax]
  );

  // Live slot check against the DB — debounced, re-runs whenever mentor or
  // date changes. No local "full bookings list" to derive this from, unlike
  // AdminBookingForm — that list is admin-only (mentee PII). Skips the fetch
  // (rather than synchronously clearing state) when mentor/date isn't picked
  // yet; the render below only applies occupiedTimes once both are set.
  useEffect(() => {
    if (!form.mentorId || !form.date) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { occupiedTimes: taken } = await apiCheckBookingAvailability(form.mentorId, form.date);
        if (!cancelled) setOccupiedTimes(new Set(taken));
      } catch {
        if (!cancelled) setOccupiedTimes(new Set());
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [form.mentorId, form.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!form.menteeName.trim()) next.menteeName = 'Nama wajib diisi.';
    if (!EMAIL_RE.test(form.menteeEmail)) next.menteeEmail = 'Email tidak valid.';
    if (!WHATSAPP_RE.test(form.menteeWhatsapp)) next.menteeWhatsapp = 'WhatsApp harus 8-15 digit angka, tanpa + (contoh: 6281234567890).';
    if (form.topics.length === 0) next.topics = 'Pilih minimal satu topic.';
    if (!form.mentorId) next.mentorId = 'Pilih mentor.';
    if (!form.date) next.date = 'Pilih tanggal.';
    if (!form.time) next.time = 'Pilih jam.';
    if (!form.notes.trim()) next.introduction = 'Detail materi & pendekatan diskusi wajib diisi.';

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSaving(true);
    const result = await onSubmit({ ...form, updatedAt: new Date().toISOString() });
    setSaving(false);
    if (!result.ok) {
      setSubmitError(result.reason ?? 'Gagal menyimpan booking.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    const whatsappLink = selectedMentor
      ? generateWhatsAppLink({
          mentorPhone: selectedMentor.whatsapp,
          mentorName: selectedMentor.name,
          dateId: form.date,
          time: form.time,
          topics: form.topics.map((id) => topics.find((t) => t.id === id)?.label ?? id),
          introduction: form.notes,
          sessionDurationMinutes,
        })
      : null;
    return (
      <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY} text-center py-10`}>
        <CheckCircle2 size={32} className="text-green-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-ld-onyx m-0 mb-1">Booking berhasil dibuat</p>
        <p className="text-xs text-ld-fog m-0 mb-6">Mentor akan konfirmasi jadwal sesi kamu.</p>
        <div className="flex items-center justify-center gap-2">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium no-underline transition-colors"
            >
              <MessageCircle size={15} /> Chat Mentor via WhatsApp
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-ld-frost bg-white text-sm font-medium text-ld-graphite cursor-pointer hover:bg-ld-cloud transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={ADMIN_CARD}>
      <div className={ADMIN_CARD_HEADER}>
        <button
          onClick={onClose}
          className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft size={17} />
        </button>
        <h2 className="text-sm font-semibold text-ld-onyx m-0">Booking Mentoring</h2>
      </div>

      <form onSubmit={handleSubmit} noValidate className={`${ADMIN_CARD_BODY} w-full`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col">
            <div className="px-5 py-2.5 bg-ld-cloud border border-b-0 border-ld-frost rounded-t-xl">
              <p className="text-[10px] font-medium tracking-widest uppercase text-ld-violet m-0">Sesi &amp; Jadwal</p>
            </div>
            <div className="rounded-b-xl border border-ld-frost p-4 md:p-5 bg-white flex flex-col gap-4">
              <TopicsSelect
                topics={topics}
                selected={form.topics}
                maxSelectable={maxTopicsSelectable}
                onChange={(t) => { setForm({ ...form, topics: t }); clearError('topics'); }}
                error={errors.topics ?? null}
              />
              <MentorSelect
                mentors={mentors}
                topics={topics}
                value={form.mentorId}
                onChange={(id) => { setForm({ ...form, mentorId: id, time: '' }); clearError('mentorId'); clearError('time'); }}
                error={errors.mentorId ?? null}
              />
              <DateField
                availableDateIds={availableDates}
                value={form.date}
                onChange={(d) => { setForm({ ...form, date: d, time: '' }); clearError('date'); clearError('time'); }}
                error={errors.date ?? null}
              />
              <TimeField
                mentor={selectedMentor}
                selectedDate={form.date}
                sessionDurationMinutes={sessionDurationMinutes}
                value={form.time}
                onChange={(t) => { setForm({ ...form, time: t }); clearError('time'); }}
                error={errors.time ?? null}
                excludeSlotValues={occupiedTimes}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="px-5 py-2.5 bg-ld-cloud border border-b-0 border-ld-frost rounded-t-xl">
              <p className="text-[10px] font-medium tracking-widest uppercase text-ld-violet m-0">Informasi Kamu</p>
            </div>
            <div className="rounded-b-xl border border-ld-frost p-4 md:p-5 bg-white flex flex-col gap-4">
              <label className="block">
                <span className="flex items-center gap-1.5 text-sm font-medium text-ld-graphite mb-1.5">
                  <User size={14} className="text-ld-violet" /> Nama
                </span>
                <input
                  type="text"
                  value={form.menteeName}
                  onChange={(e) => { setForm({ ...form, menteeName: e.target.value }); clearError('menteeName'); }}
                  className={inputClass}
                />
                {errors.menteeName && <p className="text-xs text-red-500 mt-1.5">{errors.menteeName}</p>}
              </label>

              <label className="block">
                <span className="flex items-center gap-1.5 text-sm font-medium text-ld-graphite mb-1.5">
                  <Mail size={14} className="text-ld-violet" /> Email
                </span>
                <input
                  type="email"
                  value={form.menteeEmail}
                  readOnly
                  disabled
                  className={`${inputClass} bg-ld-cloud text-ld-slate cursor-not-allowed`}
                />
                <p className="text-[11px] text-ld-fog mt-1.5">Email akun kamu, tidak bisa diubah.</p>
                {errors.menteeEmail && <p className="text-xs text-red-500 mt-1.5">{errors.menteeEmail}</p>}
              </label>

              <label className="block">
                <span className="flex items-center gap-1.5 text-sm font-medium text-ld-graphite mb-1.5">
                  <Phone size={14} className="text-ld-violet" /> WhatsApp Number
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6281234567890"
                  value={form.menteeWhatsapp}
                  onChange={(e) => { setForm({ ...form, menteeWhatsapp: e.target.value.replace(/\D/g, '') }); clearError('menteeWhatsapp'); }}
                  className={inputClass}
                />
                {errors.menteeWhatsapp && <p className="text-xs text-red-500 mt-1.5">{errors.menteeWhatsapp}</p>}
              </label>

              <IntroField
                value={form.notes}
                onChange={(v) => { setForm({ ...form, notes: v }); clearError('introduction'); }}
                error={errors.introduction ?? null}
              />
            </div>
          </div>
        </div>

        {submitError && <p className="text-sm text-red-500 mt-6 mb-0">{submitError}</p>}

        <div className="flex justify-end gap-2 mt-6 pt-5 border-t border-ld-frost/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan…' : 'Booking Sekarang'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberBookingForm;
