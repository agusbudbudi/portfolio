// BookingPage – Page shell utilizing Tailwind CSS with proper light/dark mode support under /portfolio
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useConfig } from '../../../hooks/useConfig';
import BookingForm from './components/BookingForm';

const BookingPage: React.FC = () => {
  const { config, loading, error, retry } = useConfig();

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 md:py-6 bg-white dark:bg-slate-950 transition-colors">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
          Booking Sesi <span className="text-blue-500 dark:text-blue-400">Mentoring</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Pilih mentor, topik, dan waktu yang sesuai. Pesan konfirmasi akan dikirim
          langsung via WhatsApp.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center" role="status">
          <div
            className="w-10 h-10 rounded-full border-[3px] border-slate-200 dark:border-slate-800 border-t-blue-500 animate-spin"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-600 dark:text-slate-400">Memuat konfigurasi mentoring…</p>
        </div>
      )}

      {/* Config Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-4 py-24 text-center" role="alert">
          <p className="text-slate-600 dark:text-slate-400">{error}</p>
          <button
            id="config-retry-btn"
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors border-none"
            onClick={retry}
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Main Form */}
      {!loading && !error && config && (
        <BookingForm config={config} />
      )}
    </div>
  );
};

export default BookingPage;
