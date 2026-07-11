import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { WEEKDAYS } from '../../../../../types/mentoring';

interface ScheduleEditorProps {
  schedule: Record<string, string[]>;
  availableDays: string[];
  onChange: (schedule: Record<string, string[]>) => void;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ schedule, availableDays, onChange }) => {
  const [pendingTime, setPendingTime] = useState<Record<string, string>>({});

  const addSlot = (day: string) => {
    const time = pendingTime[day];
    if (!time) return;
    const slots = schedule[day] ?? [];
    if (slots.includes(time)) return;
    onChange({ ...schedule, [day]: [...slots, time].sort() });
    setPendingTime({ ...pendingTime, [day]: '' });
  };

  const removeSlot = (day: string, time: string) => {
    onChange({ ...schedule, [day]: (schedule[day] ?? []).filter((t) => t !== time) });
  };

  return (
    <div className="border border-ld-frost rounded-xl divide-y divide-ld-ash/60 overflow-hidden">
      {WEEKDAYS.map((day) => {
        const active = availableDays.includes(day);
        const slots = schedule[day] ?? [];
        return (
          <div
            key={day}
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 ${active ? 'bg-white' : 'bg-ld-cloud/50 opacity-60'}`}
          >
            <span className="w-20 text-xs font-medium text-ld-graphite shrink-0">
              {DAY_LABELS[day]}
              {!active && <span className="block text-[9px] text-ld-fog font-normal">nonaktif</span>}
            </span>
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
              {slots.length === 0 && (
                <span className="text-xs text-ld-fog">Belum ada slot</span>
              )}
              {slots.map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-ld-lilac text-ld-violet text-xs font-medium"
                >
                  {time}
                  <button
                    type="button"
                    onClick={() => removeSlot(day, time)}
                    className="p-0 border-none bg-transparent text-ld-violet hover:text-red-500 cursor-pointer flex"
                    aria-label={`Hapus slot ${time} ${DAY_LABELS[day]}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 shrink-0 ml-auto">
              <input
                type="time"
                step={1800}
                value={pendingTime[day] ?? ''}
                onChange={(e) => setPendingTime({ ...pendingTime, [day]: e.target.value })}
                className="px-2 py-1.5 rounded-lg border border-ld-frost bg-white text-xs text-ld-onyx focus:outline-none focus:border-ld-violet"
              />
              <button
                type="button"
                onClick={() => addSlot(day)}
                disabled={!pendingTime[day]}
                className="p-2 rounded-lg border border-ld-frost bg-white text-ld-fog hover:text-ld-violet hover:border-ld-violet disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex transition-colors"
                aria-label={`Tambah slot ${DAY_LABELS[day]}`}
              >
                <Plus size={13} />
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleEditor;
