import React from 'react';

interface LoadingStateProps {
  /** Optional text shown under the spinner. */
  label?: string;
  /** Spinner diameter in px. */
  size?: number;
  /** Extra wrapper classes — control padding/min-height per call site. */
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ label, size = 40, className = 'py-16' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* static track */}
      <div className="absolute inset-0 rounded-full border-[3px] border-ld-ash/40" aria-hidden="true" />
      {/* smooth fading arc, rotating on top of the track */}
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          animationDuration: '1.1s',
          background: 'conic-gradient(from 0deg, transparent 0%, transparent 45%, var(--color-ld-violet) 100%)',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
        }}
        aria-hidden="true"
      />
      <img
        src="/img/mentor-logo.webp"
        alt=""
        className="rounded-full object-contain bg-white shadow-[0_1px_6px_rgba(30,27,75,0.18)]"
        style={{ width: size * 0.56, height: size * 0.56 }}
      />
    </div>
    {label && <p className="text-sm text-ld-slate m-0">{label}</p>}
  </div>
);

export default LoadingState;
