import React from 'react';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';

// Compact page banner for the member dashboard (QA Simulator, Mentoring, …):
// white on the left where the copy sits, fading into the primary blue on the
// right behind a white-card illustration and the brand pixel mosaic.

interface DashboardBannerProps {
  title: React.ReactNode;
  description: React.ReactNode;
  /** Optional buttons/links under the description. */
  actions?: React.ReactNode;
  /** Right-side art, sized by the banner (hidden below md). */
  illustration?: React.ReactNode;
}

const DashboardBanner: React.FC<DashboardBannerProps> = ({ title, description, actions, illustration }) => (
  <div className="relative overflow-hidden rounded-xl border border-l-0 border-ld-frost/70 bg-[linear-gradient(100deg,#ffffff_0%,#ffffff_45%,var(--color-ld-lilac)_70%,var(--color-ld-violet)_100%)] shadow-[0_4px_18px_rgba(30,27,75,0.035)]">
    <PixelMosaic variant="white" className="absolute -top-2 right-4 opacity-80" style={{ width: 'min(30%, 160px)' }} />
    <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 md:px-6">
      <div className="min-w-0">
        <p className="m-0 font-ld-display text-base font-semibold tracking-[-0.01em] leading-snug text-ld-onyx">{title}</p>
        <div className="m-0 mt-0.5 text-sm text-ld-slate leading-snug max-w-xl">{description}</div>
        {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {illustration && <div className="hidden md:block w-[140px] -my-6 [&>svg]:w-full [&>svg]:h-auto">{illustration}</div>}
    </div>
  </div>
);

export default DashboardBanner;
