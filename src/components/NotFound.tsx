import React from 'react';
import { Home } from 'lucide-react';
import NotFoundState from './common/NotFoundState';

const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center px-4 pt-24 pb-8 font-ld-sans">
      <div className="max-w-lg mx-auto">
        <NotFoundState
          title="Halaman tidak ditemukan"
          description="Maaf, halaman yang kamu cari tidak tersedia atau sudah dipindahkan. Yuk kembali ke halaman utama."
          actionTo="/"
          actionLabel="Kembali ke Beranda"
          actionIcon={<Home size={18} />}
        />
      </div>
    </div>
  );
};

export default NotFound;
