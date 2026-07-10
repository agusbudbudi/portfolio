import React from 'react';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';

const AdminPage: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);

  return (
    <div className="min-h-screen bg-ld-cloud font-ld-sans">
      {token ? <AdminDashboard /> : <LoginScreen />}
    </div>
  );
};

export default AdminPage;
