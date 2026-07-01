import React from 'react';
import { ClipboardList, CalendarCheck, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Pilih Topik & Jadwal',
    description:
      'Tentukan topik yang ingin kamu pelajari, pilih tanggal dan waktu yang sesuai dengan jadwalmu. Tersedia setiap hari.',
    color: 'blue',
  },
  {
    step: '02',
    icon: CalendarCheck,
    title: 'Isi Form Booking',
    description:
      'Lengkapi form booking dengan perkenalan singkat. Ceritakan latar belakang dan apa yang ingin kamu capai dari sesi ini.',
    color: 'purple',
  },
  {
    step: '03',
    icon: MessageCircle,
    title: 'Konfirmasi via WhatsApp',
    description:
      'Setelah submit, kamu akan langsung terhubung dengan mentor via WhatsApp untuk konfirmasi dan detail sesi.',
    color: 'emerald',
  },
];

const iconColorMap: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-950 text-blue-500 dark:text-blue-400',
  purple: 'bg-purple-100 dark:bg-purple-950 text-purple-500 dark:text-purple-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-500 dark:text-emerald-400',
};

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-12 md:py-20 bg-white dark:bg-slate-950">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            Cara Kerja
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            3 Langkah Mudah
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Proses booking dirancang sesimple mungkin. Dari pilih jadwal hingga konfirmasi — semuanya cepat.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px z-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-emerald-500/30" />

          {steps.map(({ step, icon: Icon, title, description, color }, idx) => (
            <div key={step} className="relative z-10 flex flex-col items-center text-center">
              {/* Step circle */}
              <div className="relative z-10 mb-5">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${iconColorMap[color]} border border-current/10`}>
                  <Icon size={28} />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            to="/mentoring/booking"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg shadow-blue-500/25"
          >
            Mulai Booking Sekarang
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
