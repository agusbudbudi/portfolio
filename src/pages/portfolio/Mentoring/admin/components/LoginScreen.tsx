import React, { useEffect, useRef, useState } from 'react';
import { useAdminAuthStore } from '../../../../../store/useAdminAuthStore';

const LoginScreen: React.FC = () => {
  const { login } = useAdminAuthStore();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      setError('VITE_GOOGLE_CLIENT_ID belum diset.');
      return;
    }
    if (!window.google || !buttonRef.current) {
      setError('Gagal memuat Google Sign-In. Coba refresh halaman.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setError(null);
        try {
          await login(response.credential);
        } catch {
          setError('Gagal login. Coba lagi.');
        }
      },
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: buttonRef.current.offsetWidth,
    });
  }, [login]);

  return (
    <div className="min-h-screen flex font-ld-sans bg-ld-cloud">
      {/* Left — promo panel (matches PromotionSection styling) */}
      <div className="hidden lg:flex relative w-1/2 flex-col bg-ld-violet overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />

        <div className="relative h-1/2">
          <img
            src="/img/image-promotion.webp"
            alt="Mentoring QA"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ld-violet" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 max-w-lg">
          <h2 className="font-ld-display font-semibold text-3xl xl:text-[40px] text-white tracking-[-0.02em] leading-[1.1] mb-4">
            Satu Akun untuk Mentoring & Portofolio QA-mu
          </h2>
          <p className="text-white/80 text-base leading-relaxed">
            Booking sesi mentoring, kelola jadwal, dan buat portofolio QA-mu sendiri secara gratis — semua dalam satu tempat.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col lg:items-center lg:justify-center">
        {/* Mobile hero image */}
        <div className="relative h-64 shrink-0 lg:hidden">
          <img
            src="/img/image-promotion.webp"
            alt="Mentoring QA"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ld-cloud" />
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center p-6 pt-8 lg:p-0">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <img
                src="/img/mentor-logo.webp"
                alt="Mentor.QA"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-contain shrink-0"
              />
              <h1 className="text-lg font-semibold text-ld-onyx m-0">Mentor.QA</h1>
            </div>

            <h1 className="font-ld-display font-semibold text-2xl text-ld-onyx m-0 mb-2">Selamat datang kembali</h1>
            <p className="text-sm text-ld-fog m-0 mb-8">Masuk dengan akun Google-mu.</p>

            <div ref={buttonRef} className="w-full" />
            {error && <p className="mt-3 text-sm text-red-500 m-0 text-center">{error}</p>}

            <p className="text-xs text-ld-fog text-center mt-6">
              Untuk mentee &amp; mentor Mentor.QA yang terdaftar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
