import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check, Copy, Link2, Linkedin, Loader2, LogIn } from 'lucide-react';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { apiGetSimulatorProgress, apiSetSimulatorShare, simulatorShareUrl } from '../lib/simulatorApi';

type LoadState = 'loading' | 'ready' | 'error';

const EASE = [0.4, 0, 0.2, 1] as const;
const pop = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 340, damping: 18, delay } },
});
const rise = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, delay } },
});

// Compact share art: a mini portfolio card, a blue link bubble and a LinkedIn
// badge landing on it. Plays once on mount; static under reduced motion.
const ShareArt: React.FC<{ active: boolean }> = ({ active }) => {
  const reduce = !!useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="relative w-[88px] h-[64px] shrink-0"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      <motion.div variants={rise(0.05)} className="absolute left-0 top-1 w-[64px] h-[50px] rounded-lg bg-white border border-ld-frost shadow-[0_8px_18px_-10px_rgba(39,40,53,0.35)] p-2 flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-ld-violet" />
          <span className="h-1.5 w-7 rounded-full bg-ld-graphite/70" />
        </span>
        <span className="h-1 w-11 rounded-full bg-ld-frost" />
        <span className="h-1 w-8 rounded-full bg-ld-frost" />
        <span className="h-1 w-10 rounded-full bg-ld-lavender" />
      </motion.div>
      <motion.span
        variants={pop(0.35)}
        className={`absolute right-1 top-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-[0_6px_14px_-6px_rgba(16,60,120,0.6)] ${active ? 'bg-ld-violet' : 'bg-ld-steel'}`}
      >
        <Link2 size={14} />
      </motion.span>
      <motion.span
        variants={pop(0.55)}
        className="absolute right-3 bottom-0 w-6 h-6 rounded-md bg-[#0a66c2] flex items-center justify-center text-white shadow-[0_6px_14px_-6px_rgba(10,102,194,0.6)]"
      >
        <Linkedin size={13} />
      </motion.span>
    </motion.div>
  );
};

/**
 * Owner-only share banner above a finished simulator portfolio: turns the
 * public link on, copies it, shares it to LinkedIn, or turns it off again
 * (which revokes the link; turning it on later mints a new one).
 */
const ShareBanner: React.FC<{ projectId: string }> = ({ projectId }) => {
  const token = useAdminAuthStore((s) => s.token);
  const location = useLocation();
  const [result, setResult] = useState<{ token: string; shareId: string | null } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiGetSimulatorProgress(projectId, token)
      .then((record) => { if (!cancelled) setResult({ token, shareId: record?.shareId ?? null }); })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, [projectId, token]);

  const state: LoadState = loadError ? 'error' : result && result.token === token ? 'ready' : 'loading';
  const shareId = state === 'ready' ? result!.shareId : null;
  const url = shareId ? simulatorShareUrl(projectId, shareId) : null;

  const toggle = async (enabled: boolean) => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const record = await apiSetSimulatorShare(projectId, enabled, token);
      setResult({ token, shareId: record.shareId ?? null });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengubah pengaturan share.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Gagal menyalin. Salin link secara manual.');
    }
  };

  const btnPrimary = 'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium border-none cursor-pointer no-underline transition-colors disabled:opacity-60 disabled:cursor-wait';
  const btnSecondary = 'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-ld-frost bg-white text-ld-graphite text-sm font-medium cursor-pointer no-underline hover:border-ld-violet transition-colors';

  let title: React.ReactNode;
  let subtitle: React.ReactNode;
  let actions: React.ReactNode = null;

  if (!token) {
    title = 'Login untuk membagikan portfolio ini';
    subtitle = 'Buat link publik untuk CV atau LinkedIn setelah login.';
    actions = (
      <Link to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} className={btnPrimary}>
        <LogIn size={15} /> Masuk
      </Link>
    );
  } else if (state === 'loading') {
    title = 'Memuat pengaturan share…';
    subtitle = <span className="inline-block h-3 w-48 rounded bg-ld-frost animate-pulse align-middle" />;
    actions = <Loader2 size={18} className="animate-spin text-ld-fog" aria-label="Memuat" />;
  } else if (state === 'error') {
    title = 'Pengaturan share gagal dimuat';
    subtitle = 'Muat ulang halaman untuk mencoba lagi.';
  } else if (!url) {
    title = 'Bagikan portfolio ini ke recruiter';
    subtitle = 'Buat link publik untuk CV atau LinkedIn. Bisa dimatikan kapan saja.';
    actions = (
      <button type="button" onClick={() => toggle(true)} disabled={busy} className={btnPrimary}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />} Buat link publik
      </button>
    );
  } else {
    title = (
      <span className="inline-flex items-center gap-2">
        Portfolio kamu publik
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Aktif
        </span>
      </span>
    );
    subtitle = (
      <span className="flex items-center gap-2 min-w-0">
        <span className="font-ld-mono text-xs text-ld-slate truncate">{url.replace(/^https?:\/\//, '')}</span>
        <button
          type="button"
          onClick={() => toggle(false)}
          disabled={busy}
          className="shrink-0 text-xs text-ld-steel bg-transparent border-none p-0 cursor-pointer underline-offset-2 hover:text-red-600 hover:underline disabled:opacity-60"
        >
          Jadikan privat
        </button>
      </span>
    );
    actions = (
      <>
        <button type="button" onClick={copy} className={btnPrimary}>
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Tersalin' : 'Salin link'}
        </button>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btnSecondary}
        >
          <Linkedin size={15} className="text-[#0a66c2]" /> LinkedIn
        </a>
      </>
    );
  }

  return (
    <section
      aria-label="Bagikan portfolio"
      className="print:hidden mb-4 rounded-xl border border-ld-lavender bg-gradient-to-r from-ld-lilac to-white px-4 sm:px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-3"
    >
      <ShareArt active={Boolean(url)} />
      <div className="flex-1 min-w-[200px]">
        <p className="m-0 text-sm font-semibold text-ld-onyx">{title}</p>
        <div className="m-0 mt-1 text-xs text-ld-slate">{subtitle}</div>
        {error && <p className="m-0 mt-1 text-xs text-red-600">{error}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </section>
  );
};

export default ShareBanner;
