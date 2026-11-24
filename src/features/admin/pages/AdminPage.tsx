import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { selectDashboardView, useDashboardViewStore } from '../../../store/useDashboardViewStore';
import AdminDashboard from '../components/shared/AdminDashboard';
import MemberDashboard from '../components/shared/MemberDashboard';
import { Snackbar } from '../components/shared/Snackbar';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import Seo from '../../../components/common/Seo';

// Sections that only exist in the user (member) view. Links from the public
// pages (course/simulator headers, onboarding) point here, so an admin who
// follows one lands in the user view instead of the admin home.
const USER_ONLY_SECTIONS = new Set(['courses', 'simulator', 'booking', 'mentor']);

const AdminPage: React.FC = () => {
  const { token, user } = useAdminAuthStore();
  const view = useDashboardViewStore(selectDashboardView);
  const forceUserView = useDashboardViewStore((s) => s.forceUserView);
  const location = useLocation();

  const isAdmin = !!user?.roles.includes('admin');
  const section = location.pathname.replace(/^\/dashboard\/?/, '').split('/')[0];
  const onUserOnlySection = isAdmin && USER_ONLY_SECTIONS.has(section);

  // Arriving on a user-only section keeps the admin in the user view while
  // they move around its sidebar. Keyed on the section, not on `view`: when
  // the admin picks "Tampilan Admin" from here, the router applies the
  // navigation to /dashboard in a transition, after the view change has
  // committed, and re-checking on that commit would flip them straight back.
  useEffect(() => {
    if (onUserOnlySection && useDashboardViewStore.getState().chosen === 'admin') forceUserView();
  }, [onUserOnlySection, section, forceUserView]);

  if (!token || !user) {
    const redirectTarget = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  // Render-time check too, so the admin home never flashes before the effect runs.
  const showAdmin = isAdmin && view === 'admin' && !onUserOnlySection;

  return (
    <div className="min-h-screen bg-ld-cloud font-ld-sans">
      <Seo
        path="/dashboard"
        title={showAdmin ? 'Admin Dashboard | Mentor.QA' : 'Dashboard | Mentor.QA'}
        description={showAdmin ? 'Dashboard admin mentoring QA.' : 'Dashboard Mentor.QA: QA Simulator, portfolio, dan mentoring.'}
        noindex
      />
      {/* key: remount on switch so each view starts from its own fresh state. */}
      {showAdmin ? <AdminDashboard key="admin" /> : <MemberDashboard key="user" />}
      <Snackbar />
      <ConfirmationDialog />
    </div>
  );
};

export default AdminPage;
