import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundIllustration: React.FC = () => (
  <svg
    viewBox="0 0 400 260"
    className="w-full max-w-[220px] mx-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="200" cy="230" rx="140" ry="14" className="fill-ld-frost" />
    <text
      x="200"
      y="140"
      textAnchor="middle"
      className="fill-ld-lavender font-ld-display font-semibold"
      style={{ fontSize: 110 }}
    >
      404
    </text>
    <circle cx="70" cy="70" r="10" className="fill-ld-lilac" />
    <circle cx="335" cy="60" r="7" className="fill-ld-lavender" />
    <circle cx="345" cy="150" r="5" className="fill-ld-lilac" />
    <path
      d="M60 150 L80 150 M50 160 L70 160"
      className="stroke-ld-mist"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M320 190 L340 190 M330 200 L350 200"
      className="stroke-ld-mist"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center px-4 pt-24 pb-8 font-ld-sans">
      <div className="max-w-lg mx-auto text-center">
        <NotFoundIllustration />

        <h1 className="font-ld-display font-semibold text-2xl sm:text-3xl text-ld-onyx tracking-[-0.02em] mt-6 mb-3">
          Halaman tidak ditemukan
        </h1>
        <p className="text-ld-slate text-sm sm:text-base leading-relaxed mb-8">
          Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan. Yuk kembali ke halaman utama.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ld-violet text-white font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors text-sm"
        >
          <Home size={18} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
