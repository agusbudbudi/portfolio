import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Building2, CalendarCheck, Check, CheckCircle2, Clock, Copy, ExternalLink, LayoutDashboard,
  Menu, Pencil, Plus, UserSquare2, Users, X, XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { useMentorProfileStore } from '../../../../store/useMentorProfileStore';
import { usePortfolioProfileStore } from '../../../../store/usePortfolioProfileStore';
import { useBookingProfileStore } from '../../../../store/useBookingProfileStore';
import { useAssignedBookingsStore } from '../../../../store/useAssignedBookingsStore';
import { useAdminToolsStore } from '../../../../store/useAdminToolsStore';
import { useAdminSkillsStore } from '../../../../store/useAdminSkillsStore';
import { useConfig } from '../../../../hooks/useConfig';
import { useSnackbarStore } from '../../../../store/useSnackbarStore';
import { useConfirmStore } from '../../../../store/useConfirmStore';
import { formatDateLabel, parseDateId } from '../../../../lib/dates';
import { apiGetPortfolioByOwner } from '../../../../lib/adminApi';
import LoadingState from '../../../../components/common/LoadingState';
import MentorForm from '../mentor/MentorForm';
import PortfolioForm from '../superadmin/PortfolioForm';
import MemberBookingForm from '../mentee/MemberBookingForm';
import ProfileMenu from './ProfileMenu';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from './StatusBadge';
import type { BookingConfig, BookingStatus, MentorEmploymentType } from '../../../../types/mentoring';
import type { PortfolioData } from '../../../../types/portfolio';

const PORTFOLIO_SECTION_COUNT = 9;

// A section counts as "done" once every field it exposes is filled — array
// sections (experience/education/...) have no fixed field set, so "filled"
// just means at least one entry was added.
function countCompletedPortfolioSections(data: PortfolioData): number {
  const checks = [
    Boolean(data.profile.name && data.profile.bio && data.profile.role && data.profile.photo && data.profile.cvUrl),
    data.experience.length > 0,
    data.education.length > 0,
    data.projects.length > 0,
    data.endorsements.length > 0,
    data.certifications.length > 0,
    data.articles.length > 0,
    Boolean(data.socials.linkedin && data.socials.github && data.socials.whatsapp && data.socials.email && data.socials.portfolioUrl),
    Boolean(data.cta.title && data.cta.description),
  ];
  return checks.filter(Boolean).length;
}

const PORTFOLIO_STATUS_TONE: Record<'draft' | 'published', StatusBadgeTone> = {
  draft: 'slate',
  published: 'emerald',
};

const BOOKING_STATUS_TONE: Record<BookingStatus, StatusBadgeTone> = {
  booked: 'sky',
  confirmed: 'emerald',
  completed: 'slate',
  canceled: 'red',
};

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  booked: 'Booked',
  confirmed: 'Confirmed',
  completed: 'Completed',
  canceled: 'Canceled',
};

type UserRole = 'Admin' | 'Mentor' | 'Mentee';

const DEFAULT_MENTOR_AVATAR = '/admin/img/default-avatar-mentor.webp';

const DAY_LABELS: Record<string, string> = {
  monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu', thursday: 'Kamis',
  friday: 'Jumat', saturday: 'Sabtu', sunday: 'Minggu',
};
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const EMPLOYMENT_TYPE_LABEL: Record<MentorEmploymentType, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
};

const MENTOR_PLATFORMS = [
  { key: 'digitalSkola' as const, name: 'Digital Skola', logo: '/admin/img/logo-digitalskola.webp' },
  { key: 'dealls' as const, name: 'Dealls', logo: '/admin/img/logo-dealls.webp' },
];

