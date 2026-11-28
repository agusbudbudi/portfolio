import React, { useEffect, useRef, useState } from 'react';
import { track } from '../../../../lib/analytics';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Building2, CalendarCheck, Check, CheckCircle2, Copy, ExternalLink, Eye, EyeOff,
  Globe, Menu, Pencil, Plus, X,
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
import { confirmAction, useConfirmStore } from '../../../../store/useConfirmStore';
import { formatDateLabel, parseDateId } from '../../../../lib/dates';
import { apiGetPortfolioByOwner } from '../../../../lib/adminApi';
import LoadingState from '../../../../components/common/LoadingState';
import MentorForm from '../mentor/MentorForm';
import PortfolioForm from '../superadmin/PortfolioForm';
import { clearPortfolioClaim, readPortfolioClaim } from '../../../../lib/portfolioClaim';
import MemberBookingForm from '../mentee/MemberBookingForm';
import ProfileMenu from './ProfileMenu';
import SimulatorDashboardTab from '../../../qa-simulator/components/SimulatorDashboardTab';
import CourseDashboardTab from '../../../qa-course/components/CourseDashboardTab';
import OnboardingRecommendationCard from '../../../onboarding/components/OnboardingRecommendationCard';
import { DashboardIcon, MentorIcon, MentoringIcon, QaCourseIcon, QaPortfolioIcon, QaSimulatorIcon, type IconProps } from '../../../../components/illustration/ProductIcons';
import EmptyCalendarIllustration from '../../../../components/illustration/EmptyCalendarIllustration';
import EmptyPortfolioIllustration from '../../../../components/illustration/EmptyPortfolioIllustration';
import EmptyInboxIllustration from '../../../../components/illustration/EmptyInboxIllustration';
import EmptyState from './EmptyState';
import { ADMIN_CARD, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from './StatusBadge';
import DashboardCard from './DashboardCard';
import DashboardCardHeader from './DashboardCardHeader';
import DashboardShortcutCard from './DashboardShortcutCard';
import DashboardBanner from './DashboardBanner';
import MentoringBannerIllustration from '../../../mentoring/components/MentoringBannerIllustration';
import {
  CARD_ACTION_DANGER, CARD_ACTION_PRIMARY, CARD_ACTION_SECONDARY, CARD_ACTION_SUCCESS,
  LIST_ACTION_DANGER, LIST_ACTION_NEUTRAL, LIST_ACTION_SUCCESS,
} from './DashboardCardHeader';
import type { BookingConfig, BookingStatus, MentorEmploymentType } from '../../../../types/mentoring';
import type { PortfolioData } from '../../../../types/portfolio';
import { AnimatePresence } from 'framer-motion';
import PortfolioPublishedDialog from './PortfolioPublishedDialog';

const PORTFOLIO_SECTION_COUNT = 9;

// A section counts as "done" once every field it exposes is filled — array
// sections (experience/education/...) have no fixed field set, so "filled"
// just means at least one entry was added.
function portfolioSectionChecks(data: PortfolioData): { label: string; done: boolean }[] {
  return [
    { label: 'Profil', done: Boolean(data.profile.name && data.profile.bio && data.profile.role && data.profile.photo && data.profile.cvUrl) },
    { label: 'Pengalaman', done: data.experience.length > 0 },
    { label: 'Pendidikan', done: data.education.length > 0 },
    { label: 'Project', done: data.projects.length > 0 },
    { label: 'Endorsement', done: data.endorsements.length > 0 },
    { label: 'Sertifikasi', done: data.certifications.length > 0 },
    { label: 'Artikel', done: data.articles.length > 0 },
    { label: 'Sosial media', done: Boolean(data.socials.linkedin && data.socials.github && data.socials.whatsapp && data.socials.email && data.socials.portfolioUrl) },
    { label: 'Call to action', done: Boolean(data.cta.title && data.cta.description) },
  ];
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

type UserRole = 'Mentor' | 'Mentee';

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

type NavId = 'home' | 'booking' | 'mentor' | 'portfolios' | 'simulator' | 'courses';

interface NavItem {
  id: NavId;
  label: string;
  icon: React.FC<IconProps>;
  /** Small pill after the label, e.g. to flag a newly launched feature. */
  badge?: string;
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
  const portfolioChecks = portfolio ? portfolioSectionChecks(portfolio.data) : [];
  const portfolioDone = portfolioChecks.filter((c) => c.done).length;
  const portfolioPercent = portfolio ? Math.round((portfolioDone / PORTFOLIO_SECTION_COUNT) * 100) : null;
  // Nudge toward a mentor review once the portfolio is substantially filled
  // (≥80%) — independent of existing bookings, which may cover other topics.
  const showMentorNudge = portfolioPercent !== null && portfolioPercent >= 80;
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
  const { config, loading: configLoading } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const activeNav: NavId = (() => {
    const seg = location.pathname.replace(/^\/dashboard\/?/, '').split('/')[0];
    return seg === 'portfolios' || seg === 'booking' || seg === 'mentor' || seg === 'simulator' || seg === 'courses' ? seg : 'home';
  })();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mobile drawer: close on Escape and lock page scroll while open.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [sidebarOpen]);
  const [formOpen, setFormOpen] = useState(false);
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  // URL claimed on the /portfolio landing before login: open the editor with
  // it prefilled the first time the member lands on Portfolio without one.
  const [claimedSlug] = useState(readPortfolioClaim);

  // Landing claim: once the portfolio has loaded on the Portfolio section, show
  // the editor prefilled (no portfolio yet) until it's closed or saved; a member
  // who already has a portfolio just has the claim dropped.
  const [claimDismissed, setClaimDismissed] = useState(false);
  const claimOpen = !!claimedSlug && !claimDismissed && activeNav === 'portfolios'
    && !portfolioLoading && !portfolioLoadError && !portfolio;
  const showPortfolioForm = portfolioFormOpen || claimOpen;
  useEffect(() => {
    if (claimedSlug && !portfolioLoading && portfolio) clearPortfolioClaim();
  }, [claimedSlug, portfolioLoading, portfolio]);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingDetailId, setBookingDetailId] = useState<string | null>(null);
  const [assignedBookingDetailId, setAssignedBookingDetailId] = useState<string | null>(null);
  const [menteePortfolio, setMenteePortfolio] = useState<{ forId: string; slug: string | null; cvUrl: string | null } | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);
  const [publishing, setPublishing] = useState(false);
  // Public URL just published: shows the success popup.
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // One-click publish / unpublish from the dashboard card (saves the stored data as is).
  const setPortfolioStatus = (next: 'draft' | 'published') => {
    if (!portfolio) return;
    const publish = next === 'published';
    openConfirm({
      mode: 'cta',
      variant: publish ? 'info' : 'warning',
      icon: publish ? 'info' : 'alert',
      confirmLabel: publish ? 'Ya, publish sekarang' : 'Jadikan draft',
      title: publish ? 'Publish portfolio kamu?' : 'Jadikan portfolio draft?',
      description: publish
        ? <>Setelah dipublish, portfolio kamu langsung live di <strong className="font-semibold text-ld-onyx break-all">{portfolioUrl.replace(/^https?:\/\//, '')}</strong> dan bisa dibuka siapa saja, termasuk recruiter. Bisa dijadikan draft lagi kapan saja.</>
        : 'Link publik tidak bisa dibuka sampai kamu publish lagi. Isi portfolio tidak berubah.',
      onConfirm: async () => {
        setPublishing(true);
        const result = await updatePortfolio({ slug: portfolio.slug, status: next, data: portfolio.data });
        setPublishing(false);
        if (!result.ok) { showSnackbar(result.reason || 'Gagal mengubah status portfolio.', 'error'); return; }
        if (publish) {
          setPublishedUrl(portfolioUrl);
          track('portfolio_published', { source: 'status_toggle' });
        }
        else showSnackbar('Portfolio dijadikan draft. Link publik tidak bisa dibuka.', 'success');
      },
    });
  };
  const copiedTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);
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
    if (newStatus === 'canceled' && !(await confirmAction({ title: `Batalkan booking dari "${booking.menteeName}"?`, description: 'Slot jadwalnya kembali tersedia untuk mentee lain.', confirmLabel: 'Batalkan booking', variant: 'warning', icon: 'alert' }))) return;
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
  // In the user view an admin sees the same role badge a member would.
  const isAdminAccount = !!user?.roles.includes('admin');
  const userRole: UserRole = isVerifiedMentor ? 'Mentor' : 'Mentee';
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
    { id: 'home', label: 'Dashboard', icon: DashboardIcon },
    { id: 'courses', label: 'QA Course', icon: QaCourseIcon, badge: 'New' },
    { id: 'simulator', label: 'QA Simulator', icon: QaSimulatorIcon, badge: 'New' },
    { id: 'portfolios', label: 'Portfolio', icon: QaPortfolioIcon },
    { id: 'booking', label: 'Mentoring', icon: MentoringIcon },
    {
      id: 'mentor',
      label: isVerifiedMentor ? 'Profil Mentor' : 'Aplikasi Mentor',
      icon: MentorIcon,
    },
  ];

  const activeItem = NAV_ITEMS.find((item) => item.id === activeNav) ?? NAV_ITEMS[0];
  const navPath = (id: NavId) => (id === 'home' ? '/dashboard' : `/dashboard/${id}`);

  // Desktop rail is compact; the mobile drawer gets larger icons, text and
  // ≥44px touch targets.
  const renderSidebar = (mobile: boolean) => (
    <>
      <Link to="/" aria-label="Mentor.QA, ke halaman utama" className={`flex items-center gap-2.5 h-16 border-b border-ld-frost/60 no-underline transition-colors hover:bg-ld-cloud/60 focus-visible:outline-2 focus-visible:outline-ld-violet focus-visible:-outline-offset-2 ${mobile ? 'pl-5 pr-14' : 'px-4'}`}>
        <img src="/shared/img/mentor-logo-96.webp" alt="Mentor.QA" width={36} height={36} className={`${mobile ? 'w-9 h-9' : 'w-8 h-8'} rounded-lg object-contain shrink-0`} />
        <div className="min-w-0">
          <p className={`m-0 font-semibold text-ld-onyx leading-tight truncate ${mobile ? 'text-base' : 'text-sm'}`}>Mentor.QA</p>
          <p className={`m-0 text-ld-fog leading-tight truncate ${mobile ? 'text-xs' : 'text-[11px]'}`}>Dashboard</p>
        </div>
      </Link>

      <nav className={`flex-1 overflow-y-auto ${mobile ? 'p-4 space-y-1.5' : 'p-3 space-y-1'}`} aria-label="Menu dashboard">
        {/* Non-applicants reach the mentor flow via the status card on the Mentoring tab. */}
        {NAV_ITEMS.filter((item) => item.id !== 'mentor' || !!mentor).map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { navigate(navPath(item.id)); setSidebarOpen(false); }}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center rounded-lg text-left cursor-pointer border-none transition-colors ${mobile ? 'gap-3 px-3 py-2.5 min-h-[52px]' : 'gap-2.5 px-2.5 py-1.5'} ${active
                ? 'bg-ld-lilac/60 text-ld-violet'
                : 'bg-transparent text-ld-slate hover:bg-ld-cloud hover:text-ld-graphite'
                }`}
            >
              <Icon size={mobile ? 36 : 28} className={`shrink-0 ${mobile ? 'rounded-[9px]' : 'rounded-[7px]'} transition-shadow ${active ? 'ring-1 ring-ld-violet/50' : ''}`} />
              <span className={`flex-1 min-w-0 truncate ${mobile ? 'text-[15px]' : 'text-sm'} ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              {item.badge && (
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-ld-violet text-white text-[10px] font-semibold uppercase tracking-wide leading-none">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );

  const mentorStatus = mentor?.verificationStatus;
  const mentorStatusCard = (
    <DashboardBanner
      illustration={<MentoringBannerIllustration />}
      title={
        <span className="inline-flex flex-wrap items-center gap-2">
          {!mentor ? 'Yuk, Jadi Mentor QA!' : isVerifiedMentor ? 'Kamu mentor terverifikasi' : mentorStatus === 'pending' ? 'Aplikasi mentor sedang direview' : 'Aplikasi mentor ditolak'}
          {mentor && (
            <StatusBadge tone={mentorStatus === 'pending' ? 'amber' : mentorStatus === 'rejected' ? 'red' : 'emerald'}>
              {mentorStatus === 'pending' ? 'Direview' : mentorStatus === 'rejected' ? 'Ditolak' : 'Terverifikasi'}
            </StatusBadge>
          )}
        </span>
      }
      description={
        loading ? 'Memuat status…'
          : loadError ? <span className="text-red-500">{loadError}</span>
          : !mentor ? 'Punya pengalaman QA? Bagikan ilmumu lewat sesi 1:1 dengan mentee. Admin akan review aplikasimu.'
          : mentorStatus === 'pending' ? 'Admin akan meninjau profil mentor kamu. Cek lagi nanti.'
          : mentorStatus === 'rejected' ? (mentor.rejectionReason || 'Perbaiki profilmu lalu ajukan ulang.')
          : 'Profilmu tampil publik. Mentee bisa melihat profilmu dan booking sesi 1:1.'
      }
      actions={!loading && !loadError && (mentorStatus === 'pending' ? (
        activeNav !== 'mentor' && (
          <button type="button" onClick={() => navigate(navPath('mentor'))} className={CARD_ACTION_SECONDARY}>
            <Eye size={16} /> Lihat Aplikasi
          </button>
        )
      ) : (
        <>
          <button type="button" onClick={() => { navigate(navPath('mentor')); setFormOpen(true); }} className={CARD_ACTION_PRIMARY}>
            {!mentor && <>Ajukan Jadi Mentor <ArrowRight size={16} /></>}
            {mentorStatus === 'rejected' && <><Pencil size={16} /> Edit & Ajukan Ulang</>}
            {isVerifiedMentor && <><Pencil size={16} /> Edit Profil Mentor</>}
          </button>
          {isVerifiedMentor && mentor && (
            <a href={`/mentor/${mentor.id}`} target="_blank" rel="noreferrer" className={CARD_ACTION_SECONDARY}>
              <ExternalLink size={16} /> Profil Publik
            </a>
          )}
        </>
      ))}
    />
  );

  const mentorPreviewGrid = mentor && (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-5">
        <DashboardCard title="Profil">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 min-w-0">
              <img
                src={mentor.avatar || DEFAULT_MENTOR_AVATAR}
                alt={mentor.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="m-0 font-ld-display text-base font-semibold tracking-[-0.01em] text-ld-onyx truncate">{mentor.name}</p>
                <p className="m-0 text-sm text-ld-slate leading-relaxed mt-1">{mentor.bio}</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 shrink-0 sm:text-right">
              <p className="m-0 text-xs text-ld-fog whitespace-nowrap">{mentor.whatsapp}</p>
              <code className="inline-block px-2.5 py-1 rounded-md bg-ld-cloud text-ld-graphite text-xs font-medium">{mentor.id}</code>
            </div>
          </div>
          {mentor.detailProfile && (
            <p className="text-sm text-ld-slate leading-relaxed whitespace-pre-line m-0">{mentor.detailProfile}</p>
          )}
        </DashboardCard>

        <DashboardCard title="Jadwal Mingguan">
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
            <p className="text-sm text-ld-slate m-0">Belum ada jadwal yang tersedia.</p>
          )}
        </DashboardCard>
      </div>

      <div className="lg:col-span-2 space-y-5">
        <DashboardCard title="Expertise">
          {mentor.expertise.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {mentor.expertise.map((id) => (
                <span key={id} className="px-2.5 py-1 rounded-lg border border-ld-ash text-ld-graphite text-xs font-medium">
                  {topics.find((t) => t.id === id)?.label ?? id}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ld-slate m-0">Belum ada area keahlian ditambahkan.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Pengalaman Kerja">
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
                      {formatMonth(entry.startDate)} - {entry.isCurrent ? 'Sekarang' : formatMonth(entry.endDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ld-slate m-0">Belum ada pengalaman kerja ditambahkan.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Platform Mentoring">
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
            <p className="text-sm text-ld-slate m-0">Belum aktif di platform mentoring lain.</p>
          )}
        </DashboardCard>
      </div>
    </div>
  );

  // Same visual language as OnboardingRecommendationCard: product icon,
  // small label, display-font title, midnight CTA, divider footer.
  const portfolioUrl = portfolio ? `${window.location.origin}/portfolio/${portfolio.slug}` : '';
  const nextPortfolioSection = portfolioChecks.find((c) => !c.done)?.label;
  const portfolioStatusCard = (
    <DashboardCard
        icon={<QaPortfolioIcon size={44} />}
        eyebrow="Portfolio QA kamu"
        title={portfolio ? (portfolio.data.profile.name || 'Portfolio tanpa nama') : 'Portfolio QA'}
        badge={portfolio && <StatusBadge tone={PORTFOLIO_STATUS_TONE[portfolio.status]}>{portfolio.status}</StatusBadge>}
        actions={!portfolioLoading && !portfolioLoadError && (
          <>
            {portfolio?.status === 'published' && (
              <a href={`/portfolio/${portfolio.slug}`} target="_blank" rel="noreferrer" className={CARD_ACTION_SECONDARY}>
                <ExternalLink size={16} /> Lihat
              </a>
            )}
            <button type="button" onClick={() => setPortfolioFormOpen(true)} className={CARD_ACTION_PRIMARY}>
              {portfolio ? <><Pencil size={16} /> Edit Portfolio</> : <>Buat Portfolio <ArrowRight size={16} /></>}
            </button>
          </>
        )}
    >
      {portfolioLoading ? (
        <LoadingState label="Memuat portfolio…" />
      ) : portfolioLoadError ? (
        <p className="text-sm text-red-500 m-0">{portfolioLoadError}</p>
      ) : !portfolio ? (
        <EmptyState
          illustration={<EmptyPortfolioIllustration />}
          title="Belum ada portfolio"
          description="Showcase pengalaman, proyek, dan sertifikasi QA kamu lewat halaman portfolio publik."
        />
      ) : (
        // In-progress and complete share one layout — completeness panel on
        // the left, public-link panel on the right — only the tone changes.
        (() => {
          const complete = portfolioDone >= PORTFOLIO_SECTION_COUNT;
          const published = portfolio.status === 'published';
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`rounded-lg border px-4 py-3.5 flex flex-col ${complete ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white' : 'border-ld-lilac bg-gradient-to-br from-ld-lilac/50 to-white'}`}>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-semibold text-ld-onyx">{complete ? 'Portfolio kamu sudah lengkap' : 'Lengkapi portfolio kamu'}</p>
                    <p className="m-0 mt-0.5 text-xs text-ld-slate">{complete ? 'Siap dibagikan ke recruiter.' : 'Biar makin dilirik recruiter.'}</p>
                  </div>
                  <span className={`font-ld-display text-2xl font-semibold tracking-[-0.02em] tabular-nums leading-none shrink-0 ${complete ? 'text-emerald-600' : 'text-ld-violet'}`}>
                    {portfolioPercent ?? 0}<span className="text-sm">%</span>
                  </span>
                </div>
                {/* One pixel block per section — echoes the brand's pixel mosaic. */}
                <div
                  className="mt-3 grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${PORTFOLIO_SECTION_COUNT}, minmax(0, 1fr))` }}
                  role="progressbar"
                  aria-label="Kelengkapan portfolio"
                  aria-valuenow={portfolioDone}
                  aria-valuemin={0}
                  aria-valuemax={PORTFOLIO_SECTION_COUNT}
                >
                  {portfolioChecks.map((c) => (
                    <span
                      key={c.label}
                      title={`${c.label}${c.done ? ' ✓' : ''}`}
                      className={`h-2 rounded-[2px] ${c.done ? (complete ? 'bg-emerald-500' : 'bg-ld-violet') : 'bg-white border border-ld-lilac'}`}
                    />
                  ))}
                </div>
                <div className="mt-auto pt-3">
                  {complete ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 size={13} /> {PORTFOLIO_SECTION_COUNT}/{PORTFOLIO_SECTION_COUNT} section terisi
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPortfolioFormOpen(true)}
                      className="inline-flex items-center gap-1 p-0 text-xs font-medium text-ld-slate bg-transparent border-none cursor-pointer hover:text-ld-violet transition-colors"
                    >
                      Berikutnya: <span className="font-semibold text-ld-violet">{nextPortfolioSection}</span>
                      <ArrowRight size={12} className="text-ld-violet" />
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-ld-frost bg-white px-4 py-3.5 flex flex-col">
                <p className="m-0 text-sm font-semibold text-ld-onyx">Link publik</p>
                <p className="m-0 mt-0.5 text-xs text-ld-slate">
                  {published ? 'Bisa dibuka siapa saja.' : 'Masih draft. Publish dulu agar link bisa dibuka.'}
                </p>
                <div className="mt-3 flex items-center gap-1.5 min-w-0 rounded-md bg-ld-cloud pl-3 pr-1 py-1">
                  <span className="flex-1 font-ld-mono text-xs text-ld-slate truncate">{portfolioUrl.replace(/^https?:\/\//, '')}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(portfolioUrl);
                      } catch {
                        showSnackbar('Gagal menyalin link. Salin manual dari kolom di sampingnya.', 'error');
                        return;
                      }
                      setUrlCopied(true);
                      showSnackbar('Link portfolio berhasil disalin!', 'success');
                      window.clearTimeout(copiedTimer.current);
                      copiedTimer.current = window.setTimeout(() => setUrlCopied(false), 1500);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-md text-ld-steel hover:text-ld-violet hover:bg-white cursor-pointer border-none bg-transparent transition-colors shrink-0"
                    aria-label="Salin link portfolio"
                  >
                    {urlCopied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="mt-auto pt-3">
                  {published ? (
                    <button
                      type="button"
                      onClick={() => setPortfolioStatus('draft')}
                      disabled={publishing}
                      className="inline-flex items-center gap-1 p-0 text-xs font-medium text-ld-slate bg-transparent border-none cursor-pointer hover:text-ld-graphite transition-colors disabled:opacity-50"
                    >
                      <EyeOff size={13} /> Jadikan draft
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPortfolioStatus('published')}
                      disabled={publishing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-xs font-medium border-none cursor-pointer transition-colors disabled:opacity-60"
                    >
                      <Globe size={13} /> {publishing ? 'Memproses…' : 'Publish portfolio'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </DashboardCard>
  );

  const bookingStatusCard = (
    <DashboardCard
        icon={<MentoringIcon size={44} />}
        eyebrow="Sesi mentoring kamu"
        title="Booking Saya"
        actions={(
          <button
            type="button"
            onClick={() => setBookingFormOpen(true)}
            disabled={!bookingRules}
            className={`${CARD_ACTION_PRIMARY} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <Plus size={16} /> Buat Booking
          </button>
        )}
    >
      {!bookingRules && !configLoading && (
        <p className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">Gagal memuat aturan booking. Muat ulang halaman untuk membuat booking baru.</p>
      )}
      {bookingActionError && (
        <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{bookingActionError}</p>
      )}
      {bookingsLoading ? (
        <LoadingState label="Memuat booking…" />
      ) : bookingsLoadError ? (
        <p className="text-sm text-red-500 m-0">{bookingsLoadError}</p>
      ) : myBookings.length === 0 ? (
        <EmptyState
          illustration={<EmptyCalendarIllustration />}
          title="Belum ada booking"
          description="Jadwalkan sesi 1:1 pertamamu dan dapatkan arahan langsung dari mentor QA."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {myBookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-ld-frost overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3.5 py-2.5 bg-ld-cloud/60 border-b border-ld-frost">
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
                <p className="m-0 font-ld-display text-base font-semibold tracking-[-0.01em] text-ld-onyx mb-3">{topicLabels(booking.topics)}</p>
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
                    className={LIST_ACTION_NEUTRAL}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const bookingDetailCard = bookingDetail && (() => {
    const mentor = bookableMentors.find((m) => m.id === bookingDetail.mentorId);
    return (
      <div className={ADMIN_CARD}>
        <DashboardCardHeader
          onBack={() => setBookingDetailId(null)}
          stickyActionsOnMobile
          eyebrow="Detail booking"
          title={topicLabels(bookingDetail.topics) || 'Sesi mentoring'}
          badge={<StatusBadge tone={BOOKING_STATUS_TONE[bookingDetail.status]}>{BOOKING_STATUS_LABEL[bookingDetail.status]}</StatusBadge>}
          actions={(bookingDetail.status === 'booked' || bookingDetail.status === 'confirmed') && (
            <button
              type="button"
              onClick={() => handleCancelBooking(bookingDetail)}
              disabled={cancelingBookingId === bookingDetail.id}
              className={CARD_ACTION_DANGER}
            >
              Batalkan Booking
            </button>
          )}
        />
        <div className={`${ADMIN_CARD_BODY} max-md:pb-24`}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-5">
              <div>
                <p className="m-0 text-xs text-ld-fog mb-1">Booking ID</p>
                <code className="text-sm font-medium text-ld-graphite uppercase">{bookingDetail.id}</code>
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
                  {bookingDetail.notes || <span className="text-ld-fog">Tidak ada catatan.</span>}
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
                  <p className="m-0 font-ld-display text-base font-semibold tracking-[-0.01em] text-ld-onyx truncate">{mentorName(bookingDetail.mentorId)}</p>
                  {mentor?.whatsapp && <p className="m-0 text-xs text-ld-fog mt-0.5">{mentor.whatsapp}</p>}
                  {mentor?.bio && <p className="m-0 text-sm text-ld-slate leading-relaxed mt-2">{mentor.bio}</p>}
                  {mentor && (
                    <a
                      href={`/mentor/${mentor.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${LIST_ACTION_NEUTRAL} mt-3`}
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
      <DashboardCardHeader
        onBack={() => setAssignedBookingDetailId(null)}
        stickyActionsOnMobile
        eyebrow="Detail booking masuk"
        title={assignedBookingDetail.menteeName}
        badge={<StatusBadge tone={BOOKING_STATUS_TONE[assignedBookingDetail.status]}>{BOOKING_STATUS_LABEL[assignedBookingDetail.status]}</StatusBadge>}
        actions={(assignedBookingDetail.status === 'booked' || assignedBookingDetail.status === 'confirmed') && (
          <>
            {assignedBookingDetail.status === 'booked' && (
              <button
                type="button"
                onClick={() => handleAssignedTransition(assignedBookingDetail, 'confirmed')}
                disabled={assignedTransitioningId === assignedBookingDetail.id}
                className={CARD_ACTION_SUCCESS}
              >
                Confirm
              </button>
            )}
            {assignedBookingDetail.status === 'confirmed' && (
              <button
                type="button"
                onClick={() => handleAssignedTransition(assignedBookingDetail, 'completed')}
                disabled={assignedTransitioningId === assignedBookingDetail.id}
                className={CARD_ACTION_SECONDARY}
              >
                Complete
              </button>
            )}
            <button
              type="button"
              onClick={() => handleAssignedTransition(assignedBookingDetail, 'canceled')}
              disabled={assignedTransitioningId === assignedBookingDetail.id}
              className={CARD_ACTION_DANGER}
            >
              Cancel
            </button>
          </>
        )}
      />
      <div className={`${ADMIN_CARD_BODY} max-md:pb-24`}>
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
                {assignedBookingDetail.notes || <span className="text-ld-fog">Tidak ada catatan.</span>}
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
                <p className="m-0 font-ld-display text-base font-semibold tracking-[-0.01em] text-ld-onyx truncate">{assignedBookingDetail.menteeName}</p>
                <p className="m-0 text-xs text-ld-fog mt-0.5 truncate">{assignedBookingDetail.menteeEmail}</p>
                <p className="m-0 text-xs text-ld-fog mt-0.5">{assignedBookingDetail.menteeWhatsapp}</p>
                {menteePortfolio && menteePortfolio.forId === assignedBookingDetailId && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {menteePortfolio.cvUrl && (
                      <a
                        href={menteePortfolio.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={LIST_ACTION_NEUTRAL}
                      >
                        <ExternalLink size={13} /> Lihat CV
                      </a>
                    )}
                    {menteePortfolio.slug && (
                      <a
                        href={`/portfolio/${menteePortfolio.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className={LIST_ACTION_NEUTRAL}
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
    <DashboardCard
        icon={<MentoringIcon size={44} />}
        eyebrow="Sebagai mentor"
        title="Booking Masuk"
    >
      {assignedActionError && (
        <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{assignedActionError}</p>
      )}
      {assignedLoading ? (
        <LoadingState label="Memuat booking…" />
      ) : assignedLoadError ? (
        <p className="text-sm text-red-500 m-0">{assignedLoadError}</p>
      ) : assignedBookings.length === 0 ? (
        <EmptyState
          illustration={<EmptyInboxIllustration />}
          title="Belum ada booking masuk"
          description="Booking dari mentee akan muncul di sini. Pastikan jadwal ketersediaan di profil mentor kamu sudah terisi."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {assignedBookings.map((booking) => (
            <div key={booking.id} className="rounded-xl border border-ld-frost overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3.5 py-2.5 bg-ld-cloud/60 border-b border-ld-frost">
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
                <p className="m-0 font-ld-display text-base font-semibold tracking-[-0.01em] text-ld-onyx mb-3">{topicLabels(booking.topics)}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-ld-lilac text-ld-violet flex items-center justify-center text-sm font-semibold shrink-0">
                      {booking.menteeName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="m-0 text-xs text-ld-fog leading-tight">Mentee:</p>
                      <p className="m-0 text-sm font-medium text-ld-onyx truncate leading-tight">{booking.menteeName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap sm:shrink-0 max-sm:[&>*]:flex-1">
                    <button
                      onClick={() => setAssignedBookingDetailId(booking.id)}
                      className={LIST_ACTION_NEUTRAL}
                    >
                      Lihat Detail
                    </button>
                    {booking.status === 'booked' && (
                      <button
                        onClick={() => handleAssignedTransition(booking, 'confirmed')}
                        disabled={assignedTransitioningId === booking.id}
                        className={LIST_ACTION_SUCCESS}
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleAssignedTransition(booking, 'completed')}
                        disabled={assignedTransitioningId === booking.id}
                        className={LIST_ACTION_NEUTRAL}
                      >
                        Complete
                      </button>
                    )}
                    {(booking.status === 'booked' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => handleAssignedTransition(booking, 'canceled')}
                        disabled={assignedTransitioningId === booking.id}
                        className={LIST_ACTION_DANGER}
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
    </DashboardCard>
  );

  return (
    <div className="min-h-screen flex bg-ld-cloud font-ld-sans">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-ld-frost/70 sticky top-0 h-screen">
        {renderSidebar(false)}
      </aside>

      {/* Sidebar — mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        inert={!sidebarOpen}
      >
        <div className="absolute inset-0 bg-ld-midnight/40" onClick={() => setSidebarOpen(false)} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className={`absolute inset-y-0 left-0 w-[85vw] max-w-[320px] flex flex-col bg-white border-r border-ld-frost/70 pb-[env(safe-area-inset-bottom)] shadow-[rgba(39,40,53,0.1)_0px_0px_0px_1px,rgba(39,40,53,0.08)_0px_24px_24px_-12px] transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-lg text-ld-steel hover:text-ld-graphite hover:bg-ld-cloud bg-transparent border-none cursor-pointer transition-colors"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
          {renderSidebar(true)}
        </aside>
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-3 px-4 md:px-6 bg-white/95 backdrop-blur border-b border-ld-frost/70">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 -ml-2 flex items-center justify-center rounded-lg text-ld-graphite hover:bg-ld-cloud bg-transparent border-none cursor-pointer"
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="m-0 text-base font-semibold text-ld-onyx leading-tight truncate">{activeItem.label}</h1>
            </div>
          </div>

          {user && (
            <ProfileMenu
              user={user}
              roleLabel={userRole === 'Mentee' ? null : userRole}
              showViewSwitch={isAdminAccount}
              onLogout={() => { logout(); showSnackbar('Kamu telah berhasil keluar.', 'info'); }}
            />
          )}
        </header>

        <main className="flex-1 p-4 md:p-6 w-full">
          {activeNav === 'home' && (
            <div className="space-y-5">
              <OnboardingRecommendationCard />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <DashboardShortcutCard
                  icon={<QaPortfolioIcon size={44} />}
                  eyebrow="Portfolio QA"
                  title={portfolio ? (portfolio.data.profile.name || 'Portfolio tanpa nama') : 'Belum ada portfolio'}
                  badge={portfolio && <StatusBadge tone={PORTFOLIO_STATUS_TONE[portfolio.status]} className="shrink-0">{portfolio.status}</StatusBadge>}
                  ctaLabel={portfolio ? 'Kelola Portfolio' : 'Buat Portfolio'}
                  onOpen={() => { navigate(navPath('portfolios')); if (!portfolio) setPortfolioFormOpen(true); }}
                >
                  {portfolio ? (
                    <>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-xs text-ld-slate">
                          {portfolioDone >= PORTFOLIO_SECTION_COUNT ? 'Portfolio kamu sudah lengkap.' : `Berikutnya: ${nextPortfolioSection}`}
                        </span>
                        <span className={`font-ld-mono text-xs font-semibold tabular-nums ${portfolioDone >= PORTFOLIO_SECTION_COUNT ? 'text-emerald-600' : 'text-ld-violet'}`}>{portfolioPercent ?? 0}%</span>
                      </div>
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${PORTFOLIO_SECTION_COUNT}, minmax(0, 1fr))` }} aria-hidden="true">
                        {portfolioChecks.map((c) => (
                          <span key={c.label} className={`h-2 rounded-[2px] ${c.done ? (portfolioDone >= PORTFOLIO_SECTION_COUNT ? 'bg-emerald-500' : 'bg-ld-violet') : 'bg-ld-frost'}`} />
                        ))}
                      </div>
                      {showMentorNudge && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); navigate('/mentoring/booking'); }}
                          className="mt-3 inline-flex items-center gap-1 p-0 text-xs font-medium text-ld-slate bg-transparent border-none cursor-pointer hover:text-ld-violet transition-colors"
                        >
                          Biar makin siap, <span className="font-semibold text-ld-violet">minta mentor review</span>
                          <ArrowRight size={12} className="text-ld-violet" />
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="m-0 text-sm text-ld-slate">Showcase pengalaman, proyek, dan sertifikasi QA kamu dalam satu halaman publik.</p>
                  )}
                </DashboardShortcutCard>

                <DashboardShortcutCard
                  icon={<MentoringIcon size={44} />}
                  eyebrow="Mentoring"
                  title={activeBooking ? topicLabels(activeBooking.topics) || 'Sesi mentoring' : 'Belum ada booking'}
                  badge={activeBooking && (
                    <StatusBadge tone={BOOKING_STATUS_TONE[activeBooking.status]} className="shrink-0">
                      {BOOKING_STATUS_LABEL[activeBooking.status]}
                    </StatusBadge>
                  )}
                  ctaLabel={activeBooking ? 'Lihat Detail' : 'Buat Booking'}
                  onOpen={() => {
                    navigate(navPath('booking'));
                    if (activeBooking) setBookingDetailId(activeBooking.id);
                    else setBookingFormOpen(true);
                  }}
                >
                  {activeBooking ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={mentorAvatar(activeBooking.mentorId) || DEFAULT_MENTOR_AVATAR}
                        alt={mentorName(activeBooking.mentorId)}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="m-0 text-sm font-medium text-ld-onyx truncate">{mentorName(activeBooking.mentorId)}</p>
                        <p className="m-0 text-xs text-ld-slate truncate">
                          <CalendarCheck size={11} className="inline -mt-0.5" /> {formatDateLabel(parseDateId(activeBooking.date))} · {activeBooking.time} WIB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="m-0 text-sm text-ld-slate">Jadwalkan sesi 1:1 dengan mentor QA untuk review portfolio atau diskusi karier.</p>
                  )}
                </DashboardShortcutCard>
              </div>
            </div>
          )}

          {activeNav === 'booking' && (
            bookingFormOpen && bookingRules ? (
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
                {mentorStatusCard}
                {isVerifiedMentor && assignedBookingsCard}
                {bookingStatusCard}
              </div>
            )
          )}

          {activeNav === 'mentor' && (
            formOpen ? (
              <MentorForm
                onClose={() => {
                  setFormOpen(false);
                  if (!mentor) navigate(navPath('booking'));
                }}
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

          {activeNav === 'courses' && <CourseDashboardTab />}
          {activeNav === 'simulator' && <SimulatorDashboardTab />}

          {activeNav === 'portfolios' && (
            showPortfolioForm ? (
              <PortfolioForm
                variant="member"
                onClose={() => { setPortfolioFormOpen(false); setClaimDismissed(true); }}
                initialSlug={portfolio ? null : claimedSlug}
                onSubmit={async (payload) => {
                  const wasPublished = portfolio?.status === 'published';
                  const result = portfolio ? await updatePortfolio(payload) : await createPortfolio(payload);
                  if (result.ok) {
                    clearPortfolioClaim();
                    setClaimDismissed(true);
                    setPortfolioFormOpen(false);
                    if (payload.status === 'published' && !wasPublished) {
                      setPublishedUrl(`${window.location.origin}/portfolio/${payload.slug}`);
                      track('portfolio_published', { source: portfolio ? 'form_update' : 'form_create' });
                    } else {
                      showSnackbar(
                        payload.status === 'draft' && wasPublished ? 'Portfolio dijadikan draft. Link publik tidak bisa dibuka.'
                          : portfolio ? 'Portfolio berhasil diperbarui!' : 'Portfolio berhasil dibuat!',
                        'success'
                      );
                    }
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
      <AnimatePresence>
        {publishedUrl && (
          <PortfolioPublishedDialog url={publishedUrl} photoUrl={portfolio?.data.profile.photo || undefined} onClose={() => setPublishedUrl(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberDashboard;
