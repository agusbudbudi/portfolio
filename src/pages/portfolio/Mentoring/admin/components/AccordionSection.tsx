import React, { useEffect, useState } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';

// Shared collapsible section wrapper for the Portfolio form — profile,
// experience, project, endorsement, and social-media blocks all use this
// instead of a bare <section>, since the form has grown too long to keep
// everything expanded at once. Collapsed by default (defaultOpen=false).
interface AccordionSectionProps {
  title: string;
  icon?: LucideIcon;
  badge?: string | number;
  defaultOpen?: boolean;
  // hasError + errorSignal: force the section open on a failed submit
  // attempt without taking over ordinary user toggling. errorSignal is a
  // counter (e.g. submit attempt count) — bump it to re-force-open even if
  // the section was manually closed again since the last failed attempt.
  hasError?: boolean;
  errorSignal?: number;
  children: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title, icon: Icon, badge, defaultOpen = false, hasError, errorSignal, children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (hasError && errorSignal) setOpen(true);
    // Only react to a new submit attempt, not to hasError changing on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorSignal]);

  return (
    <div className="rounded-xl border border-ld-frost">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white hover:bg-ld-cloud/40 cursor-pointer border-none text-left transition-colors ${open ? 'rounded-t-xl' : 'rounded-xl'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon size={15} className="text-ld-violet shrink-0" />}
          <span className="text-sm text-ld-steel">{title}</span>
          {badge !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-ld-lilac text-ld-violet text-[10px] font-medium shrink-0">{badge}</span>
          )}
          {hasError && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" aria-label="Ada field wajib yang belum diisi" />}
        </div>
        <ChevronDown size={16} className={`text-ld-fog shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-4 border-t border-ld-frost">{children}</div>}
    </div>
  );
};

export default AccordionSection;
