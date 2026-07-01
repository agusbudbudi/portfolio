import React from 'react';
import { ArrowRight, Award, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../../../../hooks/useConfig';

const topicLabelMap: Record<string, string> = {
  'fundamental-qa': 'Fundamental QA',
  'ai-assisted-qa': 'AI Assisted QA',
  'debugging-tips-tricks': 'Debugging',
  'test-management-strategy': 'Test Management',
  'api-testing-postman': 'API Testing',
  'cypress-web-automation': 'Cypress Automation',
  'web-automation-basic': 'Web Automation',
};

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const weekend = ['saturday', 'sunday'];

function deriveSchedule(schedule: Record<string, string[]>) {
  const weekdaySlots = weekdays.flatMap(d => schedule[d] ?? []);
  const weekendSlots = weekend.flatMap(d => schedule[d] ?? []);

  const fmt = (slots: string[]) => {
    if (!slots.length) return null;
    const sorted = [...new Set(slots)].sort();
    return `${sorted[0]} – ${sorted[sorted.length - 1]} WIB`;
  };

  return { weekday: fmt(weekdaySlots), weekend: fmt(weekendSlots) };
}

const MentorProfileSection: React.FC = () => {
  const { config, loading } = useConfig();
  const mentors = config?.mentors ?? [];

  return (
    <section id="mentor" className="py-12 md:py-20 bg-slate-50/60 dark:bg-slate-900/40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            Mentormu
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Belajar Langsung dari Praktisi
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Bukan instruktur generik. Mentor adalah QA Engineer aktif yang masih bekerja di industri.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        )}

        {!loading && mentors.length > 0 && (
          <div className={`grid gap-6 ${
            mentors.length === 1
              ? 'grid-cols-1 max-w-4xl mx-auto'
              : mentors.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {mentors.map(mentor => {
              const sched = deriveSchedule(mentor.schedule);
              return (
                <div
                  key={mentor.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col"
                >
                  {/* Top: gradient header */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shadow-lg flex-shrink-0 bg-white">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-extrabold text-white mb-0.5">{mentor.name}</h3>
                      <p className="text-blue-100 text-xs mb-3 leading-snug">{mentor.bio}</p>
                      <Link
                        to="/mentoring/booking"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg text-xs hover:bg-blue-50 transition-colors duration-200 shadow-md"
                      >
                        Book Session
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Bottom: details */}
                  <div className="p-6 flex flex-col gap-5 flex-1">
                    {/* Expertise */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                        <Award size={16} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                          Area Keahlian
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.expertise.map(id => (
                            <span
                              key={id}
                              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                            >
                              {topicLabelMap[id] ?? id}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                          Jadwal Tersedia
                        </p>
                        {sched.weekday && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Weekday{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {sched.weekday}
                            </span>
                          </p>
                        )}
                        {sched.weekend && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Weekend{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {sched.weekend}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MentorProfileSection;
