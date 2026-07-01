// TimeField – time slot grid (3 columns) using Tailwind CSS (light & dark mode support)
import React from 'react';
import { Clock } from 'lucide-react';
import { getTimeSlotsForMentorAndDate } from '../../../../lib/dates';
import type { MentorConfig } from '../../../../hooks/useConfig';

interface TimeFieldProps {
  mentor: MentorConfig | null;
  selectedDate: string;
  sessionDurationMinutes: number;
  value: string;
  onChange: (time: string) => void;
  error: string | null;
}

const TimeField: React.FC<TimeFieldProps> = ({ mentor, selectedDate, sessionDurationMinutes, value, onChange, error }) => {
  const slots = mentor && selectedDate
    ? getTimeSlotsForMentorAndDate(mentor, selectedDate, sessionDurationMinutes)
    : [];

  const isDisabled = !mentor || !selectedDate;
  const noSlots = mentor && selectedDate && slots.length === 0;

  const emptyBoxCls = [
    'flex items-center gap-2 p-3.5 rounded-xl border border-dashed text-xs',
    'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/40',
  ].join(' ');

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <Clock size={15} className="text-accent flex-shrink-0" />
        Pilih Waktu (1 Jam) <span className="text-red-500 ml-0.5">*</span>
      </label>

      {isDisabled ? (
        <div className={emptyBoxCls} aria-live="polite">
          <Clock size={15} className="flex-shrink-0 opacity-50" />
          <span>Pilih mentor dan tanggal untuk melihat slot waktu</span>
        </div>
      ) : noSlots ? (
        <div className={`${emptyBoxCls} border-amber-300 dark:border-amber-700 text-amber-500 bg-amber-50/20 dark:bg-amber-950/10`} aria-live="polite">
          <Clock size={15} className="flex-shrink-0" />
          <span>Mentor tidak tersedia pada tanggal ini</span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Pilih slot waktu sesi">
          {slots.map((slot: { value: string; label: string }) => {
            const isSelected = value === slot.value;
            const parts = slot.label.replace(' WIB', '').split(' - ');
            const startTime = parts[0] ?? slot.value;
            const endTime = parts[1] ?? '';

            return (
              <button
                key={slot.value}
                id={`time-slot-${slot.value.replace(':', '')}`}
                type="button"
                onClick={() => onChange(slot.value)}
                aria-pressed={isSelected}
                aria-label={`${slot.label}${isSelected ? ', dipilih' : ''}`}
                className={[
                  'flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border transition-all duration-150 cursor-pointer gap-0.5',
                  isSelected
                    ? 'text-white border-accent bg-accent shadow-md shadow-blue-500/25 dark:shadow-none'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-accent hover:bg-accent/10 hover:text-accent',
                ].join(' ')}
              >
                <span className="text-xs font-bold leading-none">{startTime}</span>
                <span className={`text-[9px] leading-none ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{endTime} WIB</span>
              </button>
            );
          })}
        </div>
      )}

      {error && <p id="time-error" className="text-xs text-red-500 mt-1" role="alert">{error}</p>}
      {!isDisabled && !noSlots && !error && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Durasi 60 menit · Zona waktu WIB (UTC+7)</p>
      )}
    </div>
  );
};

export default TimeField;
