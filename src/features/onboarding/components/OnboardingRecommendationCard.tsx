import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { apiGetOnboardingMe } from '../../../lib/adminApi';
import { programHref } from '../../../lib/onboarding';
import type { OnboardingMeResponse, ProgramCatalogEntry, ProgramId } from '../../../types/onboarding';
import { useOnboardingConfig } from '../hooks/useOnboardingConfig';
import ProgramIcon from './ProgramIcon';
import PriceBadge from './PriceBadge';

const DISMISS_KEY = 'onboarding-card-dismissed';

function readDismissed(userId: string): boolean {
  try { return localStorage.getItem(`${DISMISS_KEY}:${userId}`) === '1'; } catch { return false; }
}

// Member dashboard home card (PRD FR-10/11):
//  A) has a result → recommended program + CTA, secondary, "Ulangi pertanyaan"
//  B) skipped / no result → invite to take the questionnaire (dismissible)
// Renders nothing while loading or when /api is unavailable.
const OnboardingRecommendationCard: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);
  const userId = useAdminAuthStore((s) => s.user?.id ?? null);
  const config = useOnboardingConfig();
  const storedStatus = useAdminAuthStore((s) => s.user?.onboardingStatus);
  const setOnboardingStatus = useAdminAuthStore((s) => s.setOnboardingStatus);
  const [me, setMe] = useState<OnboardingMeResponse | null>(null);
  const [dismissed, setDismissed] = useState(() => (userId ? readDismissed(userId) : false));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiGetOnboardingMe(token)
      .then((res) => { if (!cancelled) setMe(res); })
      .catch(() => { /* hide card */ });
    return () => { cancelled = true; };
  }, [token]);

  // Keep the stored session in sync with the server (e.g. onboarding finished
  // on another device), so the OnboardingGate stops redirecting.
  useEffect(() => {
    if (me && storedStatus && me.status !== storedStatus) setOnboardingStatus(me.status);
  }, [me, storedStatus, setOnboardingStatus]);

  const catalog = useMemo(() => new Map<ProgramId, ProgramCatalogEntry>(config.catalog.map((c) => [c.id, c])), [config.catalog]);

  if (!me) return null;

  const latest = me.latest;
  // Walk the stored ranking and keep programs still active in the catalog, so a
  // deactivated/removed primary promotes the next one instead of falling back
  // to the "take the questionnaire" invite.
  const available = (items: { id: ProgramId }[]) =>
    items.map((p) => catalog.get(p.id)).filter((p): p is ProgramCatalogEntry => !!p && p.isActive);
  const top = latest ? available([latest.recommendation.primary, ...latest.recommendation.secondary]) : [];
  const primary = top[0] ?? (latest ? available(latest.recommendation.others)[0] : undefined);
  // "Coba juga" stays limited to the recommended secondaries, as before.
  const secondary = top[0] ? top[1] : undefined;

  if (latest && primary) {
    return (
      <section className="rounded-xl border border-ld-frost/60 bg-white px-5 py-4 md:px-6 shadow-[0_4px_18px_rgba(30,27,75,0.035)] flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3.5">
          <ProgramIcon id={primary.id} size={44} className="shrink-0" />
          <div className="flex-1 min-w-[180px] flex flex-col gap-0.5">
            <span className="text-[13px] text-ld-slate">Program rekomendasimu</span>
            <span className="flex items-center gap-2">
              <span className="font-ld-display font-semibold text-xl tracking-[-0.02em] text-ld-onyx">{primary.name}</span>
              <PriceBadge program={primary} />
            </span>
          </div>
          <Link
            to={programHref(primary, 'dashboard')}
            className="inline-flex items-center gap-2 h-11 px-[18px] rounded-lg bg-ld-midnight text-white text-[15px] font-medium no-underline hover:bg-ld-onyx transition-colors cursor-pointer"
          >
            {primary.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-ld-frost">
          {secondary ? (
            <Link to={programHref(secondary, 'dashboard')} className="inline-flex items-center gap-2 min-h-11 text-sm text-ld-graphite no-underline hover:underline underline-offset-4 cursor-pointer">
              Coba juga: <span className="font-semibold text-ld-onyx">{secondary.name}</span>
              <PriceBadge program={secondary} />
            </Link>
          ) : <span />}
          <Link to="/onboarding?next=%2Fdashboard" className="inline-flex items-center h-11 text-[13px] font-medium text-ld-slate underline underline-offset-[3px] decoration-ld-fog hover:text-ld-graphite cursor-pointer">
            Ulangi pertanyaan
          </Link>
        </div>
      </section>
    );
  }

  if (dismissed || !userId) return null;

  return (
    <section className="rounded-xl border border-ld-frost/60 bg-white px-5 py-4 md:px-6 shadow-[0_4px_18px_rgba(30,27,75,0.035)] flex flex-wrap items-center gap-4">
      <div className="relative w-9 h-9 shrink-0" aria-hidden="true">
        <span className="absolute left-5 top-0 w-4 h-4 rounded-[3px] bg-ld-violet" />
        <span className="absolute left-0 top-5 w-4 h-4 rounded-[3px] bg-ld-lavender" />
        <span className="absolute left-5 top-5 w-4 h-4 rounded-[3px] bg-ld-lilac" />
      </div>
      <div className="flex-1 min-w-[180px] flex flex-col gap-0.5">
        <span className="font-ld-display font-semibold text-lg tracking-[-0.01em] text-ld-onyx">Temukan program yang cocok untukmu</span>
        <span className="text-sm text-ld-slate">4 pertanyaan, kurang dari 1 menit.</span>
      </div>
      <Link
        to="/onboarding?next=%2Fdashboard"
        className="inline-flex items-center h-11 px-[18px] rounded-lg bg-ld-midnight text-white text-[15px] font-medium no-underline hover:bg-ld-onyx transition-colors cursor-pointer"
      >
        Mulai
      </Link>
      <button
        type="button"
        aria-label="Sembunyikan kartu"
        onClick={() => {
          try { localStorage.setItem(`${DISMISS_KEY}:${userId}`, '1'); } catch { /* ignore */ }
          setDismissed(true);
        }}
        className="-mr-2 w-11 h-11 flex items-center justify-center rounded-lg text-ld-steel hover:bg-ld-cloud transition-colors cursor-pointer"
      >
        <X size={18} />
      </button>
    </section>
  );
};

export default OnboardingRecommendationCard;
