import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { apiGetOnboardingMe } from '../../../lib/adminApi';

// PRD FR-1: a freshly registered user (status 'pending') is always sent to
// onboarding first, whichever login entry point they used (/login page or
// an in-place Google popup like the QA Simulator's). The page they were on
// rides along as `next` so they can continue there afterwards.
//
// The stored session's status is a snapshot from login, so before the first
// redirect of a session it's re-checked against /api/onboarding/me: a user who
// finished or skipped onboarding on another device isn't sent back to it.
const OnboardingGate: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);
  const status = useAdminAuthStore((s) => s.user?.onboardingStatus);
  const setOnboardingStatus = useAdminAuthStore((s) => s.setOnboardingStatus);
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const verifiedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token || status !== 'pending') return;
    if (pathname.startsWith('/onboarding') || pathname.startsWith('/login')) return;
    const target = `/onboarding?next=${encodeURIComponent(pathname + search)}`;

    if (verifiedToken.current === token) {
      navigate(target, { replace: true });
      return;
    }
    let cancelled = false;
    apiGetOnboardingMe(token)
      .then(({ status: serverStatus }) => {
        if (cancelled) return;
        verifiedToken.current = token;
        if (serverStatus !== 'pending') setOnboardingStatus(serverStatus);
        else navigate(target, { replace: true });
      })
      .catch(() => {
        // No /api (plain dev) or offline: trust the stored status.
        if (cancelled) return;
        verifiedToken.current = token;
        navigate(target, { replace: true });
      });
    return () => { cancelled = true; };
  }, [token, status, pathname, search, navigate, setOnboardingStatus]);

  return null;
};

export default OnboardingGate;
