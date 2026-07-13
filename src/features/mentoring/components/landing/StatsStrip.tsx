import React from 'react';
import { Clock, BookOpen, Users, CalendarCheck } from 'lucide-react';

const stats = [
  { icon: Clock, value: '60 Menit', label: 'Per Sesi' },
  { icon: BookOpen, value: '7 Topik', label: 'QA & Automation' },
  { icon: Users, value: '1-on-1', label: 'Personal Session' },
  { icon: CalendarCheck, value: 'Tiap Hari', label: 'Jadwal Tersedia' },
];

const StatsStrip: React.FC = () => {
  return (
    <section className="border-y border-ld-ash bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-ld-ash">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center lg:px-8">
              <div className="w-9 h-9 rounded-lg bg-ld-lilac flex items-center justify-center mb-3">
                <Icon size={18} className="text-ld-violet" />
              </div>
              <span className="text-xl font-ld-display font-semibold text-ld-graphite tracking-[-0.02em]">{value}</span>
              <span className="text-xs text-ld-slate mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
