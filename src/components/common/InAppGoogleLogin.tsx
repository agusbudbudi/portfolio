import React, { useState } from 'react';
import { startGoogleRedirect } from '../../lib/googleRedirectAuth';
import InAppBrowserNotice from './InAppBrowserNotice';

interface InAppGoogleLoginProps {
  /** Detected app name, e.g. "Threads". */
  appName: string;
  /** Same-site path to land on after login. Defaults to the current page. */
  returnTo?: string;
  /** Error from a failed redirect round trip; opens the fallback notice. */
  error?: string | null;
}

// Google sign-in for in-app browsers: a same-tab redirect instead of the GIS
// popup (which opens blank in these webviews). If that still fails, the user
// can open the page in a real browser.
const InAppGoogleLogin: React.FC<InAppGoogleLoginProps> = ({ appName, returnTo, error }) => {
  const [showFallback, setShowFallback] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleClick = () => {
    if (!clientId) return;
    setRedirecting(true);
    startGoogleRedirect(clientId, returnTo ?? `${window.location.pathname}${window.location.search}`);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={!clientId || redirecting}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#dadce0] bg-white text-sm font-medium text-[#3c4043] disabled:opacity-60"
      >
        {redirecting ? (
          <span className="h-4 w-4 rounded-full border-2 border-[#1a73e8] border-t-transparent animate-spin" />
        ) : (
          <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
        )}
        <span>{redirecting ? 'Mengarahkan ke Google...' : 'Lanjutkan dengan Google'}</span>
      </button>

      {!clientId && <p className="m-0 mt-2 text-center text-xs text-red-500">VITE_GOOGLE_CLIENT_ID belum diset.</p>}
      {error && <p className="m-0 mt-2 text-center text-xs text-red-500">{error}</p>}

      {showFallback || error ? (
        <div className="mt-3">
          <InAppBrowserNotice appName={appName} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowFallback(true)}
          className="mx-auto mt-3 block bg-transparent text-xs text-ld-slate underline"
        >
          Login tidak berhasil? Buka di browser
        </button>
      )}
    </div>
  );
};

export default InAppGoogleLogin;
