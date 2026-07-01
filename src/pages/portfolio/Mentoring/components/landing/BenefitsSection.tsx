import React from 'react';
import { Target, Zap, MessageCircle, TrendingUp } from 'lucide-react';

const benefits = [
  {
    icon: Target,
    title: 'Fokus 1-on-1',
    description:
      'Sesi eksklusif hanya kamu dan mentor. Tidak ada distraksi, semua waktu digunakan untuk kebutuhanmu.',
    color: 'blue',
  },
  {
    icon: Zap,
    title: 'Real-world Cases',
    description:
      'Materi langsung dari pengalaman industri nyata — bukan teori generik. Kasus yang kamu pelajari adalah yang terjadi di lapangan.',
    color: 'amber',
  },
  {
    icon: MessageCircle,
    title: 'Direct via WhatsApp',
    description:
      'Booking mudah, konfirmasi cepat. Semua koordinasi langsung lewat WhatsApp tanpa platform tambahan.',
    color: 'emerald',
  },
  {
    icon: TrendingUp,
    title: 'Career-Oriented',
    description:
      'Bukan hanya teknikal — mentor juga bantu kamu memahami pola karir QA Engineer dan langkah konkret selanjutnya.',
    color: 'purple',
  },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-500 dark:text-blue-400',
  amber: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-500 dark:text-amber-400',
  emerald: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-500 dark:text-emerald-400',
  purple: 'bg-purple-500/10 dark:bg-purple-500/15 text-purple-500 dark:text-purple-400',
};

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-white dark:bg-slate-950">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            Kenapa Mentoring?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Lebih dari Sekadar Belajar
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Mentoring 1-on-1 beda dengan kursus online. Kamu dapat feedback langsung,
            bukan video pre-recorded yang tidak bisa menjawab pertanyaanmu.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="group p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>
                <Icon size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
