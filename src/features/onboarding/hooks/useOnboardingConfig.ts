import { useEffect, useState } from 'react';
import { apiGetOnboardingConfig } from '../../../lib/adminApi';
import { DEFAULT_ONBOARDING_CONFIG, isOnboardingConfig } from '../../../lib/onboarding';
import type { OnboardingConfig } from '../../../types/onboarding';

// Starts with the bundled default so the first question renders instantly,
// then swaps in the server config (admin-tunable). Without /api (plain
// `npm run dev`) the default simply stays.
export function useOnboardingConfig(): OnboardingConfig {
  const [config, setConfig] = useState<OnboardingConfig>(DEFAULT_ONBOARDING_CONFIG);

  useEffect(() => {
    let cancelled = false;
    apiGetOnboardingConfig()
      .then((remote) => { if (!cancelled && isOnboardingConfig(remote)) setConfig(remote); })
      .catch(() => { /* keep default */ });
    return () => { cancelled = true; };
  }, []);

  return config;
}
