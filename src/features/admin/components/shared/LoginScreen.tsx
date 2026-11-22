import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { useSnackbarStore } from '../../../../store/useSnackbarStore';
import { loadGoogleIdentity } from '../../../../lib/loadGoogleIdentity';

const LoginScreen: React.FC = () => {
  const { login, loggingIn, token, user } = useAdminAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Static across the component's lifetime — no state needed, just derive it.
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // Already authenticated (fresh login, or landed on /login manually while
  // a session is still valid) — bounce straight to the intended destination.
  // A just-registered user is sent to onboarding by OnboardingGate once they
  // land there (it re-checks the status server-side and carries `next`).
  useEffect(() => {
    if (!token || !user) return;
    navigate(redirectTo, { replace: true });
  }, [token, user, navigate, redirectTo]);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    const init = () => {
      if (cancelled || !window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          setError(null);
          try {
            await login(response.credential);
            showSnackbar('Login berhasil! Selamat datang.', 'success');
          } catch {
            setError('Gagal login. Coba lagi.');
            showSnackbar('Gagal melakukan login. Silakan coba lagi.', 'error');
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
    };

    // The GSI script is injected on demand (not from index.html), so wait for
    // the shared loader instead of assuming window.google exists on mount.
    loadGoogleIdentity().then(init, () => {
      if (!cancelled) setError('Gagal memuat Google Sign-In. Coba refresh halaman.');
    });
    return () => { cancelled = true; };
  }, [login, clientId, showSnackbar]);

  const displayError = !clientId ? 'VITE_GOOGLE_CLIENT_ID belum diset.' : error;

  return (
    <div className="min-h-screen flex font-ld-sans bg-ld-cloud">
      {/* Left — promo panel (matches PromotionSection styling) */}
      <div className="hidden lg:flex relative w-1/2 flex-col bg-ld-violet overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />

        <div className="relative h-1/2">
          <img
            src="/admin/img/image-promotion.webp"
            alt="Mentoring QA"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ld-violet" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 max-w-lg">
          <h2 className="font-ld-display font-semibold text-3xl xl:text-[40px] text-white tracking-[-0.02em] leading-[1.1] mb-4">
            Satu Akun untuk Semua Program Mentor.QA
          </h2>
          <p className="text-white/80 text-base leading-relaxed">
            Latihan kasus nyata di QA Simulator, bangun portfolio, belajar dari QA Library, dan booking mentoring 1-on-1. Gratis untuk mulai.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col lg:items-center lg:justify-center">
        {/* Mobile hero image */}
        <div className="relative h-64 shrink-0 lg:hidden">
          <img
            src="/admin/img/image-promotion.webp"
            alt="Mentoring QA"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ld-cloud" />
        </div>

        <div className="flex-1 flex items-start lg:items-center justify-center p-6 pt-8 lg:p-0">
          <div className="w-full max-w-sm">
            <Link to="/" className="flex items-center gap-3 mb-8 no-underline w-fit">
              <img
                src="/shared/img/mentor-logo-96.webp"
                alt="Mentor.QA"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl object-contain shrink-0"
              />
              <h1 className="text-lg font-semibold text-ld-onyx m-0">Mentor.QA</h1>
            </Link>

            <h1 className="font-ld-display font-semibold text-2xl text-ld-onyx m-0 mb-2">Selamat datang</h1>
            <p className="text-sm text-ld-fog m-0 mb-8">Masuk atau buat akun baru dengan Google.</p>

            <div className="relative w-full">
              {loggingIn && (
                <div className="flex items-center justify-center gap-2.5 w-full py-2 px-3 h-[40px] rounded-lg border border-[#dadce0] bg-white text-sm font-medium text-[#3c4043]">
                  <span className="w-4 h-4 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
                  <span>Menghubungkan ke Google...</span>
                </div>
              )}
              <div ref={buttonRef} className={`w-full ${loggingIn ? 'hidden' : ''}`} />
            </div>
            {displayError && <p className="mt-3 text-sm text-red-500 m-0 text-center">{displayError}</p>}

            <p className="text-xs text-ld-fog text-center mt-6">
              Tempat belajar dan berkembang buat #QAEngineer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
