import React from 'react';
import { useConfig } from '../../../../hooks/useConfig';
import { CalendarIllustration, ChatIllustration, ClockIllustration, TopicsIllustration } from './StatsIllustration';

// Bento of the four mentoring "facts" under the Hero. Each card pairs the
// number with a tiny visual (time bar, topic chips, 1-on-1 avatars, week row).
// Values come from the live mentoring config when it's loaded, so they stay
// true when the admin changes duration/topics/days; the fallbacks match the
// static seed config.

const FALLBACK_TOPICS = ['Fundamental QA', 'API Testing with Postman', 'Cypress Web Automation', 'AI Assisted in QA Workflow'];
const WEEK = [
  ['monday', 'Sen'], ['tuesday', 'Sel'], ['wednesday', 'Rab'], ['thursday', 'Kam'],
  ['friday', 'Jum'], ['saturday', 'Sab'], ['sunday', 'Min'],
] as const;

const CARD = 'relative overflow-hidden rounded-lg border border-ld-frost bg-white p-5 sm:p-6 flex flex-col';

// Label + headline on the left, animated illustration on the right.
const CardHead: React.FC<{ art: React.FC<{ className?: string }>; label: string; children: React.ReactNode }> = ({ art: Art, label, children }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="m-0 mb-2 text-xs font-medium text-ld-slate">{label}</p>
      {children}
    </div>
    <Art className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 -mt-1 -mr-1" />
  </div>
);

const StatsStrip: React.FC = () => {
  const { config } = useConfig();
  const minutes = config?.bookingRules.sessionDurationMinutes ?? 60;
  const topics = config?.topics.map((t) => t.label) ?? FALLBACK_TOPICS;
  const topicCount = config?.topics.length ?? 7;
  const days = new Set(config?.availableDays ?? WEEK.map(([d]) => d));
  const everyDay = days.size === 7;
  const shownTopics = topics.slice(0, 4);
  const moreTopics = topicCount - shownTopics.length;

  return (
    <section className="border-y border-ld-frost bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Duration — wide */}
          <div className={`${CARD} lg:col-span-2`}>
            <CardHead art={ClockIllustration} label="Durasi per sesi">
              <p className="m-0 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-semibold text-ld-onyx tracking-[-0.03em] tabular-nums">{minutes}</span>
              <span className="text-sm text-ld-slate">menit, fokus ke kebutuhanmu</span>
            </p>
            </CardHead>
            <div className="mt-auto pt-6" aria-hidden="true">
              <div className="h-2.5 rounded-full bg-ld-frost overflow-hidden">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-ld-lavender to-ld-violet" />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] font-ld-mono text-ld-fog">
                <span>0′</span><span>{Math.round(minutes / 2)}′</span><span>{minutes}′</span>
              </div>
            </div>
          </div>

          {/* 1-on-1 */}
          <div className={CARD}>
            <CardHead art={ChatIllustration} label="Format sesi">
              <p className="m-0 text-4xl sm:text-5xl font-semibold text-ld-onyx tracking-[-0.03em]">1-on-1</p>
            </CardHead>
            <div className="mt-auto pt-6 flex items-center gap-2" aria-hidden="true">
              <span className="w-9 h-9 rounded-full bg-ld-violet text-white text-xs font-semibold flex items-center justify-center">Kamu</span>
              <span className="flex-1 border-t-2 border-dashed border-ld-lavender" />
              <span className="w-9 h-9 rounded-full bg-ld-onyx text-white text-[10px] font-semibold flex items-center justify-center">QA</span>
            </div>
            <p className="m-0 mt-2 text-xs text-ld-slate">Personal, bukan kelas ramai.</p>
          </div>

          {/* Topics */}
          <div className={CARD}>
            <CardHead art={TopicsIllustration} label="Topik mentoring">
              <p className="m-0 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-semibold text-ld-onyx tracking-[-0.03em] tabular-nums">{topicCount}</span>
              <span className="text-sm text-ld-slate">topik QA & Automation</span>
            </p>
            </CardHead>
            <ul className="m-0 mt-auto pt-5 p-0 list-none flex flex-wrap gap-1.5">
              {shownTopics.map((t) => (
                <li key={t} className="px-2 py-1 rounded-md bg-ld-cloud border border-ld-frost text-[11px] text-ld-graphite">{t}</li>
              ))}
              {moreTopics > 0 && (
                <li className="px-2 py-1 rounded-md bg-ld-lilac text-[11px] font-medium text-ld-violet">+{moreTopics} lainnya</li>
              )}
            </ul>
          </div>

          {/* Schedule — wide */}
          <div className={`${CARD} sm:col-span-2`}>
            <CardHead art={CalendarIllustration} label="Jadwal tersedia">
              <p className="m-0 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-semibold text-ld-onyx tracking-[-0.03em]">{everyDay ? 'Tiap hari' : `${days.size} hari`}</span>
              <span className="text-sm text-ld-slate">{everyDay ? 'termasuk akhir pekan' : 'per minggu'}</span>
            </p>
            </CardHead>
            <ul className="m-0 mt-auto pt-6 p-0 list-none grid grid-cols-7 gap-1.5 sm:gap-2" aria-label="Hari tersedia">
              {WEEK.map(([day, label]) => {
                const on = days.has(day);
                return (
                  <li
                    key={day}
                    className={`flex flex-col items-center gap-1.5 rounded-md py-2 text-[11px] font-medium ${on ? 'bg-ld-lilac text-ld-violet' : 'bg-ld-cloud text-ld-fog'}`}
                    aria-label={`${label}${on ? ' tersedia' : ' tidak tersedia'}`}
                  >
                    {label}
                    <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-ld-violet' : 'bg-ld-ash'}`} />
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
