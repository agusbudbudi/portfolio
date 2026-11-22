import React from 'react';
import { ADMIN_CARD, ADMIN_CARD_BODY } from './adminCard';
import DashboardCardHeader, { type DashboardCardHeaderProps } from './DashboardCardHeader';

// Member-dashboard section card: ADMIN_CARD shell + DashboardCardHeader +
// padded body. Use this for every top-level card (Portfolio, Booking,
// QA Simulator, …) so shell, header and body spacing stay identical.

interface DashboardCardProps extends DashboardCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '', ...header }) => (
  <section className={`${ADMIN_CARD} ${className}`}>
    <DashboardCardHeader {...header} />
    <div className={ADMIN_CARD_BODY}>{children}</div>
  </section>
);

export default DashboardCard;
