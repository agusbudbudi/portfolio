import React from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinalCTASection: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-slate-50/60 dark:bg-slate-900/40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 px-8 py-16 text-center shadow-2xl shadow-blue-500/20">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-white text-sm font-semibold mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Mentor Tersedia Sekarang
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Siap Tingkatkan Skill QA-mu?
            </h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
              Jangan tunda lagi. Booking sesi pertamamu sekarang dan mulai perjalanan menjadi QA Engineer yang lebih baik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/mentoring/booking"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors duration-200 shadow-lg text-base"
              >
                Booking Sekarang
                <ArrowRight size={20} />
              </Link>
              <a
                href="#faq"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors duration-200 backdrop-blur-sm text-base"
              >
                <MessageCircle size={20} />
                Lihat FAQ
              </a>
            </div>

            {/* Mini trust */}
            <p className="text-blue-200 text-sm mt-8">
              60 menit/sesi · Via WhatsApp · Tersedia Tiap Hari
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
