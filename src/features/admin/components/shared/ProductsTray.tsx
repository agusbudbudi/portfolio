import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MentoringIcon, QaLibraryIcon, QaPortfolioIcon, QaSimulatorIcon } from '../../../../components/illustration/ProductIcons';
import PremiumBadge from '../../../../components/common/PremiumBadge';

// Shared program catalogue for the header "Program" menu (desktop tray +
// mobile list). Kept separate from the navbar so both views stay in sync.

type ProductIcon = React.FC<{ size?: number; className?: string }>;

interface ProductEntry {
  icon: ProductIcon;
  name: string;
  desc: string;
  to: string;
  badge?: string;
  /** Paid product — shows the gold "Berbayar" label. */
  paid?: boolean;
}

const PRODUCTS: ProductEntry[] = [
  { icon: QaSimulatorIcon, name: 'QA Simulator', desc: 'Simulasi kerja QA dengan PRD, tim, dan aplikasi staging berisi bug.', to: '/qa-simulator', badge: 'New' },
  { icon: QaLibraryIcon, name: 'QA Library', desc: 'Artikel praktis dari fundamental testing sampai automation.', to: '/qa-library' },
  { icon: QaPortfolioIcon, name: 'Portfolio QA', desc: 'Portfolio online gratis dengan link sendiri untuk recruiter.', to: '/portfolio' },
  { icon: MentoringIcon, name: 'Mentoring 1-on-1', desc: 'Sesi personal bareng praktisi: CV, interview, automation.', to: '/mentoring', paid: true },
];

const Badge: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-ld-violet text-white text-[10px] font-semibold leading-none tracking-wide">{text}</span>
);

/** Desktop tray: 4 product cards under the header, plus a footer strip. */
export const ProductsTrayPanel: React.FC<{ onNavigate: () => void; id: string }> = ({ onNavigate, id }) => (
  <div id={id} role="region" aria-label="Program Mentor.QA" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
    <ul className="m-0 p-0 list-none grid grid-cols-4 gap-3">
      {PRODUCTS.map(({ icon: Icon, name, desc, to, badge, paid }) => (
        <li key={to}>
          <Link
            to={to}
            onClick={onNavigate}
            className={`group relative overflow-hidden flex flex-col h-full rounded-xl border p-4 no-underline transition-colors ${
              paid
                ? 'border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 hover:border-amber-400'
                : 'border-ld-frost bg-white hover:border-ld-violet/50 hover:bg-ld-cloud/50'
            }`}
          >
            <Icon size={44} />
            <span className="mt-3 flex items-center gap-2 text-sm font-semibold text-ld-onyx group-hover:text-ld-violet transition-colors">
              {name} {badge && <Badge text={badge} />} {paid && <PremiumBadge />}
            </span>
            <span className="mt-1 text-xs text-ld-slate leading-relaxed">{desc}</span>
            <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-medium text-ld-violet opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
              Buka <ArrowRight size={12} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
    <div className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-ld-cloud px-4 py-3 text-xs text-ld-slate">
      <span>Satu akun gratis untuk semua program. Mentoring 1-on-1 tersedia sebagai sesi berbayar.</span>
      <Link to="/#program" onClick={onNavigate} className="inline-flex items-center gap-1 font-medium text-ld-violet no-underline hover:underline">
        Bandingkan semua program <ArrowRight size={12} />
      </Link>
    </div>
  </div>
);

/** Mobile list: compact rows with icon, name and one-line description. */
export const ProductsMobileList: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => (
  <ul className="m-0 p-0 list-none">
    {PRODUCTS.map(({ icon: Icon, name, desc, to, badge, paid }) => (
      <li key={to}>
        <Link to={to} onClick={onNavigate} className="flex items-center gap-3 px-6 py-3 no-underline hover:bg-ld-cloud transition-colors">
          <Icon size={36} className="shrink-0" />
          <span className="min-w-0">
            <span className="flex items-center gap-2 text-[15px] font-medium text-ld-graphite">{name} {badge && <Badge text={badge} />} {paid && <PremiumBadge />}</span>
            <span className="block text-xs text-ld-slate truncate">{desc}</span>
          </span>
        </Link>
      </li>
    ))}
  </ul>
);
