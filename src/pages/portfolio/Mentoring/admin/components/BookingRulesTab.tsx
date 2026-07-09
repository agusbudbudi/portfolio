import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { WEEKDAYS } from '../../../../../types/mentoring';
import { useAdminConfigStore } from '../../../../../store/useAdminConfigStore';

const DAY_LABELS: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

const RULE_FIELDS = [
  { key: 'minIntroductionLength', label: 'Min. panjang introduction (karakter)' },
  { key: 'maxTopicsSelectable', label: 'Maks. topic yang bisa dipilih' },
  { key: 'sessionDurationMinutes', label: 'Durasi sesi (menit)' },
  { key: 'daysInAdvanceMin', label: 'Booking paling cepat (hari ke depan)' },
  { key: 'daysInAdvanceMax', label: 'Booking paling jauh (hari ke depan)' },
] as const;

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-ash bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const BookingRulesTab: React.FC = () => {
  const {
    mentors, availableDays, bookingRules: rules, metadata,
    setBookingRules, setMetadata, toggleAvailableDay,
  } = useAdminConfigStore();

  // Days disabled for booking while some mentor still has schedule slots on them.
  const orphanedDays = WEEKDAYS.filter(
    (day) =>
      !availableDays.includes(day) &&
      mentors.some((m) => (m.schedule[day]?.length ?? 0) > 0)
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-1">Available Days</h2>
        <p className="text-xs text-ld-fog m-0 mb-3">Hari yang bisa dipilih user di form booking.</p>

        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => {
            const active = availableDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleAvailableDay(day)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium cursor-pointer border transition-colors ${
                  active
                    ? 'bg-ld-lilac/60 text-ld-violet border-ld-lavender'
                    : 'bg-ld-cloud text-ld-slate border-transparent hover:bg-white hover:border-ld-ash hover:text-ld-graphite'
                }`}
              >
                {active && <Check size={14} className="shrink-0" />}
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>

        {availableDays.length === 0 && (
          <p className="mt-4 text-sm text-red-500 m-0">Minimal satu hari harus aktif — config tidak akan bisa disimpan.</p>
        )}

        {orphanedDays.length > 0 && (
          <p className="mt-4 flex items-start gap-2 text-xs text-amber-600 m-0">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            {orphanedDays.map((d) => DAY_LABELS[d]).join(', ')} nonaktif tapi masih ada mentor dengan jadwal di hari itu.
            Slot tersebut tidak akan muncul di form booking.
          </p>
        )}
      </section>

      <section className="pt-6 border-t border-ld-ash/60">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-3">Booking Rules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RULE_FIELDS.map(({ key, label }) => (
            <label key={key} className="block">
              <span className="block text-xs font-medium text-ld-graphite mb-1.5">{label}</span>
              <input
                type="number"
                min={1}
                value={rules[key]}
                onChange={(e) => setBookingRules({ ...rules, [key]: Number(e.target.value) })}
                className={inputClass}
              />
            </label>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-ld-ash/60">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-3">Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Timezone</span>
            <input
              type="text"
              value={metadata.timezone}
              onChange={(e) => setMetadata({ ...metadata, timezone: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Singkatan timezone</span>
            <input
              type="text"
              value={metadata.timezone_abbr}
              onChange={(e) => setMetadata({ ...metadata, timezone_abbr: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Versi config</span>
            <input
              type="text"
              value={metadata.version}
              onChange={(e) => setMetadata({ ...metadata, version: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>
      </section>
    </div>
  );
};

export default BookingRulesTab;
