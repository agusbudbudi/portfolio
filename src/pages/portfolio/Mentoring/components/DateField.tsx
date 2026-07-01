// DateField – Calendar Month View picker using Tailwind CSS (light & dark mode support)
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import { formatDateId, parseDateId } from '../../../../lib/dates';

interface DateFieldProps {
  availableDateIds: string[];
  value: string;
  onChange: (dateId: string) => void;
  error: string | null;
}

const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

const DateField: React.FC<DateFieldProps> = ({ availableDateIds, value, onChange, error }) => {
  const [calYear, setCalYear] = useState(() => {
    if (value) return parseDateId(value).getFullYear();
    if (availableDateIds.length > 0) return parseDateId(availableDateIds[0]).getFullYear();
    return new Date().getFullYear();
  });
  const [calMonth, setCalMonth] = useState(() => {
    if (value) return parseDateId(value).getMonth();
    if (availableDateIds.length > 0) return parseDateId(availableDateIds[0]).getMonth();
    return new Date().getMonth();
  });

  React.useEffect(() => {
    if (value) {
      const parsed = parseDateId(value);
      setCalYear(parsed.getFullYear());
      setCalMonth(parsed.getMonth());
    }
  }, [value]);

  const availableSet = useMemo(() => new Set(availableDateIds), [availableDateIds]);

  const minDate = parseDateId(availableDateIds[0] ?? formatDateId(new Date()));
  const maxDate = parseDateId(availableDateIds[availableDateIds.length - 1] ?? formatDateId(new Date()));

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDayOfWeek = getFirstDayOfMonth(calYear, calMonth);

  const canGoPrev = () => new Date(calYear, calMonth, 0) >= minDate;
  const canGoNext = () => new Date(calYear, calMonth + 1, 1) <= maxDate;

  const handlePrev = () => {
    if (!canGoPrev()) return;
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1);
  };
  const handleNext = () => {
    if (!canGoNext()) return;
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedLabel = useMemo(() => {
    if (!value) return null;
    const d = parseDateId(value);
    return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }, [value]);

  const navBtnBase = [
    'w-7 h-7 flex items-center justify-center rounded-lg border',
    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400',
    'hover:border-accent hover:text-accent cursor-pointer transition-all duration-150',
    'disabled:opacity-30 disabled:cursor-default disabled:hover:border-slate-200 disabled:hover:text-slate-500 dark:disabled:hover:border-slate-800 dark:disabled:hover:text-slate-400',
  ].join(' ');

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Calendar size={15} className="text-accent flex-shrink-0" />
          Pilih Tanggal <span className="text-red-500 ml-0.5">*</span>
        </label>
        {selectedLabel && (
          <p className="flex items-center gap-1 text-xs font-semibold text-accent whitespace-nowrap">
            <CheckCircle2 size={13} />
            {selectedLabel}
          </p>
        )}
      </div>

      <div
        className={`rounded-xl border p-3 flex flex-col gap-3 bg-white dark:bg-slate-900/30 ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'}`}
      >
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button type="button" className={navBtnBase} onClick={handlePrev} disabled={!canGoPrev()} aria-label="Bulan sebelumnya">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{ID_MONTHS[calMonth]} {calYear}</span>
          <button type="button" className={navBtnBase} onClick={handleNext} disabled={!canGoNext()} aria-label="Bulan berikutnya">
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((d) => (
            <span key={d} className="text-[9px] font-bold text-center text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">{d}</span>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`e-${idx}`} />;

            const dateId = formatDateId(new Date(calYear, calMonth, day));
            const isAvailable = availableSet.has(dateId);
            const isSelected = dateId === value;
            const cellDate = new Date(calYear, calMonth, day);
            const isPast = cellDate < today;
            const isToday = cellDate.toDateString() === today.toDateString();
            const isClickable = isAvailable && !isPast;

            return (
              <button
                key={dateId}
                id={`cal-day-${dateId}`}
                type="button"
                onClick={() => isClickable && onChange(dateId)}
                disabled={!isClickable}
                aria-pressed={isSelected}
                aria-label={`${day} ${ID_MONTHS[calMonth]} ${calYear}`}
                className={[
                  'h-10 w-full flex items-center justify-center text-xs rounded-lg border border-transparent transition-all duration-150',
                  isSelected
                    ? 'bg-accent text-white font-bold shadow-sm'
                    : !isClickable
                      ? 'text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-800/40 cursor-default rounded-lg'
                      : isToday
                        ? 'border-accent text-accent font-semibold cursor-pointer hover:bg-accent/10'
                        : 'text-slate-900 dark:text-white font-medium cursor-pointer hover:bg-accent/10 hover:text-accent',
                ].join(' ')}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">Hanya hari dengan mentor tersedia yang bisa dipilih</p>
      {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
};

export default DateField;
