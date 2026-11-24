import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';
import { loadGoogleIdentity } from '../../lib/loadGoogleIdentity';
import { currentInAppBrowser } from '../../lib/inAppBrowser';
import InAppGoogleLogin from './InAppGoogleLogin';

// Static for the page's lifetime.
const inAppBrowser = currentInAppBrowser();

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  text?: 'signin_with' | 'continue_with';
}

// Official Google Identity Services button, rendered in place so a click opens
// Google's account chooser popup directly (no redirect to /login). The ID token
// goes through the same `login()` as the login page.
const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError, text = 'continue_with' }) => {
  const login = useAdminAuthStore((s) => s.login);
  const loggingIn = useAdminAuthStore((s) => s.loggingIn);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  // Keep the latest callbacks without re-initialising GIS on every render.
  const handlers = useRef({ onSuccess, onError });
  useEffect(() => { handlers.current = { onSuccess, onError }; });

  useEffect(() => {
    if (!clientId || inAppBrowser) return;
    let cancelled = false;

    const init = () => {
      const el = containerRef.current;
      if (cancelled || !window.google || !el) return;
      setLoadError(null);
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await login(response.credential);
            handlers.current.onSuccess?.();
          } catch {
            handlers.current.onError?.('Gagal login. Coba lagi.');
          }
        },
      });
      window.google.accounts.id.renderButton(el, {
        type: 'standard',
        theme: 'filled_blue',
        size: 'large',
        text,
        shape: 'rectangular',
        width: Math.min(400, Math.max(200, el.offsetWidth)),
      });
    };

    // Inject the GSI script on demand; the shared promise retries on failure.
    loadGoogleIdentity().then(init, () => {
      if (!cancelled) setLoadError('Gagal memuat Google Sign-In. Coba refresh halaman.');
    });
    return () => { cancelled = true; };
  }, [clientId, login, text]);

  // Popup login opens blank in in-app browsers; use a same-tab redirect.
  if (inAppBrowser) return <InAppGoogleLogin appName={inAppBrowser} />;

  const error = !clientId ? 'VITE_GOOGLE_CLIENT_ID belum diset.' : loadError;

  return (
    <div className="w-full">
      <div className="relative w-full min-h-[44px] flex justify-center">
        <div ref={containerRef} className={`w-full flex justify-center ${loggingIn ? 'invisible' : ''}`} />
        {loggingIn && (
          <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-ld-slate">
            <Loader2 size={16} className="animate-spin" /> Menghubungkan ke Google…
          </span>
        )}
      </div>
      {error && <p className="m-0 mt-2 text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
};

export default GoogleSignInButton;
