import React from 'react';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';

const AdminPage: React.FC = () => {
  const { token, user } = useAdminAuthStore();

  let content: React.ReactNode;
  if (!token || !user) {
    content = <LoginScreen />;
  } else if (user.roles.includes('admin')) {
    content = <AdminDashboard />;
  } else {
    content = <MemberDashboard />;
  }

  return <div className="min-h-screen bg-ld-cloud font-ld-sans">{content}</div>;
};

export default AdminPage;
