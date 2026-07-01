import React from 'react';
import { ArrowRight, Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[calc(100vh-70px)] flex items-center overflow-hidden bg-white dark:bg-slate-950">
      {/* Background grid + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(37,144,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,144,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 w-full py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-16 items-center">
          {/* Left: text */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sesi Tersedia · 7 Topik QA
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
              Percepat Karir{' '}
              <span className="text-blue-500 dark:text-blue-400">QA-mu</span>{' '}
              Bersama Expert
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-8">
              Mentoring 1-on-1 langsung dengan QA Engineer berpengalaman 6+ tahun.
              Dari fundamental testing hingga otomatisasi Cypress — belajar dari kasus nyata industri.
            </p>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
              {['60 Menit/Sesi', 'Via WhatsApp', 'Fleksibel Jadwal', 'Gratis Konsultasi Awal'].map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                to="/mentoring/booking"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg shadow-blue-500/25"
              >
                Booking Sekarang
                <ArrowRight size={18} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-200"
              >
                Cara Kerja
              </a>
            </div>
          </div>

          {/* Right: visual card */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm sm:pt-16 sm:pb-16 sm:px-10">
              {/* Floating card 1 — session info */}
              <div className="absolute -top-6 -left-3 sm:-top-6 sm:-left-10 z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 p-4 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Jadwal Fleksibel</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Weekday & Weekend</p>
                </div>
              </div>

              {/* Floating card 2 — WA */}
              <div className="absolute -bottom-3 -right-3 sm:bottom-0 sm:right-0 z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-slate-900/50 p-4 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Konfirmasi via</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">WhatsApp</p>
                </div>
              </div>

              {/* Main card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50">
                {/* Header bar */}
                <div className="bg-blue-500/10 border-b border-slate-700/50 px-6 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  <span className="ml-2 text-slate-400 text-xs font-mono">mentoring-session.tsx</span>
                </div>

                <div className="px-6 py-5 font-mono text-sm leading-relaxed">
                  <p className="text-slate-500">{'// QA Mentoring 1-on-1'}</p>
                  <p className="mt-2">
                    <span className="text-blue-400">const</span>
                    <span className="text-white"> session </span>
                    <span className="text-slate-400">= {'{'}</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-emerald-400">mentor</span>
                    <span className="text-slate-400">: </span>
                    <span className="text-amber-300">"Agus Budiman"</span>
                    <span className="text-slate-400">,</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-emerald-400">duration</span>
                    <span className="text-slate-400">: </span>
                    <span className="text-purple-400">60</span>
                    <span className="text-slate-400">, </span>
                    <span className="text-slate-500">{'// minutes'}</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-emerald-400">topics</span>
                    <span className="text-slate-400">: </span>
                    <span className="text-amber-300">"7 tersedia"</span>
                    <span className="text-slate-400">,</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-emerald-400">experience</span>
                    <span className="text-slate-400">: </span>
                    <span className="text-amber-300">"6+ tahun"</span>
                    <span className="text-slate-400">,</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-emerald-400">status</span>
                    <span className="text-slate-400">: </span>
                    <span className="text-emerald-400">"available"</span>
                  </p>
                  <p>
                    <span className="text-slate-400">{'}'}</span>
                  </p>
                  <p className="mt-3 flex items-center gap-2">
                    <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse rounded-sm" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
