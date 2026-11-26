import React from 'react';
import { MentoringIcon, QaCourseIcon, QaLibraryIcon, QaPortfolioIcon, QaSimulatorIcon } from '../../../../components/illustration/ProductIcons';
import type { ProgramId } from '../data/programs';

const ICONS: Record<ProgramId, React.FC<{ size?: number; className?: string }>> = {
  course: QaCourseIcon,
  simulator: QaSimulatorIcon,
  library: QaLibraryIcon,
  portfolio: QaPortfolioIcon,
  mentoring: MentoringIcon,
};

/** Existing product icons, keyed by program id. Decorative (aria-hidden by parents' text). */
export const ProgramIcon: React.FC<{ id: ProgramId; size?: number; className?: string }> = ({ id, size = 40, className }) => {
  const Icon = ICONS[id];
  return <Icon size={size} className={className} />;
};
