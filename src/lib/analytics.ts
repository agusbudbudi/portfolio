import type { PostHog } from 'posthog-js';

// Product analytics (PostHog). Thin wrapper so the rest of the app never
// imports posthog-js directly:
// - posthog-js is loaded with a dynamic import when the browser is idle, so it
//   stays out of the main chunk and doesn't delay the LCP on "/" and /programs.
// - Calls made before it loads are queued and replayed after init.
// - No-op without VITE_POSTHOG_KEY, and outside production builds unless
//   VITE_POSTHOG_DEBUG=1 (keeps local dev clicks out of the real data).
//
// Requests go to /ingest, a same-origin Vercel rewrite to PostHog (vercel.json),
// so the CSP stays 'self' and ad blockers drop fewer events.

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const DEBUG = import.meta.env.VITE_POSTHOG_DEBUG === '1';
const ENABLED = Boolean(KEY) && (import.meta.env.PROD || DEBUG);
// Must match the region of the rewrite targets in vercel.json.
const UI_HOST = (import.meta.env.VITE_POSTHOG_UI_HOST as string | undefined) ?? 'https://us.posthog.com';

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

type Call = (ph: PostHog) => void;

let client: PostHog | null = null;
let started = false;
const queue: Call[] = [];

function run(call: Call): void {
  if (!ENABLED) return;
  if (client) call(client);
  else queue.push(call);
}

function whenIdle(fn: () => void): void {
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 3000 });
  else setTimeout(fn, 1500);
}

/** Call once at startup. Safe to call when analytics is disabled. */
export function initAnalytics(): void {
  if (!ENABLED || started) return;
  started = true;
  whenIdle(() => {
    import('posthog-js')
      .then(({ default: posthog }) => {
        posthog.init(KEY!, {
          api_host: '/ingest',
          ui_host: UI_HOST,
          defaults: '2025-05-24',
          // SPA: one $pageview per React Router navigation.
          capture_pageview: 'history_change',
          // Anonymous visitors don't create person profiles (cheaper);
          // identifyUser() upgrades them on login.
          person_profiles: 'identified_only',
          session_recording: { maskAllInputs: true },
          debug: DEBUG,
        });
        client = posthog;
        queue.splice(0).forEach((call) => call(posthog));
      })
      .catch(() => {
        // Analytics must never break the app (offline, blocked chunk).
        queue.length = 0;
      });
  });
}

/** Custom event. Names are snake_case `<object>_<verb past tense>`, e.g. `program_card_clicked`. */
export function track(event: string, props?: AnalyticsProps): void {
  run((ph) => ph.capture(event, props));
}

/** Link this browser's (guest) history to the logged-in account. */
export function identifyUser(user: AnalyticsUser): void {
  run((ph) => ph.identify(user.id, { email: user.email, name: user.name, roles: user.roles }));
}

/** On logout: start a fresh anonymous id so the next person isn't merged in. */
export function resetUser(): void {
  run((ph) => ph.reset());
}
