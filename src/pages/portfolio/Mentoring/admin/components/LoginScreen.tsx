import React, { useState } from 'react';
import { useAdminAuthStore } from '../../../../../store/useAdminAuthStore';
import { UnauthorizedError } from '../../../../../lib/adminApi';

const LoginScreen: React.FC = () => {
  const { login, loggingIn } = useAdminAuthStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(password);
    } catch (err) {
      setError(
        err instanceof UnauthorizedError
          ? 'Password salah.'
          : 'Gagal login. Coba lagi.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-ld-frost shadow-sm p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/img/mentor-logo.webp"
            alt="Mentor.QA"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl object-contain shrink-0"
          />
          <div>
            <h1 className="text-lg font-semibold text-ld-onyx m-0">Mentor.QA Admin</h1>
            <p className="text-xs text-ld-fog m-0">Masuk untuk mengelola Mentoring</p>
          </div>
        </div>

        <label className="block text-xs font-medium uppercase tracking-widest text-ld-fog mb-2" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          autoFocus
          className="w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac"
        />

        {error && <p className="mt-3 text-sm text-red-500 m-0">{error}</p>}

        <button
          type="submit"
          disabled={loggingIn || password.length === 0}
          className="mt-6 w-full py-3 rounded-lg bg-ld-violet hover:bg-[#1f87e6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors cursor-pointer border-none"
        >
          {loggingIn ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
