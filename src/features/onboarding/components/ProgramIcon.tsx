import React from 'react';
import { MentoringIcon, QaCourseIcon, QaLibraryIcon, QaPortfolioIcon, QaSimulatorIcon } from '../../../components/illustration/ProductIcons';
import type { ProgramId } from '../../../types/onboarding';

const ICONS: Record<ProgramId, React.FC<{ size?: number; className?: string }>> = {
  course: QaCourseIcon,
  simulator: QaSimulatorIcon,
  portfolio: QaPortfolioIcon,
  mentoring: MentoringIcon,
  library: QaLibraryIcon,
};

const ProgramIcon: React.FC<{ id: ProgramId; size?: number; className?: string }> = ({ id, size = 40, className }) => {
  const Icon = ICONS[id];
  return <Icon size={size} className={className} />;
};

export default ProgramIcon;
