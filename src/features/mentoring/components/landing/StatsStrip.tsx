import React from 'react';
import { useConfig } from '../../../../hooks/useConfig';
import { CalendarIllustration, ChatIllustration, ClockIllustration, TopicsIllustration } from './StatsIllustration';

// The four mentoring "facts" under the Hero: one row of equal cards on
// desktop, 2×2 on mobile. Each card is just illustration, label, value and a
// short caption. Values come from the live mentoring config when it's loaded,
// so they stay true when the admin changes duration/topics/days; the
// fallbacks match the static seed config.

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface Stat {
  art: React.FC<{ className?: string }>;
  label: string;
  value: string;
  caption: string;
}

const StatsStrip: React.FC = () => {
  const { config } = useConfig();
  const minutes = config?.bookingRules.sessionDurationMinutes ?? 60;
  const topicCount = config?.topics.length ?? 7;
  const dayCount = new Set(config?.availableDays ?? ALL_DAYS).size;
  const everyDay = dayCount === 7;

  const stats: Stat[] = [
    { art: ClockIllustration, label: 'Durasi per sesi', value: `${minutes} menit`, caption: 'Fokus ke kebutuhanmu' },
    { art: ChatIllustration, label: 'Format sesi', value: '1-on-1', caption: 'Personal, bukan kelas ramai' },
    { art: TopicsIllustration, label: 'Topik mentoring', value: `${topicCount} topik`, caption: 'QA & Automation' },
    {
      art: CalendarIllustration,
      label: 'Jadwal tersedia',
      value: everyDay ? 'Tiap hari' : `${dayCount} hari`,
      caption: everyDay ? 'Termasuk akhir pekan' : 'Per minggu',
    },
  ];

  return (
    <section className="border-y border-ld-frost bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <ul className="m-0 p-0 list-none grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ art: Art, label, value, caption }) => (
            <li
              key={label}
              className="flex flex-col rounded-lg border border-ld-frost bg-white p-4 sm:p-5"
            >
              <Art className="w-12 h-12 sm:w-14 sm:h-14 -ml-1 mb-3" />
              <p className="m-0 mb-1 text-xs font-medium text-ld-slate">{label}</p>
              <p className="m-0 text-2xl sm:text-3xl font-semibold text-ld-onyx tracking-[-0.03em] leading-tight">
                {value}
              </p>
              <p className="m-0 mt-1 text-xs sm:text-sm text-ld-slate">{caption}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default StatsStrip;
