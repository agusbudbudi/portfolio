import React from 'react';
import { ArrowRight, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

// Reusable KPI card for dashboard summaries — icon chip + big value + an
// optional signed delta vs a named prior period. Add a new metric by passing
// props, not by copy-pasting a card.
export type StatTileTone = 'violet' | 'sky' | 'emerald' | 'amber';

const ICON_TONE_CLASSES: Record<StatTileTone, string> = {
  violet: 'bg-ld-lilac text-ld-violet',
  sky: 'bg-sky-50 text-sky-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
};

interface StatTileDelta {
  /** Signed percent change, e.g. 12 or -8. */
  percent: number;
  /** Named comparison period, e.g. "vs 7 hari lalu". */
  caption: string;
  /** Whether a positive change is a good thing (default true) — flips the color. */
  positiveIsGood?: boolean;
}

interface StatTileBreakdownItem {
  label: string;
  value: string | number;
}

interface StatTileProps {
  icon: LucideIcon;
  tone: StatTileTone;
  label: string;
  value: string | number;
  delta?: StatTileDelta;
  /** Optional per-status counts shown below the label, e.g. "8 published · 4 draft". */
  breakdown?: StatTileBreakdownItem[];
  /** Optional "Lihat semua" link pinned to the top-right corner. */
  onViewAll?: () => void;
}

const StatTile: React.FC<StatTileProps> = ({ icon: Icon, tone, label, value, delta, breakdown, onViewAll }) => {
  const direction = delta ? Math.sign(delta.percent) : 0;
  const positiveIsGood = delta?.positiveIsGood ?? true;
  const isGoodDirection = direction === 0 ? null : (direction > 0) === positiveIsGood;
  const deltaColorClass =
    isGoodDirection === null ? 'text-ld-fog' : isGoodDirection ? 'text-emerald-600' : 'text-red-500';
  const DeltaIcon = direction < 0 ? TrendingDown : TrendingUp;

  return (
    <div className="relative rounded-xl border border-ld-frost/70 p-4 bg-white flex items-center gap-3">
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="absolute top-2.5 right-2.5 inline-flex items-center gap-0.5 text-[10px] font-medium text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0"
        >
          Lihat semua <ArrowRight size={10} />
        </button>
      )}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ICON_TONE_CLASSES[tone]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="m-0 text-2xl font-semibold text-ld-onyx tabular-nums">{value}</p>
          {delta && (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${deltaColorClass}`}>
              {direction !== 0 && <DeltaIcon size={12} />}
              {direction > 0 ? '+' : ''}{delta.percent}%
            </span>
          )}
        </div>
        <p className="m-0 text-xs text-ld-fog mt-0.5 truncate">{label}</p>
        {delta && <p className="m-0 text-[10px] text-ld-fog/80 mt-0.5 truncate">{delta.caption}</p>}
        {breakdown && breakdown.length > 0 && (
          <p className="m-0 text-[10px] text-ld-fog/80 mt-0.5 truncate">
            {breakdown.map((item) => `${item.value} ${item.label}`).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatTile;
