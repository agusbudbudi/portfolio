// BookingPage – Page shell utilizing Tailwind CSS with proper light/dark mode support under /portfolio
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useConfig } from '../../../hooks/useConfig';
import LoadingState from '../../../components/common/LoadingState';
import BookingForm from '../components/booking/BookingForm';

const BookingPage: React.FC = () => {
  const { config, loading, error, retry } = useConfig();

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-24 pb-16 md:pt-28 font-ld-sans bg-ld-canvas">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-ld-display font-semibold text-[28px] sm:text-[32px] leading-tight tracking-[-0.02em] text-ld-graphite mb-2">
          Booking Sesi <span className="text-ld-violet">Mentoring</span>
        </h1>
        <p className="text-sm sm:text-base text-ld-slate max-w-2xl leading-relaxed tracking-[-0.01em]">
          Pilih mentor, topik, dan waktu yang sesuai. Pesan konfirmasi akan dikirim
          langsung via WhatsApp.
        </p>
      </div>

      {/* Loading State */}
      {loading && <LoadingState label="Memuat konfigurasi mentoring…" className="py-24" />}

      {/* Config Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-4 py-24 text-center" role="alert">
          <p className="text-ld-slate">{error}</p>
          <button
            id="config-retry-btn"
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ld-violet hover:bg-[#1f87e6] text-white rounded-lg text-sm font-medium cursor-pointer transition-colors border-none"
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
