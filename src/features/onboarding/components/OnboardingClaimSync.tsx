import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { hasPendingClaim, useOnboardingClaimStore } from '../claimStore';

// The single owner of the automatic claim: saves a guest's armed onboarding
// answers to the account as soon as a session exists (Google popup on the
// result page, or the page an in-app browser's redirect login returns to).
// A failed attempt (network, 5xx) is retried on the next navigation.
// Mounted once at the app root, next to OnboardingGate.
const OnboardingClaimSync: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);
  const armed = useOnboardingClaimStore((s) => s.armed);
  const claim = useOnboardingClaimStore((s) => s.claim);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!token || !hasPendingClaim()) return;
    const { state } = useOnboardingClaimStore.getState();
    if (state === 'idle' || state === 'error') void claim();
  }, [token, armed, pathname, claim]);

  return null;
};

export default OnboardingClaimSync;
