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
    <section id="mentor" className="py-16 md:py-20 bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Belajar Langsung dari Praktisi
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Bukan instruktur generik. Mentor adalah QA Engineer aktif yang masih bekerja di industri.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="animate-spin text-ld-fog" />
          </div>
        )}

        {!loading && mentors.length > 0 && (
          <div className={`grid gap-6 ${mentors.length === 1
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
                  className="bg-ld-canvas rounded-2xl border border-ld-ash overflow-hidden flex flex-col"
                >
                  <div className="bg-ld-onyx p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/15 flex-shrink-0 bg-white">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-ld-display font-semibold text-white mb-0.5">{mentor.name}</h3>
                      <p className="text-ld-fog text-xs mb-3 leading-snug">{mentor.bio}</p>
                      <Link
                        to="/mentoring/booking"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-ld-violet text-white font-medium rounded-lg text-xs no-underline hover:bg-[#4d3de6] transition-colors"
                      >
                        Book Session
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-5 flex-1 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-ld-lilac flex items-center justify-center flex-shrink-0">
                        <Award size={15} className="text-ld-violet" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ld-fog uppercase tracking-wide mb-2">
                          Area Keahlian
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.expertise.map(id => (
                            <span
                              key={id}
                              className="px-2.5 py-1 rounded-full bg-ld-cloud text-ld-graphite text-xs font-medium"
                            >
                              {topicLabelMap[id] ?? id}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-ld-ash pt-5">
                      <div className="w-8 h-8 rounded-lg bg-ld-lilac flex items-center justify-center flex-shrink-0">
                        <Clock size={15} className="text-ld-violet" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ld-fog uppercase tracking-wide mb-2">
                          Jadwal Tersedia
                        </p>
                        {sched.weekday && (
                          <p className="text-sm text-ld-slate">
                            Weekday <span className="font-medium text-ld-graphite">{sched.weekday}</span>
                          </p>
                        )}
                        {sched.weekend && (
                          <p className="text-sm text-ld-slate">
                            Weekend <span className="font-medium text-ld-graphite">{sched.weekend}</span>
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
