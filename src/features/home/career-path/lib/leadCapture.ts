import { WHATSAPP_NUMBER } from './contact';

// Lead capture shown under the questionnaire result on /career-path.
//
// There is no lead/CRM backend in this project yet, so nothing is stored by us.
// Two channels, chosen by config:
//   1. VITE_LEAD_ENDPOINT set (same-origin path, e.g. "/api/leads" — the CSP
//      only allows 'self'): POST the lead as JSON. Build that endpoint first.
//   2. Not set (default): hand the lead off to the Mentor.QA WhatsApp number
//      with a pre-filled message. The visitor sends it themselves, so we never
//      claim a submission we can't confirm.

const ENDPOINT = import.meta.env.VITE_LEAD_ENDPOINT as string | undefined;

export interface LeadInput {
  name: string;
  email: string;
  whatsapp: string;
  experience: string;
}

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

/** Normalises Indonesian numbers to digits-only international form (62…). */
export function normalizeWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  // "+62 0812…" carries a trunk 0 that must go.
  if (digits.startsWith('62')) return digits.replace(/^620+/, '62');
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  // A bare "812…" is Indonesian; with a "+" it is another country's code.
  if (digits.startsWith('8') && !raw.trim().startsWith('+')) return `62${digits}`;
  return digits;
}

export function validateLead(input: LeadInput): LeadErrors {
  const errors: LeadErrors = {};
  if (input.name.trim().length < 2) errors.name = 'Masukkan namamu.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email.trim())) errors.email = 'Masukkan alamat email yang valid.';
  const wa = normalizeWhatsapp(input.whatsapp);
  if (wa.length < 10 || wa.length > 15) errors.whatsapp = 'Masukkan nomor WhatsApp yang valid, contoh 0812xxxxxxxx.';
  return errors;
}

export const hasLeadEndpoint = Boolean(ENDPOINT);

export interface LeadContext {
  recommended: string[];
  answers: string[];
}

export type LeadResult =
  | { channel: 'api' }
  | { channel: 'whatsapp'; url: string };

export function buildWhatsappUrl(input: LeadInput, ctx: LeadContext): string {
  const lines = [
    'Halo Mentor.QA, saya ingin konsultasi karier QA gratis.',
    `Nama: ${input.name.trim()}`,
    `Email: ${input.email.trim()}`,
    `WhatsApp: +${normalizeWhatsapp(input.whatsapp)}`,
    input.experience ? `Pengalaman: ${input.experience}` : '',
    ctx.answers.length ? `Jawaban quiz: ${ctx.answers.join(' / ')}` : '',
    ctx.recommended.length ? `Rekomendasi: ${ctx.recommended.join(', ')}` : '',
  ].filter(Boolean);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export async function submitLead(input: LeadInput, ctx: LeadContext, signal?: AbortSignal): Promise<LeadResult> {
  if (!ENDPOINT) return { channel: 'whatsapp', url: buildWhatsappUrl(input, ctx) };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, whatsapp: normalizeWhatsapp(input.whatsapp), ...ctx, source: 'home_career_quiz' }),
    signal,
  });
  if (!res.ok) throw new Error(`lead_http_${res.status}`);
  return { channel: 'api' };
}
