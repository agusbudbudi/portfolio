import React from 'react';
import { ClipboardList, CalendarCheck, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    step: '01',
    icon: ClipboardList,
    title: 'Pilih Topik & Jadwal',
    description: 'Pilih topik, tanggal, dan waktu yang sesuai jadwalmu.',
  },
  {
    step: '02',
    icon: CalendarCheck,
    title: 'Isi Form Booking',
    description: 'Isi form dan ceritakan singkat tujuan sesimu.',
  },
  {
    step: '03',
    icon: MessageCircle,
    title: 'Konfirmasi via WhatsApp',
    description: 'Mentor konfirmasi langsung via WhatsApp.',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            3 Langkah Mudah
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Proses booking dirancang sesimple mungkin. Dari pilih jadwal hingga konfirmasi — semuanya cepat.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px z-0 bg-ld-ash" />

          {steps.map(({ step, icon: Icon, title, description }, idx) => (
            <div key={step} className="relative z-10 flex flex-col items-center text-center">
              <div className="relative z-10 mb-5">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-ld-lilac text-ld-violet border border-ld-ash">
                  <Icon size={24} />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ld-canvas border border-ld-ash text-xs font-medium text-ld-slate flex items-center justify-center">
                  {idx + 1}
                </span>
              </div>

              <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-2">{title}</h3>
              <p className="text-sm text-ld-slate leading-relaxed max-w-xs">{description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/mentoring/booking"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#4d3de6] transition-colors"
          >
            Mulai Booking Sekarang
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
