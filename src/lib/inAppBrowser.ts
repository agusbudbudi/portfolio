// In-app browsers (Threads, Instagram, Facebook, TikTok, LINE, ...) are
// embedded webviews. Google blocks OAuth there (`disallowed_useragent`) and
// the Google Sign-In popup opens as a blank page that never reports back,
// so login can only work after the user moves to a real browser.

const IN_APP_PATTERNS: Array<[name: string, re: RegExp]> = [
  ['Threads', /Barcelona/i], // Threads app identifies itself as "Barcelona"
  ['Instagram', /Instagram/i],
  ['Facebook', /FBAN|FBAV|FB_IAB|FBIOS/i],
  ['Messenger', /MessengerForiOS|Orca-Android/i],
  ['TikTok', /musical_ly|BytedanceWebview|TikTok/i],
  ['LINE', /\bLine\//],
  ['LinkedIn', /LinkedInApp/i],
  ['X', /Twitter/i],
  ['Snapchat', /Snapchat/i],
];

/** Name of the in-app browser, or null when this looks like a normal browser. */
export function detectInAppBrowser(ua: string): string | null {
  for (const [name, re] of IN_APP_PATTERNS) {
    if (re.test(ua)) return name;
  }
  // Generic Android WebView marker ("; wv)") used by most other apps.
  if (/Android/i.test(ua) && /;\s*wv\)/.test(ua)) return 'aplikasi ini';
  return null;
}

export function isAndroid(ua: string): boolean {
  return /Android/i.test(ua);
}

/**
 * Android intent URL that opens `url` in Chrome (or the default browser when
 * Chrome is missing, via the fallback). iOS has no equivalent, so callers
 * fall back to copy-link instructions there.
 */
export function androidIntentUrl(url: string): string {
  const u = new URL(url);
  const scheme = u.protocol.replace(':', '');
  const rest = `${u.host}${u.pathname}${u.search}${u.hash}`;
  return `intent://${rest}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}

export function currentInAppBrowser(): string | null {
  if (typeof navigator === 'undefined') return null;
  return detectInAppBrowser(navigator.userAgent || '');
}
