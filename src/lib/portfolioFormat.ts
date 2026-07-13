import React from 'react';
import { GitBranch, GitFork, Star } from 'lucide-react';
import type { EmploymentType } from '../types/portfolio';

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
};

export function formatMonth(value?: string): string {
  if (!value) return '';
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

// Mirrors About.tsx's period-duration formatting, but off the structured
// YYYY-MM fields instead of a free-text "Mon YYYY - Mon YYYY" string.
export function formatDuration(startDate: string, endDate: string | undefined, isCurrent: boolean): string | null {
  const [sy, sm] = startDate.split('-').map(Number);
  if (!sy || !sm) return null;

  const now = new Date();
  const [ey, em] = isCurrent ? [now.getFullYear(), now.getMonth() + 1] : (endDate ?? '').split('-').map(Number);
  if (!ey || !em) return null;

  const totalMonths = Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const yrs = `${years} thn`;
  const mos = `${months} bln`;

  if (years === 0) return mos;
  if (months === 0) return yrs;
  return `${yrs} ${mos}`;
}

export function formatTimeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return minutes <= 1 ? 'Baru saja' : `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}

export const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  'Membuat repository baru': React.createElement(GitBranch, { size: 14 }),
  'Membuat branch baru': React.createElement(GitBranch, { size: 14 }),
  'Fork repository': React.createElement(GitFork, { size: 14 }),
  'Star repository': React.createElement(Star, { size: 14 }),
};

export function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
