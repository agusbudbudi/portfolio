import React, { useState } from 'react';

interface SquareAvatarProps {
  initials: string;
  /** Tailwind bg-* class (also shown behind / instead of a missing photo). */
  color: string;
  /** Optional photo URL; falls back to initials if absent or it fails to load. */
  src?: string;
  size?: 'sm' | 'md';
  title?: string;
}

// Slack-style rounded-square avatar used by the chat surfaces (phase intro
// modal, brief transcript). TeamAvatar stays round + ringed for cards.
const SquareAvatar: React.FC<SquareAvatarProps> = ({ initials, color, src, size = 'md', title }) => {
  const [broken, setBroken] = useState(false);
  return (
    <span
      title={title}
      aria-hidden={title ? undefined : true}
      className={`inline-flex items-center justify-center rounded-md overflow-hidden text-white font-semibold shrink-0 ${color} ${
        size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-9 h-9 text-xs'
      }`}
    >
      {src && !broken ? (
        <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" onError={() => setBroken(true)} />
      ) : (
        initials
      )}
    </span>
  );
};

export default SquareAvatar;
