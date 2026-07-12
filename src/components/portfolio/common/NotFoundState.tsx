import React from 'react';
import { Link } from 'react-router-dom';
import NotFoundIllustration from './NotFoundIllustration';

const NotFoundState: React.FC<{
  illustrationLabel?: string;
  title: string;
  description: string;
  actionTo: string;
  actionLabel: string;
  actionIcon?: React.ReactNode;
  className?: string;
}> = ({ illustrationLabel = '404', title, description, actionTo, actionLabel, actionIcon, className = '' }) => (
  <div className={`text-center ${className}`}>
    <NotFoundIllustration label={illustrationLabel} />
    <h1 className="font-ld-display font-semibold text-2xl sm:text-3xl text-ld-onyx tracking-[-0.02em] mt-6 mb-3">
      {title}
    </h1>
    <p className="text-ld-slate text-sm sm:text-base leading-relaxed mb-8">
      {description}
    </p>
    <Link
      to={actionTo}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3.5 bg-ld-violet text-white font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors text-sm"
    >
      {actionIcon}
      {actionLabel}
    </Link>
  </div>
);

export default NotFoundState;