function formatMonth(value?: string): string {
  if (!value) return '';
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

type NavId = 'home' | 'booking' | 'mentor' | 'portfolios';

interface NavItem {
  id: NavId;
  label: string;
  description: string;
  icon: LucideIcon;
}

// Dashboard for any logged-in non-admin account (mentee, or mentee +
// mentor). One shared sidebar/shell for both — self-serve capabilities today
// are the mentor application and portfolio creation; booking self-serve
// still points at the existing public WhatsApp flow (bookings needs a bigger
// backend rework first — see docs/ASSESSMENT_role_based_dashboard.md). "Am I
// a mentor" is derived from the mentor record's verification status, not
// `user.roles` — role grants are a manual admin step and don't track
// application state.
const MemberDashboard: React.FC = () => {
  const { user, token, logout } = useAdminAuthStore();
  const showSnackbar = useSnackbarStore((s) => s.show);
  const openConfirm = useConfirmStore((s) => s.open);
  const { mentor, loading, loadError, load, apply, update } = useMentorProfileStore();
  const {
    portfolio, loading: portfolioLoading, loadError: portfolioLoadError,
    load: loadPortfolio, create: createPortfolio, update: updatePortfolio,
  } = usePortfolioProfileStore();
  const portfolioPercent = portfolio
    ? Math.round((countCompletedPortfolioSections(portfolio.data) / PORTFOLIO_SECTION_COUNT) * 100)
    : null;
  const showMentorNudge = portfolioPercent !== null && portfolioPercent < 80;
  const {
    bookings: myBookings, loading: bookingsLoading, loadError: bookingsLoadError,
    load: loadBookings, create: createBooking, cancel: cancelBooking,
  } = useBookingProfileStore();
  const activeBooking = myBookings.find((b) => b.status === 'booked' || b.status === 'confirmed') ?? myBookings[0] ?? null;
  const {
    bookings: assignedBookings, loading: assignedLoading, loadError: assignedLoadError,
    load: loadAssigned, transition: transitionAssigned,
  } = useAssignedBookingsStore();
  const { tools, load: loadTools } = useAdminToolsStore();
  const { skills, load: loadSkills } = useAdminSkillsStore();
  const { config } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const activeNav: NavId = (() => {
    const seg = location.pathname.replace(/^\/dashboard\/?/, '').split('/')[0];
    return seg === 'portfolios' || seg === 'booking' || seg === 'mentor' ? seg : 'home';
  })();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingDetailId, setBookingDetailId] = useState<string | null>(null);
  const [assignedBookingDetailId, setAssignedBookingDetailId] = useState<string | null>(null);
  const [menteePortfolio, setMenteePortfolio] = useState<{ forId: string; slug: string | null; cvUrl: string | null } | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [assignedActionError, setAssignedActionError] = useState<string | null>(null);
  const [assignedTransitioningId, setAssignedTransitioningId] = useState<string | null>(null);
  const [bookingActionError, setBookingActionError] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);

  useEffect(() => {
    load(); loadPortfolio(); loadBookings(); loadAssigned(); loadTools(); loadSkills();
  }, [load, loadPortfolio, loadBookings, loadAssigned, loadTools, loadSkills]);

  useEffect(() => {
    const menteeUserId = assignedBookings.find((b) => b.id === assignedBookingDetailId)?.menteeUserId;
    if (!menteeUserId || !token || !assignedBookingDetailId) return;
    let cancelled = false;
    const forId = assignedBookingDetailId;
    apiGetPortfolioByOwner(menteeUserId, token)
      .then((result) => { if (!cancelled) setMenteePortfolio(result ? { forId, ...result } : null); })
      .catch(() => { if (!cancelled) setMenteePortfolio(null); });
    return () => { cancelled = true; };
  }, [assignedBookingDetailId, assignedBookings, token]);

  const handleAssignedTransition = async (booking: BookingConfig, newStatus: BookingStatus) => {
    setAssignedActionError(null);
    if (newStatus === 'canceled' && !window.confirm(`Batalkan booking dari "${booking.menteeName}"?`)) return;
    setAssignedTransitioningId(booking.id);
    const result = await transitionAssigned(booking.id, newStatus);
    setAssignedTransitioningId(null);
    if (!result.ok) setAssignedActionError(result.reason ?? 'Gagal mengubah status booking.');
  };

  const handleCancelBooking = (booking: BookingConfig) => {
    openConfirm({
      mode: 'cta',
      title: 'Batalkan booking ini?',
      description: 'Booking yang sudah dibatalkan tidak dapat diaktifkan kembali.',
      confirmLabel: 'Ya, Batalkan',
      cancelLabel: 'Kembali',
      variant: 'danger',
      onConfirm: async () => {
        setBookingActionError(null);
        setCancelingBookingId(booking.id);
        const result = await cancelBooking(booking.id);
        setCancelingBookingId(null);
        if (result.ok) {
          showSnackbar('Booking mentoring berhasil dibatalkan.', 'info');
        } else {
          const msg = result.reason ?? 'Gagal membatalkan booking.';
          setBookingActionError(msg);
          showSnackbar(msg, 'error');
        }
      },
    });
  };

  const isEdit = mentor !== null;
  const isVerifiedMentor = mentor?.verificationStatus === 'verified';
  const userRole: UserRole = user?.roles.includes('admin') ? 'Admin' : isVerifiedMentor ? 'Mentor' : 'Mentee';
  const topics = config?.topics ?? [];
  const availableDays = config?.availableDays ?? [];
  const existingIds = (config?.mentors ?? []).map((m) => m.id);
  const bookableMentors = config?.mentors ?? [];
  const bookingRules = config?.bookingRules;
  const mentorName = (id: string) => bookableMentors.find((m) => m.id === id)?.name ?? id;
  const mentorAvatar = (id: string) => bookableMentors.find((m) => m.id === id)?.avatar;
  const topicLabels = (ids: string[]) => ids.map((id) => topics.find((t) => t.id === id)?.label ?? id).join(', ');
  const bookingDetail = myBookings.find((b) => b.id === bookingDetailId) ?? null;
  const assignedBookingDetail = assignedBookings.find((b) => b.id === assignedBookingDetailId) ?? null;

  const NAV_ITEMS: NavItem[] = [
    { id: 'home', label: 'Dashboard', description: 'Ringkasan akun kamu', icon: LayoutDashboard },
    { id: 'portfolios', label: 'Portfolio', description: 'Portfolio QA kamu', icon: UserSquare2 },
    { id: 'booking', label: 'Booking', description: 'Jadwalkan sesi mentoring', icon: CalendarCheck },
    {
      id: 'mentor',
      label: isVerifiedMentor ? 'Profil Mentor' : 'Jadi Mentor',
      description: isVerifiedMentor ? 'Kelola profil mentor kamu' : 'Ajukan diri jadi mentor',
      icon: Users,
    },
  ];

  const activeItem = NAV_ITEMS.find((item) => item.id === activeNav) ?? NAV_ITEMS[0];
  const navPath = (id: NavId) => (id === 'home' ? '/dashboard' : `/dashboard/${id}`);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-ld-frost/60">
        <img src="/shared/img/mentor-logo.webp" alt="Mentor.QA" width={32} height={32} className="w-8 h-8 rounded-lg object-contain shrink-0" />
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-ld-onyx leading-tight truncate">Mentor.QA</p>
          <p className="m-0 text-[11px] text-ld-fog leading-tight truncate">Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter((item) => item.id !== 'mentor' || isVerifiedMentor).map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { navigate(navPath(item.id)); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left cursor-pointer border-none transition-colors ${active
                ? 'bg-ld-lilac/60 text-ld-violet'
                : 'bg-transparent text-ld-slate hover:bg-ld-cloud hover:text-ld-graphite'
                }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {!isVerifiedMentor && (
        <div className="px-3 pt-3 pb-5">
          <button
            onClick={() => { navigate(navPath('mentor')); setFormOpen(mentor === null); setSidebarOpen(false); }}
            className="group relative w-full overflow-hidden rounded-lg border-none cursor-pointer text-left p-4 bg-gradient-to-br from-ld-violet via-[#3b82f6] to-[#6366f1] transition-transform hover:-translate-y-0.5"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="relative min-w-0">
              <p className="m-0 text-sm font-semibold text-white leading-tight">Jadi Mentor QA</p>
              <p className="m-0 mt-1 text-xs text-white/80 leading-snug">
                Bagikan ilmumu & bantu QA lain berkembang.
              </p>
              <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-white">
                Ajukan sekarang <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </button>
        </div>
      )}

    </>
  );

  const mentorStatusCard = (
    <div className={ADMIN_CARD}>
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-42 h-48 lg:h-auto shrink-0 min-h-0 overflow-hidden">
          <img src="/admin/img/image-promotion.webp" alt="Manfaat jadi mentor" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_65%,white_100%)] lg:bg-[linear-gradient(to_right,transparent_0%,transparent_65%,white_100%)]" />
        </div>
        <div className={`flex-1 min-w-0 ${ADMIN_CARD_BODY}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Yuk, Jadi Mentor QA!</h2>
            <div className="flex items-center gap-2">
              {isVerifiedMentor && mentor && (
                <a
                  href={`/mentor/${mentor.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm font-medium text-ld-graphite no-underline hover:bg-ld-cloud transition-colors"
                >
                  <ExternalLink size={14} /> Lihat Profil Publik
                </a>
              )}
              {mentor?.verificationStatus !== 'pending' && (
                <button
                  onClick={() => { navigate(navPath('mentor')); setFormOpen(true); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
                >
                  {!mentor && <><Plus size={14} /> Ajukan Jadi Mentor</>}
                  {mentor?.verificationStatus === 'rejected' && 'Edit & Ajukan Ulang'}
                  {isVerifiedMentor && <><Pencil size={14} /> Edit Profil Mentor</>}
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <LoadingState label="Memuat status…" className="py-4" />
          ) : loadError ? (
            <p className="text-sm text-red-500 m-0">{loadError}</p>
          ) : !mentor ? (
            <p className="text-sm text-ld-fog m-0">
              Punya pengalaman QA dan mau berbagi ilmu? Ajukan diri jadi mentor — admin akan review aplikasimu.
            </p>
          ) : mentor.verificationStatus === 'pending' ? (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200">
              <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="m-0 text-sm font-medium text-amber-700">Aplikasi sedang direview</p>
                <p className="m-0 text-xs text-amber-600 mt-0.5">Admin akan meninjau profil mentor kamu. Cek lagi nanti.</p>
              </div>
            </div>
          ) : mentor.verificationStatus === 'rejected' ? (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
              <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="m-0 text-sm font-medium text-red-600">Aplikasi ditolak</p>
                {mentor.rejectionReason && <p className="m-0 text-xs text-red-500 mt-0.5">{mentor.rejectionReason}</p>}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="m-0 text-sm font-medium text-green-700">Kamu terverifikasi sebagai mentor</p>
                <p className="m-0 text-xs text-green-600 mt-0.5">Profilmu tampil publik di halaman mentor.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const mentorPreviewGrid = mentor && (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-5">
        <div className={ADMIN_CARD}>
          <div className={ADMIN_CARD_HEADER}>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Profil</h2>
          </div>
          <div className={ADMIN_CARD_BODY}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3 min-w-0">
                <img
                  src={mentor.avatar || DEFAULT_MENTOR_AVATAR}
                  alt={mentor.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="m-0 text-sm font-semibold text-ld-onyx truncate">{mentor.name}</p>
                  <p className="m-0 text-sm text-ld-slate leading-relaxed mt-1">{mentor.bio}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="m-0 text-xs text-ld-fog whitespace-nowrap">{mentor.whatsapp}</p>
                <code className="inline-block px-2.5 py-1 rounded-md bg-ld-cloud text-ld-graphite text-xs font-medium">{mentor.id}</code>
              </div>
            </div>
            {mentor.detailProfile && (
              <p className="text-sm text-ld-slate leading-relaxed whitespace-pre-line m-0">{mentor.detailProfile}</p>
            )}
          </div>
        </div>

        <div className={ADMIN_CARD}>
          <div className={ADMIN_CARD_HEADER}>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Jadwal Mingguan</h2>
          </div>
          <div className={ADMIN_CARD_BODY}>
            {DAY_ORDER.filter((day) => (mentor.schedule[day] ?? []).length > 0).length > 0 ? (
              <div className="rounded-xl border border-ld-ash divide-y divide-ld-ash overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 py-2 bg-ld-cloud/60">
                  <span className="w-14 flex-shrink-0 text-[11px] font-semibold text-ld-graphite uppercase tracking-wide">Hari</span>
                  <span className="text-[11px] font-semibold text-ld-graphite uppercase tracking-wide">Jam Tersedia</span>
                </div>
                {DAY_ORDER.filter((day) => (mentor.schedule[day] ?? []).length > 0).map((day) => (
                  <div key={day} className="flex items-center gap-3 px-3.5 py-2.5 bg-ld-canvas">
                    <span className="w-14 flex-shrink-0 text-sm text-ld-slate">{DAY_LABELS[day]}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.schedule[day].map((time) => (
                        <span key={time} className="px-2.5 py-1 rounded-md bg-ld-cloud text-ld-graphite text-xs font-medium tabular-nums">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ld-fog italic m-0">Belum ada jadwal yang tersedia.</p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-5">
        <div className={ADMIN_CARD}>
          <div className={ADMIN_CARD_HEADER}>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Expertise</h2>
          </div>
          <div className={ADMIN_CARD_BODY}>
            {mentor.expertise.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {mentor.expertise.map((id) => (
                  <span key={id} className="px-2.5 py-1 rounded-lg border border-ld-ash text-ld-graphite text-xs font-medium">
                    {topics.find((t) => t.id === id)?.label ?? id}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ld-fog italic m-0">Belum ada area keahlian ditambahkan.</p>
            )}
          </div>
        </div>

        <div className={ADMIN_CARD}>
          <div className={ADMIN_CARD_HEADER}>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Pengalaman Kerja</h2>
          </div>
          <div className={ADMIN_CARD_BODY}>
            {(mentor.workExperience ?? []).length > 0 ? (
              <div className="flex flex-col gap-3">
                {(mentor.workExperience ?? []).map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-ld-ash p-3.5">
                    <div className={`w-10 h-10 min-w-10 flex items-center justify-center rounded-lg overflow-hidden ${entry.companyLogo ? 'bg-ld-cloud' : 'bg-ld-violet'}`}>
                      {entry.companyLogo ? (
                        <img src={entry.companyLogo} alt={entry.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                      ) : (
                        <Building2 size={16} className="text-white" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h4 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{entry.company}</h4>
                      <p className="text-xs text-ld-violet font-medium m-0">{entry.position}</p>
                      <span className="text-[11px] text-ld-fog">
                        {entry.employmentType && `${EMPLOYMENT_TYPE_LABEL[entry.employmentType]} · `}
                        {formatMonth(entry.startDate)} — {entry.isCurrent ? 'Sekarang' : formatMonth(entry.endDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ld-fog italic m-0">Belum ada pengalaman kerja ditambahkan.</p>
            )}
          </div>
        </div>

        <div className={ADMIN_CARD}>
          <div className={ADMIN_CARD_HEADER}>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Platform Mentoring</h2>
          </div>
          <div className={ADMIN_CARD_BODY}>
            {MENTOR_PLATFORMS.some((p) => mentor.platforms?.[p.key]) ? (
              <div className="flex flex-wrap gap-3">
                {MENTOR_PLATFORMS.filter((p) => mentor.platforms?.[p.key]).map((p) => (
                  <div key={p.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ld-ash">
                    <img src={p.logo} alt={p.name} loading="lazy" decoding="async" className="h-5 w-auto object-contain" />
                    <span className="text-xs font-medium text-ld-graphite">{p.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ld-fog italic m-0">Belum aktif di platform mentoring lain.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const portfolioStatusCard = (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <h2 className="text-sm font-semibold text-ld-onyx m-0">Portfolio QA</h2>
        <div className="flex items-center gap-2">
          {portfolio?.status === 'published' && (
            <a
              href={`/portfolio/${portfolio.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm font-medium text-ld-graphite no-underline hover:bg-ld-cloud transition-colors"
            >
              <ExternalLink size={14} /> Lihat Portfolio
            </a>
          )}
          <button
            onClick={() => setPortfolioFormOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
          >
            {portfolio ? <><Pencil size={14} /> Edit Portfolio</> : <><Plus size={14} /> Buat Portfolio</>}
          </button>
        </div>
      </div>
      <div className={ADMIN_CARD_BODY}>
        {portfolioLoading ? (
          <LoadingState label="Memuat portfolio…" />
        ) : portfolioLoadError ? (
          <p className="text-sm text-red-500 m-0">{portfolioLoadError}</p>
        ) : !portfolio ? (
          <p className="text-sm text-ld-fog m-0">
            Showcase pengalaman, proyek, dan sertifikasi QA kamu lewat halaman portfolio publik.
          </p>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <StatusBadge tone={PORTFOLIO_STATUS_TONE[portfolio.status]}>{portfolio.status}</StatusBadge>
              <code className="text-[11px] text-ld-slate truncate">{`${window.location.origin}/portfolio/${portfolio.slug}`}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/portfolio/${portfolio.slug}`);
                  setUrlCopied(true);
                  showSnackbar('Link portfolio berhasil disalin!', 'success');
                  setTimeout(() => setUrlCopied(false), 1500);
                }}
                className="p-1 rounded-md text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors shrink-0"
                aria-label="Salin link portfolio"
              >
                {urlCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              </button>
            </div>

            {(() => {
              const done = countCompletedPortfolioSections(portfolio.data);
              if (done >= PORTFOLIO_SECTION_COUNT) return null;
              const percent = Math.round((done / PORTFOLIO_SECTION_COUNT) * 100);
              return (
                <div className="rounded-lg bg-ld-lilac/40 border border-ld-lilac p-3.5">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <p className="m-0 text-xs font-medium text-ld-graphite">
                      Portfolio kamu makin kece kalau lengkap - yuk tambahkan detail lainnya
                    </p>
                    <span className="text-xs font-semibold text-ld-violet shrink-0">{done}/{PORTFOLIO_SECTION_COUNT} selesai</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white overflow-hidden">
                    <div className="h-full rounded-full bg-ld-violet transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  const bookingStatusCard = (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <h2 className="text-sm font-semibold text-ld-onyx m-0">Booking Saya</h2>
        <button
          onClick={() => setBookingFormOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Buat Booking
        </button>
      </div>
      <div className={ADMIN_CARD_BODY}>
        {bookingActionError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{bookingActionError}</p>
        )}
        {bookingsLoading ? (
          <LoadingState label="Memuat booking…" />
        ) : bookingsLoadError ? (
          <p className="text-sm text-red-500 m-0">{bookingsLoadError}</p>
        ) : myBookings.length === 0 ? (
          <p className="text-sm text-ld-fog m-0">Belum ada booking. Jadwalkan sesi mentoring pertamamu.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {myBookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-ld-frost overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-ld-cloud/60 border-b border-ld-frost">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarCheck size={14} className="text-ld-violet shrink-0" />
                    <span className="text-xs font-medium text-ld-graphite truncate uppercase">{booking.id}</span>
                    <span className="text-xs text-ld-ash shrink-0">|</span>
                    <StatusBadge tone={BOOKING_STATUS_TONE[booking.status]} className="shrink-0">
                      {BOOKING_STATUS_LABEL[booking.status]}
                    </StatusBadge>
                  </div>
                  <span className="text-xs font-semibold text-ld-onyx shrink-0">
                    {formatDateLabel(parseDateId(booking.date))} · {booking.time} WIB
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="m-0 text-base font-semibold text-ld-onyx mb-3">{topicLabels(booking.topics)}</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={mentorAvatar(booking.mentorId) || DEFAULT_MENTOR_AVATAR}
                        alt={mentorName(booking.mentorId)}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-md object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="m-0 text-xs text-ld-fog leading-tight">Mentor:</p>
                        <p className="m-0 text-sm font-medium text-ld-onyx truncate leading-tight">{mentorName(booking.mentorId)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setBookingDetailId(booking.id)}
                      className="px-3.5 py-2 rounded-lg text-sm font-medium text-ld-graphite hover:bg-ld-cloud cursor-pointer border border-ld-frost bg-transparent transition-colors shrink-0"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const bookingDetailCard = bookingDetail && (() => {
    const mentor = bookableMentors.find((m) => m.id === bookingDetail.mentorId);
    return (
      <div className={ADMIN_CARD}>
        <div className={`${ADMIN_CARD_HEADER} justify-between`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBookingDetailId(null)}
              className="p-1.5 -ml-1.5 rounded-lg text-ld-fog hover:bg-ld-cloud hover:text-ld-graphite cursor-pointer border-none bg-transparent transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft size={16} />
            </button>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">Detail Booking</h2>
          </div>
          {(bookingDetail.status === 'booked' || bookingDetail.status === 'confirmed') && (
            <button
              onClick={() => handleCancelBooking(bookingDetail)}
              disabled={cancelingBookingId === bookingDetail.id}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 cursor-pointer border border-red-200 bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Batalkan Booking
            </button>
          )}
        </div>
        <div className={ADMIN_CARD_BODY}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-5">
              <div>
                <p className="m-0 text-xs text-ld-fog mb-1">Booking ID</p>
                <code className="text-sm font-medium text-ld-graphite uppercase">{bookingDetail.id}</code>
              </div>
              <div>
                <p className="m-0 text-xs text-ld-fog mb-1">Status</p>
                <StatusBadge tone={BOOKING_STATUS_TONE[bookingDetail.status]}>
                  {BOOKING_STATUS_LABEL[bookingDetail.status]}
                </StatusBadge>
              </div>
              <div>
                <p className="m-0 text-xs text-ld-fog mb-1">Tanggal</p>
                <p className="m-0 text-sm font-medium text-ld-onyx">
                  {formatDateLabel(parseDateId(bookingDetail.date))} · {bookingDetail.time} WIB
                </p>
              </div>
              <div>
                <p className="m-0 text-xs text-ld-fog mb-1.5">Topik</p>
                <div className="flex flex-wrap gap-1.5">
                  {bookingDetail.topics.map((id) => (
                    <span key={id} className="px-2.5 py-1 rounded-lg border border-ld-ash text-ld-graphite text-xs font-medium">
                      {topics.find((t) => t.id === id)?.label ?? id}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="m-0 text-xs text-ld-fog mb-1">Catatan</p>
                <p className="m-0 text-sm text-ld-slate leading-relaxed whitespace-pre-line">
                  {bookingDetail.notes || <span className="italic text-ld-fog">Tidak ada catatan.</span>}
                </p>
              </div>
              <div>
                <p className="m-0 text-xs text-ld-fog mb-1">Dibuat</p>
                <p className="m-0 text-sm font-medium text-ld-onyx">
                  {formatDateLabel(parseDateId(bookingDetail.createdAt.slice(0, 10)))} · {bookingDetail.createdAt.slice(11, 16)} WIB
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className="m-0 text-xs text-ld-fog mb-1.5">Mentor</p>
              <div className="flex items-start gap-3 rounded-xl border border-ld-frost p-3.5">
                <img
                  src={mentor?.avatar || DEFAULT_MENTOR_AVATAR}
                  alt={mentorName(bookingDetail.mentorId)}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="m-0 text-sm font-semibold text-ld-onyx truncate">{mentorName(bookingDetail.mentorId)}</p>
                  {mentor?.whatsapp && <p className="m-0 text-xs text-ld-fog mt-0.5">{mentor.whatsapp}</p>}
                  {mentor?.bio && <p className="m-0 text-sm text-ld-slate leading-relaxed mt-2">{mentor.bio}</p>}
                  {mentor && (
                    <a
                      href={`/mentor/${mentor.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite no-underline hover:bg-ld-cloud transition-colors"
                    >
                      <ExternalLink size={13} /> Lihat Profile
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const assignedBookingDetailCard = assignedBookingDetail && (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAssignedBookingDetailId(null)}
            className="p-1.5 -ml-1.5 rounded-lg text-ld-fog hover:bg-ld-cloud hover:text-ld-graphite cursor-pointer border-none bg-transparent transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Detail Booking Masuk</h2>
        </div>
        <div className="flex items-center gap-2">
          {assignedBookingDetail.status === 'booked' && (
            <button
              onClick={() => handleAssignedTransition(assignedBookingDetail, 'confirmed')}
              disabled={assignedTransitioningId === assignedBookingDetail.id}
              className="px-4 py-2 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 cursor-pointer border border-emerald-200 bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          )}
          {assignedBookingDetail.status === 'confirmed' && (
            <button
              onClick={() => handleAssignedTransition(assignedBookingDetail, 'completed')}
              disabled={assignedTransitioningId === assignedBookingDetail.id}
              className="px-4 py-2 rounded-lg text-sm font-medium text-ld-slate hover:bg-ld-cloud cursor-pointer border border-ld-frost bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Complete
            </button>
          )}
          {(assignedBookingDetail.status === 'booked' || assignedBookingDetail.status === 'confirmed') && (
            <button
              onClick={() => handleAssignedTransition(assignedBookingDetail, 'canceled')}
              disabled={assignedTransitioningId === assignedBookingDetail.id}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 cursor-pointer border border-red-200 bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className={ADMIN_CARD_BODY}>
        {assignedActionError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{assignedActionError}</p>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            <div>
              <p className="m-0 text-xs text-ld-fog mb-1">Booking ID</p>
              <code className="text-sm font-medium text-ld-graphite uppercase">{assignedBookingDetail.id}</code>
            </div>
            <div>
              <p className="m-0 text-xs text-ld-fog mb-1">Status</p>
              <StatusBadge tone={BOOKING_STATUS_TONE[assignedBookingDetail.status]}>
                {BOOKING_STATUS_LABEL[assignedBookingDetail.status]}
              </StatusBadge>
            </div>
            <div>
              <p className="m-0 text-xs text-ld-fog mb-1">Tanggal</p>
              <p className="m-0 text-sm font-medium text-ld-onyx">
                {formatDateLabel(parseDateId(assignedBookingDetail.date))} · {assignedBookingDetail.time} WIB
              </p>
            </div>
            <div>
              <p className="m-0 text-xs text-ld-fog mb-1.5">Topik</p>
              <div className="flex flex-wrap gap-1.5">
                {assignedBookingDetail.topics.map((id) => (
                  <span key={id} className="px-2.5 py-1 rounded-lg border border-ld-ash text-ld-graphite text-xs font-medium">
                    {topics.find((t) => t.id === id)?.label ?? id}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="m-0 text-xs text-ld-fog mb-1">Catatan</p>
              <p className="m-0 text-sm text-ld-slate leading-relaxed whitespace-pre-line">
                {assignedBookingDetail.notes || <span className="italic text-ld-fog">Tidak ada catatan.</span>}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs text-ld-fog mb-1">Dibuat</p>
              <p className="m-0 text-sm font-medium text-ld-onyx">
                {formatDateLabel(parseDateId(assignedBookingDetail.createdAt.slice(0, 10)))} · {assignedBookingDetail.createdAt.slice(11, 16)} WIB
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="m-0 text-xs text-ld-fog mb-1.5">Mentee</p>
            <div className="flex items-start gap-3 rounded-xl border border-ld-frost p-3.5">
              <div className="w-14 h-14 rounded-xl bg-ld-lilac text-ld-violet flex items-center justify-center text-lg font-semibold shrink-0">
                {assignedBookingDetail.menteeName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="m-0 text-sm font-semibold text-ld-onyx truncate">{assignedBookingDetail.menteeName}</p>
                <p className="m-0 text-xs text-ld-fog mt-0.5 truncate">{assignedBookingDetail.menteeEmail}</p>
                <p className="m-0 text-xs text-ld-fog mt-0.5">{assignedBookingDetail.menteeWhatsapp}</p>
                {menteePortfolio && menteePortfolio.forId === assignedBookingDetailId && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {menteePortfolio.cvUrl && (
                      <a
                        href={menteePortfolio.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite no-underline hover:bg-ld-cloud transition-colors"
                      >
                        <ExternalLink size={13} /> Lihat CV
                      </a>
                    )}
                    {menteePortfolio.slug && (
                      <a
                        href={`/portfolio/${menteePortfolio.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite no-underline hover:bg-ld-cloud transition-colors"
                      >
                        <ExternalLink size={13} /> Lihat Portfolio
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const assignedBookingsCard = (
    <div className={ADMIN_CARD}>
      <div className={ADMIN_CARD_HEADER}>
        <h2 className="text-sm font-semibold text-ld-onyx m-0">Booking Masuk</h2>
      </div>
      <div className={ADMIN_CARD_BODY}>
        {assignedActionError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{assignedActionError}</p>
        )}
        {assignedLoading ? (
          <LoadingState label="Memuat booking…" />
        ) : assignedLoadError ? (
          <p className="text-sm text-red-500 m-0">{assignedLoadError}</p>
        ) : assignedBookings.length === 0 ? (
          <p className="text-sm text-ld-fog m-0">Belum ada booking yang masuk.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {assignedBookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-ld-frost overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-ld-cloud/60 border-b border-ld-frost">
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarCheck size={14} className="text-ld-violet shrink-0" />
                    <span className="text-xs font-medium text-ld-graphite truncate uppercase">{booking.id}</span>
                    <span className="text-xs text-ld-ash shrink-0">|</span>
                    <StatusBadge tone={BOOKING_STATUS_TONE[booking.status]} className="shrink-0">
                      {BOOKING_STATUS_LABEL[booking.status]}
                    </StatusBadge>
                  </div>
                  <span className="text-xs font-semibold text-ld-onyx shrink-0">
                    {formatDateLabel(parseDateId(booking.date))} · {booking.time} WIB
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="m-0 text-base font-semibold text-ld-onyx mb-3">{topicLabels(booking.topics)}</p>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-ld-lilac text-ld-violet flex items-center justify-center text-sm font-semibold shrink-0">
                        {booking.menteeName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="m-0 text-xs text-ld-fog leading-tight">Mentee:</p>
                        <p className="m-0 text-sm font-medium text-ld-onyx truncate leading-tight">{booking.menteeName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                      <button
                        onClick={() => setAssignedBookingDetailId(booking.id)}
                        className="px-3.5 py-2 rounded-lg text-sm font-medium text-ld-graphite hover:bg-ld-cloud cursor-pointer border border-ld-frost bg-transparent transition-colors"
                      >
                        Lihat Detail
                      </button>
                      {booking.status === 'booked' && (
                        <button
                          onClick={() => handleAssignedTransition(booking, 'confirmed')}
                          disabled={assignedTransitioningId === booking.id}
                          className="px-3.5 py-2 rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 cursor-pointer border border-emerald-200 bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleAssignedTransition(booking, 'completed')}
                          disabled={assignedTransitioningId === booking.id}
                          className="px-3.5 py-2 rounded-lg text-sm font-medium text-ld-slate hover:bg-ld-cloud cursor-pointer border border-ld-frost bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Complete
                        </button>
                      )}
                      {(booking.status === 'booked' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleAssignedTransition(booking, 'canceled')}
                          disabled={assignedTransitioningId === booking.id}
                          className="px-3.5 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 cursor-pointer border border-red-200 bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-ld-cloud font-ld-sans">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-ld-frost/70 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Sidebar — mobile drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-ld-midnight/40" onClick={() => setSidebarOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 w-64 flex flex-col bg-white border-r border-ld-frost/70 shadow-[rgba(39,40,53,0.1)_0px_0px_0px_1px,rgba(39,40,53,0.08)_0px_24px_24px_-12px] transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-3 p-1.5 rounded-lg text-ld-fog hover:text-ld-graphite bg-transparent border-none cursor-pointer"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
          {sidebarContent}
        </aside>
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 md:px-6 bg-white/95 backdrop-blur border-b border-ld-frost/70">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-ld-graphite hover:bg-ld-cloud bg-transparent border-none cursor-pointer"
              aria-label="Buka menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="m-0 text-base font-semibold text-ld-onyx leading-tight truncate">{activeItem.label}</h1>
              <p className="m-0 text-[11px] text-ld-fog leading-tight truncate">{activeItem.description}</p>
            </div>
          </div>

          {user && (
            <ProfileMenu
              user={user}
              roleLabel={userRole}
              onLogout={() => { logout(); showSnackbar('Kamu telah berhasil keluar.', 'info'); }}
            />
          )}
        </header>

        <main className="flex-1 p-2 md:p-6 w-full">
          {activeNav === 'home' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5 mb-4 md:mb-5">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => { navigate(navPath('portfolios')); if (!portfolio) setPortfolioFormOpen(true); }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    navigate(navPath('portfolios'));
                    if (!portfolio) setPortfolioFormOpen(true);
                  }}
                  className={`group relative overflow-hidden rounded-xl border border-ld-frost/60 bg-white p-5 cursor-pointer text-left shadow-[0_4px_18px_rgba(30,27,75,0.035)] transition-all duration-300 hover:shadow-md hover:border-ld-violet hover:-translate-y-0.5 ${showMentorNudge ? 'pb-14' : ''}`}
                >
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-ld-lilac/5 group-hover:bg-ld-lilac/10 transition-colors" />
                  <div className="flex items-start gap-4 relative z-10">
                    {portfolio && portfolioPercent !== null ? (
                      <div className="relative w-11 h-11 shrink-0">
                        <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90">
                          <circle cx="22" cy="22" r="18" fill="none" strokeWidth="4" className="stroke-ld-frost" />
                          <circle
                            cx="22" cy="22" r="18" fill="none" strokeWidth="4" strokeLinecap="round"
                            className="stroke-ld-violet transition-all duration-500"
                            strokeDasharray={2 * Math.PI * 18}
                            strokeDashoffset={2 * Math.PI * 18 * (1 - portfolioPercent / 100)}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ld-violet">
                          {portfolioPercent}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-11 h-11 shrink-0">
                        <img src="/admin/img/portfolio.png" alt="" className="w-11 h-11 object-contain" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-sm font-bold text-ld-onyx tracking-wide group-hover:text-ld-violet transition-colors">Portfolio QA</p>
                      <p className="m-0 mt-1 text-xs text-ld-fog leading-relaxed">
                        {!portfolio
                          ? 'Buat portfolio QA kamu.'
                          : portfolioPercent === 100
                            ? 'Portfolio kamu udah lengkap.'
                            : `${portfolioPercent}% lengkap — yuk tambahin detailnya.`}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ld-violet">
                        {portfolio ? 'Kelola Portfolio' : 'Buat Sekarang'} <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>

                  {showMentorNudge && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigate('/mentoring/booking'); }}
                      className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-ld-violet to-[#1f87e6] text-white border-none cursor-pointer rounded-b-lg hover:brightness-110 transition-[filter]"
                    >
                      <span className="text-[11px] font-medium leading-tight text-left">Biar makin siap, minta mentor review portfoliomu</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold shrink-0">
                        Minta Review <ArrowRight size={12} />
                      </span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    navigate(navPath('booking'));
                    if (activeBooking) setBookingDetailId(activeBooking.id);
                    else setBookingFormOpen(true);
                  }}
                  className="group relative overflow-hidden rounded-xl border border-ld-frost/60 bg-white p-5 cursor-pointer text-left shadow-[0_4px_18px_rgba(30,27,75,0.035)] transition-all duration-300 hover:shadow-md hover:border-ld-violet hover:-translate-y-0.5"
                >
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-ld-lilac/5 group-hover:bg-ld-lilac/10 transition-colors" />
                  <div className="flex items-start gap-4 relative z-10">
                    {activeBooking ? (
                      <img
                        src={mentorAvatar(activeBooking.mentorId) || DEFAULT_MENTOR_AVATAR}
                        alt={mentorName(activeBooking.mentorId)}
                        width={44}
                        height={44}
                        className="w-11 h-11 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-11 h-11 shrink-0">
                        <img src="/admin/img/booking.png" alt="" className="w-11 h-11 object-contain" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {activeBooking ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="m-0 text-sm font-bold text-ld-onyx tracking-wide truncate group-hover:text-ld-violet transition-colors">Booking Mentoring</p>
                            <StatusBadge tone={BOOKING_STATUS_TONE[activeBooking.status]} className="shrink-0">
                              {BOOKING_STATUS_LABEL[activeBooking.status]}
                            </StatusBadge>
                          </div>
                          <p className="m-0 text-xs text-ld-fog leading-relaxed truncate">
                            {mentorName(activeBooking.mentorId)} · {formatDateLabel(parseDateId(activeBooking.date))} · {activeBooking.time} WIB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="m-0 text-sm font-bold text-ld-onyx tracking-wide group-hover:text-ld-violet transition-colors">Booking Mentoring</p>
                          <p className="m-0 mt-1 text-xs text-ld-fog leading-relaxed">Jadwalkan sesi 1:1 dengan mentor.</p>
                        </>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ld-violet">
                        {activeBooking ? 'Lihat Detail' : 'Mulai Booking'} <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {mentorStatusCard}
            </div>
          )}

          {activeNav === 'booking' && bookingRules && (
            bookingFormOpen ? (
              <MemberBookingForm
                onClose={() => setBookingFormOpen(false)}
                onSubmit={async (payload) => {
                  const result = await createBooking(payload);
                  if (result.ok) {
                    setBookingFormOpen(false);
                    showSnackbar('Booking mentoring berhasil dibuat!', 'success');
                  } else {
                    showSnackbar(result.reason || 'Gagal membuat booking.', 'error');
                  }
                  return result;
                }}
                mentors={bookableMentors}
                topics={topics}
                maxTopicsSelectable={bookingRules.maxTopicsSelectable}
                sessionDurationMinutes={bookingRules.sessionDurationMinutes}
                availableDays={availableDays}
                daysInAdvanceMin={bookingRules.daysInAdvanceMin}
                daysInAdvanceMax={bookingRules.daysInAdvanceMax}
                menteeName={user?.name}
                menteeEmail={user?.email}
              />
            ) : bookingDetailCard ? bookingDetailCard : assignedBookingDetailCard ? assignedBookingDetailCard : (
              <div className="space-y-5">
                {bookingStatusCard}
                {isVerifiedMentor && assignedBookingsCard}
              </div>
            )
          )}

          {activeNav === 'mentor' && (
            formOpen ? (
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
                mode="member"
              />
            ) : (
              <div className="space-y-5">
                {mentorStatusCard}
                {mentorPreviewGrid}
              </div>
            )
          )}

          {activeNav === 'portfolios' && (
            portfolioFormOpen ? (
              <PortfolioForm
                onClose={() => setPortfolioFormOpen(false)}
                onSubmit={async (payload) => {
                  const result = portfolio ? await updatePortfolio(payload) : await createPortfolio(payload);
                  if (result.ok) {
                    setPortfolioFormOpen(false);
                    showSnackbar(
                      portfolio ? 'Portfolio berhasil diperbarui!' : 'Portfolio berhasil dibuat!',
                      'success'
                    );
                  } else {
                    showSnackbar(result.reason || 'Gagal menyimpan portfolio.', 'error');
                  }
                  return result;
                }}
                record={portfolio}
                tools={tools}
                skills={skills}
              />
            ) : portfolioStatusCard
          )}
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;
