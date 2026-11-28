import React from 'react';

// Eyebrow pill above landing-page headlines (Home, QA Simulator, Portfolio,
// Mentoring). One place for its look so every landing stays in sync.
//
// tone:  'light'  white pill on a light canvas (hero)
//        'onBlue' translucent pill on a blue band (final CTA)
// dot:   'pulse'  brand dot that softly pulses (default)
//        'live'   green ping, for "available now" style messages
//        'static' plain dot
// icon:  illustration that replaces the dot (e.g. FreeGiftIcon)

type Tone = 'light' | 'onBlue';
type Dot = 'pulse' | 'live' | 'static';

const TONE_CLASSES: Record<Tone, { pill: string; dot: string }> = {
  light: { pill: 'border border-ld-lavender bg-white text-ld-violet', dot: 'bg-ld-violet' },
  onBlue: { pill: 'bg-white/10 text-white', dot: 'bg-ld-lilac' },
};

interface HeroBadgeProps {
  children: React.ReactNode;
  tone?: Tone;
  dot?: Dot;
  className?: string;
  icon?: React.ReactNode;
}

const HeroBadge: React.FC<HeroBadgeProps> = ({ children, tone = 'light', dot = 'pulse', className = 'mb-6', icon }) => {
  const t = TONE_CLASSES[tone];
  return (
    <div className={`inline-flex items-center gap-2 rounded-full text-xs font-medium ${icon ? 'py-1 pl-1 pr-3' : 'px-3 py-1.5'} ${t.pill} ${className}`}>
      {icon ? (
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ld-lilac">{icon}</span>
      ) : dot === 'live' ? (
        <span aria-hidden="true" className="relative flex w-1.5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-emerald-400 motion-safe:animate-ping opacity-75" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${t.dot} ${dot === 'pulse' ? 'motion-safe:animate-pulse' : ''}`} />
      )}
      <span>{children}</span>
    </div>
  );
};

export default HeroBadge;
