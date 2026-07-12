import React from 'react';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';

const NotAdminScreen: React.FC = () => {
  const { user, logout } = useAdminAuthStore();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-ld-frost shadow-sm p-8 text-center">
        <h1 className="text-lg font-semibold text-ld-onyx m-0 mb-2">Akun ini belum punya akses admin</h1>
        <p className="text-sm text-ld-fog m-0 mb-6">
          Masuk sebagai {user?.email}. Hubungi admin untuk meminta akses.
        </p>
        <button
          onClick={logout}
          className="w-full py-3 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium transition-colors cursor-pointer border-none"
        >
          Ganti akun
        </button>
      </div>
    </div>
  );
};

const AdminPage: React.FC = () => {
  const { token, user } = useAdminAuthStore();

  let content: React.ReactNode;
  if (!token || !user) {
    content = <LoginScreen />;
  } else if (!user.roles.includes('admin')) {
    content = <NotAdminScreen />;
  } else {
    content = <AdminDashboard />;
  }

  return <div className="min-h-screen bg-ld-cloud font-ld-sans">{content}</div>;
};

export default AdminPage;
