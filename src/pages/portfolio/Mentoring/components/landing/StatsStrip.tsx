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
    <section className="border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-slate-200 dark:divide-slate-700">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center lg:px-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center mb-3">
                <Icon size={20} className="text-blue-500 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
