import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { androidIntentUrl, isAndroid } from '../../lib/inAppBrowser';

interface InAppBrowserNoticeProps {
  /** Detected app name, e.g. "Threads". */
  appName: string;
}

// Fallback for in-app browsers when the redirect login (InAppGoogleLogin)
// still fails: move the user to a real browser.
const InAppBrowserNotice: React.FC<InAppBrowserNoticeProps> = ({ appName }) => {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const android = typeof navigator !== 'undefined' && isAndroid(navigator.userAgent || '');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older webviews without the async clipboard API.
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
      <p className="m-0 text-sm font-semibold text-ld-onyx">Buka di browser untuk login</p>
      <p className="m-0 mt-1 text-xs leading-relaxed text-ld-slate">
        Login dari browser bawaan {appName} kadang diblokir.{' '}
        {android
          ? 'Ketuk tombol di bawah untuk membuka halaman ini di Chrome.'
          : 'Ketuk ikon ••• di pojok kanan atas, lalu pilih "Buka di browser", atau salin link lalu tempel di Safari.'}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {android && (
          <a
            href={androidIntentUrl(url)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-ld-violet text-sm font-medium text-white no-underline"
          >
            <ExternalLink size={16} /> Buka di Chrome
          </a>
        )}
        <button
          type="button"
          onClick={copyLink}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dadce0] bg-white text-sm font-medium text-ld-onyx"
        >
          {copied ? <><Check size={16} /> Link tersalin</> : <><Copy size={16} /> Salin link</>}
        </button>
      </div>
    </div>
  );
};

export default InAppBrowserNotice;
