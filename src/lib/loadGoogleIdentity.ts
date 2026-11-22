// Injects Google Identity Services (<script src=".../gsi/client">) on first
// use instead of on every page from index.html, so pages without a sign-in
// button (e.g. the landing page) don't download Google's ~90 KB script.
//
// Returns one shared promise that resolves once `window.google` is ready.
// A failed load (network error, blocker) removes the dead <script> tag and
// clears the cache, so the next caller retries instead of waiting forever.

const GSI_SRC = 'https://accounts.google.com/gsi/client';
// Generous: the download only starts when a sign-in button mounts, so slow
// mobile connections need far more than the old 5s poll allowed.
const LOAD_TIMEOUT_MS = 20_000;

let pending: Promise<void> | null = null;

export function loadGoogleIdentity(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no_window'));
  if (window.google) return Promise.resolve();
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    document.querySelector(`script[src="${GSI_SRC}"]`)?.remove();
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;

    const fail = (reason: string) => {
      window.clearTimeout(timer);
      script.remove();
      pending = null;
      reject(new Error(reason));
    };
    const timer = window.setTimeout(() => fail('gsi_timeout'), LOAD_TIMEOUT_MS);

    script.onload = () => {
      window.clearTimeout(timer);
      if (window.google) resolve();
      else fail('gsi_missing');
    };
    script.onerror = () => fail('gsi_network');
    document.head.appendChild(script);
  });
  return pending;
}
