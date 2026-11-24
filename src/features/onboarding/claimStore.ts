import { create } from 'zustand';
import { ApiError, UnauthorizedError, apiSubmitOnboarding } from '../../lib/adminApi';
import { ONBOARDING_CLAIM_KEY, parseParkedClaim, serializeClaim, type ParkedClaim } from '../../lib/onboarding';
import { track } from '../../lib/analytics';
import { useAdminAuthStore } from '../../store/useAdminAuthStore';
import type { OnboardingAnswers, OnboardingRecommendation } from '../../types/onboarding';

// Guest onboarding answers waiting to be saved to an account (PRD "Onboarding
// Guest", S1-S3).
//
// - The answers are parked in localStorage (survives the same-tab redirect
//   login of in-app browsers) and mirrored in memory (private mode).
// - A claim only happens when it is ARMED in this tab: the guest saw the
//   claim card on the result page. The flag lives in sessionStorage (+ memory),
//   so it survives the redirect login but not a new visit. Without it, answers
//   left on a shared device would be saved to whoever logs in next.
// - OnboardingClaimSync is the only code path that claims automatically; the
//   result page only arms it, hands over in-memory answers and offers a retry.

const ARMED_KEY = 'onboarding-claim-armed';

export function readParkedClaim(): ParkedClaim | null {
  try {
    const claim = parseParkedClaim(localStorage.getItem(ONBOARDING_CLAIM_KEY), Date.now());
    if (!claim) localStorage.removeItem(ONBOARDING_CLAIM_KEY);
    return claim;
  } catch {
    return null;
  }
}

export function parkClaim(answers: OnboardingAnswers, version: number): void {
  useOnboardingClaimStore.setState({ fallback: answers });
  try { localStorage.setItem(ONBOARDING_CLAIM_KEY, serializeClaim(answers, version, Date.now())); } catch { /* memory copy still works in-page */ }
}

/** Drops the parked answers and disarms (claimed, abandoned, or outdated). */
export function clearParkedClaim(): void {
  useOnboardingClaimStore.setState({ fallback: null, armed: false });
  try {
    localStorage.removeItem(ONBOARDING_CLAIM_KEY);
    sessionStorage.removeItem(ARMED_KEY);
  } catch { /* ignore */ }
}

/** The guest is looking at the claim card: a login in this tab may claim. */
export function armClaim(): void {
  useOnboardingClaimStore.setState({ armed: true });
  try { sessionStorage.setItem(ARMED_KEY, '1'); } catch { /* memory flag still works in-page */ }
}

function isArmed(): boolean {
  if (useOnboardingClaimStore.getState().armed) return true;
  try { return sessionStorage.getItem(ARMED_KEY) === '1'; } catch { return false; }
}

function pendingAnswers(): OnboardingAnswers | null {
  return readParkedClaim()?.answers ?? useOnboardingClaimStore.getState().fallback;
}

/** Armed answers waiting for a session (used by the sync and OnboardingGate). */
export function hasPendingClaim(): boolean {
  return isArmed() && pendingAnswers() !== null;
}

export type ClaimState = 'idle' | 'saving' | 'saved' | 'error' | 'outdated';

interface ClaimStore {
  state: ClaimState;
  armed: boolean;
  /** In-memory copy of the parked answers (storage may be unavailable). */
  fallback: OnboardingAnswers | null;
  /** The claim just saved, for a page that mounts after it finished (redirect
   *  login). Taken once by that page; cleared on logout. */
  claimed: { answers: OnboardingAnswers; recommendation: OnboardingRecommendation } | null;
  claim: () => Promise<void>;
  takeClaimed: () => ClaimStore['claimed'];
  reset: () => void;
}

export const useOnboardingClaimStore = create<ClaimStore>((set, get) => ({
  state: 'idle',
  armed: false,
  fallback: null,
  claimed: null,

  claim: async () => {
    const { token, user, setOnboardingStatus, logout } = useAdminAuthStore.getState();
    if (!token || get().state === 'saving' || !isArmed()) return;
    const answers = pendingAnswers();
    if (!answers) return;
    const isNewUser = user?.onboardingStatus === 'pending';
    set({ state: 'saving' });
    try {
      const { status, result } = await apiSubmitOnboarding(answers, token);
      clearParkedClaim();
      setOnboardingStatus(status);
      set({ state: 'saved', claimed: { answers, recommendation: result.recommendation } });
      track('onboarding_claimed', { primary: result.recommendation.primary.id, new_user: isNewUser });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        // Stale session: sign out so the claim card offers Google again; the
        // answers stay parked and armed for that login.
        set({ state: 'idle' });
        logout();
        return;
      }
      if (err instanceof ApiError && err.status === 400) {
        // invalid_answers: the questionnaire changed since the guest answered.
        clearParkedClaim();
        set({ state: 'outdated' });
        return;
      }
      // Network, 5xx, 429, …: keep the answers. OnboardingClaimSync retries on
      // the next navigation, the result page has a retry button.
      set({ state: 'error' });
    }
  },

  takeClaimed: () => {
    const claimed = get().claimed;
    if (claimed) set({ claimed: null });
    return claimed;
  },

  reset: () => set({ state: 'idle', armed: false, fallback: null, claimed: null }),
}));

// Logout (or a session replaced by another account) must not carry a previous
// user's claim state or answers into the next session.
useAdminAuthStore.subscribe((s, prev) => {
  if (prev.token && s.token !== prev.token && !s.token) {
    const { state } = useOnboardingClaimStore.getState();
    // A 401 during a claim logs out on purpose and keeps the armed answers.
    if (state === 'idle' && hasPendingClaim()) return;
    clearParkedClaim();
    useOnboardingClaimStore.getState().reset();
  }
});
