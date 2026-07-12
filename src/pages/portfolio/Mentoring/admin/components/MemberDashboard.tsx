import React, { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock, LogOut, UserSquare2, XCircle } from 'lucide-react';
import { useAdminAuthStore } from '../../../../../store/useAdminAuthStore';
import { useMentorProfileStore } from '../../../../../store/useMentorProfileStore';
import { useConfig } from '../../../../../hooks/useConfig';
import LoadingState from '../../../../../components/portfolio/common/LoadingState';
import MentorForm from './MentorForm';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';

// Dashboard home for any logged-in non-admin account (mentee, or mentee +
// mentor). Deliberately one screen for both roles rather than separate
// dashboards — the only real self-serve capability today is the mentor
// application; booking/portfolio self-serve creation don't exist yet
// (booking still points at the existing public WhatsApp flow, portfolio is
// a "coming soon" card).
const MemberDashboard: React.FC = () => {
  const { user, logout } = useAdminAuthStore();
  const { mentor, loading, loadError, load, apply, update } = useMentorProfileStore();
  const { config } = useConfig();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => { load(); }, [load]);

  const isEdit = mentor !== null;
  const topics = config?.topics ?? [];
  const availableDays = config?.availableDays ?? [];
  const existingIds = (config?.mentors ?? []).map((m) => m.id);

  if (formOpen) {
    return (
      <div className="min-h-screen bg-ld-cloud font-ld-sans p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <MentorForm
            onClose={() => setFormOpen(false)}
            onSubmit={async (payload) => {
              const result = isEdit ? await update(payload) : await apply(payload);
              if (result.ok) setFormOpen(false);
              return result;
            }}
            mentor={mentor}
            existingIds={existingIds}
            topics={topics}
            availableDays={availableDays}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ld-cloud font-ld-sans">
      <header className="h-16 flex items-center justify-between gap-3 px-4 md:px-6 bg-white/95 backdrop-blur border-b border-ld-frost/70">
        <div className="flex items-center gap-2.5">
          <img src="/img/mentor-logo.webp" alt="Mentor.QA" width={32} height={32} className="w-8 h-8 rounded-lg object-contain shrink-0" />
          <p className="m-0 text-sm font-semibold text-ld-onyx">Mentor.QA</p>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2.5 min-w-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-ld-lilac text-ld-violet flex items-center justify-center text-sm font-semibold shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block min-w-0">
                <p className="m-0 text-sm font-semibold text-ld-onyx leading-tight truncate">{user.name}</p>
                <p className="m-0 text-[11px] text-ld-fog leading-tight truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/mentoring/booking"
            className={`${ADMIN_CARD} ${ADMIN_CARD_BODY} flex items-center gap-3 no-underline hover:border-ld-violet transition-colors`}
          >
            <CalendarCheck size={22} className="text-ld-violet shrink-0" />
            <div>
              <p className="m-0 text-sm font-semibold text-ld-onyx">Booking Mentoring</p>
              <p className="m-0 text-xs text-ld-fog">Jadwalkan sesi 1:1 dengan mentor.</p>
            </div>
          </a>

          <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY} flex items-center gap-3 opacity-50 cursor-not-allowed`}>
            <UserSquare2 size={22} className="text-ld-fog shrink-0" />
            <div>
              <p className="m-0 text-sm font-semibold text-ld-onyx">Portfolio QA</p>
              <p className="m-0 text-xs text-ld-fog">Segera hadir.</p>
            </div>
          </div>
        </div>

        <div className={ADMIN_CARD}>
          <div className={ADMIN_CARD_HEADER}>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Jadi Mentor</h2>
          </div>
          <div className={ADMIN_CARD_BODY}>
            {loading ? (
              <LoadingState label="Memuat status…" />
            ) : loadError ? (
              <p className="text-sm text-red-500 m-0">{loadError}</p>
            ) : !mentor ? (
              <div>
                <p className="text-sm text-ld-fog m-0 mb-4">
                  Punya pengalaman QA dan mau berbagi ilmu? Ajukan diri jadi mentor — admin akan review aplikasimu.
                </p>
                <button
                  onClick={() => setFormOpen(true)}
                  className="px-4 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
                >
                  Ajukan Jadi Mentor
                </button>
              </div>
            ) : mentor.verificationStatus === 'pending' ? (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
                <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="m-0 text-sm font-medium text-amber-700">Aplikasi sedang direview</p>
                  <p className="m-0 text-xs text-amber-600 mt-0.5">Admin akan meninjau profil mentor kamu. Cek lagi nanti.</p>
                </div>
              </div>
            ) : mentor.verificationStatus === 'rejected' ? (
              <div>
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 mb-4">
                  <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="m-0 text-sm font-medium text-red-600">Aplikasi ditolak</p>
                    {mentor.rejectionReason && <p className="m-0 text-xs text-red-500 mt-0.5">{mentor.rejectionReason}</p>}
                  </div>
                </div>
                <button
                  onClick={() => setFormOpen(true)}
                  className="px-4 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
                >
                  Edit &amp; Ajukan Ulang
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 mb-4">
                  <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="m-0 text-sm font-medium text-green-700">Kamu terverifikasi sebagai mentor</p>
                    <p className="m-0 text-xs text-green-600 mt-0.5">Profilmu tampil publik di halaman mentor.</p>
                  </div>
                </div>
                <button
                  onClick={() => setFormOpen(true)}
                  className="px-4 py-2.5 rounded-lg border border-ld-frost bg-white text-sm font-medium text-ld-graphite cursor-pointer hover:bg-ld-cloud transition-colors"
                >
                  Edit Profil
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;
