import React, { useMemo, useState } from 'react';
import { ArrowLeft, User, Mail, Phone } from 'lucide-react';
import { WEEKDAYS, type BookingConfig, type MentorConfig, type TopicConfig } from '../../../../../types/mentoring';
import { getAvailableDates } from '../../../../../lib/dates';
import DateField from '../../components/DateField';
import TimeField from '../../components/TimeField';
import IntroField from '../../components/IntroField';
import TopicsSelect from './TopicsSelect';
import MentorSelect from './MentorSelect';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';

// Rendered conditionally by BookingsTab so form state re-initializes from
// props on every open — no reset effect needed.
interface AdminBookingFormProps {
  onClose: () => void;
  onSubmit: (booking: BookingConfig) => Promise<{ ok: boolean; reason?: string }>;
  booking: BookingConfig | null; // null = create
  mentors: MentorConfig[];
  topics: TopicConfig[];
  maxTopicsSelectable: number;
  sessionDurationMinutes: number;
  // mentorId|date|time -> booking id occupying that slot (excludes canceled).
  occupiedSlots: Map<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^\d{8,15}$/;
// Admin bookings bypass the public daysInAdvanceMin/Max window — this is a
// generous flat lookahead just to keep the calendar navigable.
const DATE_LOOKAHEAD_DAYS = 120;

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

function emptyBooking(): BookingConfig {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    menteeName: '',
    menteeEmail: '',
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

const AdminBookingForm: React.FC<AdminBookingFormProps> = ({
  onClose, onSubmit, booking, mentors, topics, maxTopicsSelectable, sessionDurationMinutes, occupiedSlots,
}) => {
  const isEdit = booking !== null;
  const [form, setForm] = useState<BookingConfig>(booking ?? emptyBooking());
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const clearError = (key: keyof FieldErrors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const selectedMentor = mentors.find((m) => m.id === form.mentorId) ?? null;

  // Any date within the lookahead window that at least one mentor works —
  // mirrors the public DateField's availability model, minus the
  // availableDays/daysInAdvanceMin/Max booking-window restriction (admin
  // books freely, so all 7 weekdays are in play).
  const availableDates = useMemo(
    () => getAvailableDates([...WEEKDAYS], mentors, 0, DATE_LOOKAHEAD_DAYS),
    [mentors]
  );

  const takenTimes = useMemo(() => {
    if (!form.mentorId || !form.date) return new Set<string>();
    const taken = new Set<string>();
    occupiedSlots.forEach((bookingId, key) => {
      const [mentorId, date, time] = key.split('|');
      if (mentorId === form.mentorId && date === form.date && bookingId !== form.id) taken.add(time);
    });
    return taken;
  }, [occupiedSlots, form.mentorId, form.date, form.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!form.menteeName.trim()) next.menteeName = 'Nama mentee wajib diisi.';
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
    onClose();
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={ADMIN_CARD_HEADER}>
        <button
          onClick={onClose}
          className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
          aria-label="Kembali ke daftar booking"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ld-onyx m-0">
            {isEdit ? 'Edit Booking' : 'Tambah Booking'}
          </h2>
          {isEdit && <p className="text-xs text-ld-fog m-0">{booking.menteeName}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className={`${ADMIN_CARD_BODY} w-full`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* LEFT: topic/mentor/date/time */}
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
                excludeSlotValues={takenTimes}
              />
            </div>
          </div>

          {/* RIGHT: mentee info + notes */}
          <div className="flex flex-col">
            <div className="px-5 py-2.5 bg-ld-cloud border border-b-0 border-ld-frost rounded-t-xl">
              <p className="text-[10px] font-medium tracking-widest uppercase text-ld-violet m-0">Informasi Mentee</p>
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
                  onChange={(e) => { setForm({ ...form, menteeEmail: e.target.value }); clearError('menteeEmail'); }}
                  className={inputClass}
                />
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
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Booking' : 'Tambah Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBookingForm;
