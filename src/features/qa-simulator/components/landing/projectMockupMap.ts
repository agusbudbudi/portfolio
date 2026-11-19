import type React from 'react';
import { DompetKuMockup, SplitBillMockup, TokoKitaMockup } from './ProjectMockups';

// Project id → phone mockup + panel background for the "Pilih project" cards.
export const PROJECT_MOCKUPS: Record<string, { Mockup: React.FC; bg: string }> = {
  splitbill: { Mockup: SplitBillMockup, bg: 'bg-gradient-to-br from-teal-50 to-emerald-100' },
  ewallet: { Mockup: DompetKuMockup, bg: 'bg-gradient-to-br from-indigo-50 to-violet-100' },
  ecommerce: { Mockup: TokoKitaMockup, bg: 'bg-gradient-to-br from-orange-50 to-amber-100' },
};
