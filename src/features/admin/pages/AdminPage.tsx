import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import AdminDashboard from '../components/shared/AdminDashboard';
import MemberDashboard from '../components/shared/MemberDashboard';
import { Snackbar } from '../components/shared/Snackbar';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog';

const AdminPage: React.FC = () => {
  const { token, user } = useAdminAuthStore();
  const location = useLocation();

  if (!token || !user) {
    const redirectTarget = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  const content = user.roles.includes('admin') ? <AdminDashboard /> : <MemberDashboard />;

  return (
    <div className="min-h-screen bg-ld-cloud font-ld-sans">
      {content}
      <Snackbar />
      <ConfirmationDialog />
    </div>
  );
};

export default AdminPage;
