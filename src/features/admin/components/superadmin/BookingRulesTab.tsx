import React from 'react';
import { AlertTriangle, Check, RotateCcw, Save } from 'lucide-react';
import { WEEKDAYS } from '../../../../types/mentoring';
import { useAdminConfigStore } from '../../../../store/useAdminConfigStore';
import { useAdminMentorStore } from '../../../../store/useAdminMentorStore';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';

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
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const BookingRulesTab: React.FC = () => {
  const {
    availableDays, bookingRules: rules, metadata,
    setBookingRules, setMetadata, toggleAvailableDay,
    rulesDirty, rulesSave, discardRules, saveRules, reloadRules,
  } = useAdminConfigStore();
  const { mentors } = useAdminMentorStore();

  // Days disabled for booking while some mentor still has schedule slots on them.
  const orphanedDays = WEEKDAYS.filter(
    (day) =>
      !availableDays.includes(day) &&
      mentors.some((m) => (m.schedule[day]?.length ?? 0) > 0)
  );

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Booking Rules</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">Atur hari tersedia, aturan booking, dan metadata config.</p>
        </div>
        {rulesDirty && (
          <span className="inline-flex text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 shrink-0">
            Belum disimpan
          </span>
        )}
      </div>

      <div className={`${ADMIN_CARD_BODY} space-y-6`}>
        {rulesSave.status === 'saved' && (
          <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
            Perubahan berhasil disimpan.
          </div>
        )}

        {rulesSave.status === 'conflict' && (
          <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2"><AlertTriangle size={16} /> {rulesSave.error}</span>
            <button
              onClick={reloadRules}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium cursor-pointer border-none"
            >
              Muat ulang
            </button>
          </div>
        )}

        {rulesSave.status === 'error' && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            <p className="m-0 font-medium">{rulesSave.error}</p>
            {rulesSave.validationErrors.length > 0 && (
              <ul className="m-0 mt-2 pl-5 space-y-0.5">
                {rulesSave.validationErrors.map((err) => <li key={err}>{err}</li>)}
              </ul>
            )}
          </div>
        )}

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
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border transition-colors ${active
                    ? 'bg-ld-lilac/60 text-ld-violet border-ld-lavender'
                    : 'bg-ld-cloud text-ld-slate border-transparent hover:bg-white hover:border-ld-frost hover:text-ld-graphite'
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

        <section>
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

        <section>
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

        <div className="flex justify-end gap-2 pt-6 border-t border-ld-frost/60">
          <button
            onClick={discardRules}
            disabled={!rulesDirty || rulesSave.status === 'saving'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite hover:border-ld-steel disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <RotateCcw size={14} /> Discard
          </button>
          <button
            onClick={saveRules}
            disabled={!rulesDirty || rulesSave.status === 'saving'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none transition-colors"
          >
            <Save size={14} /> {rulesSave.status === 'saving' ? 'Menyimpan…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingRulesTab;
