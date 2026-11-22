import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import AdminDashboard from '../components/shared/AdminDashboard';
import MemberDashboard from '../components/shared/MemberDashboard';
import { Snackbar } from '../components/shared/Snackbar';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';
import Seo from '../../../components/common/Seo';

const AdminPage: React.FC = () => {
  const { token, user } = useAdminAuthStore();
  const location = useLocation();

  if (!token || !user) {
    const redirectTarget = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  const isAdmin = user.roles.includes('admin');

  return (
    <div className="min-h-screen bg-ld-cloud font-ld-sans">
      <Seo
        path="/dashboard"
        title={isAdmin ? 'Admin Dashboard | Mentor.QA' : 'Dashboard | Mentor.QA'}
        description={isAdmin ? 'Dashboard admin mentoring QA.' : 'Dashboard Mentor.QA: QA Simulator, portfolio, dan mentoring.'}
        noindex
      />
      {isAdmin ? <AdminDashboard /> : <MemberDashboard />}
      <Snackbar />
      <ConfirmationDialog />
    </div>
  );
};

export default AdminPage;
