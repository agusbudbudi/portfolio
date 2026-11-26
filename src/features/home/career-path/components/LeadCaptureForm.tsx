import React, { useRef, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { buildWhatsappUrl, hasLeadEndpoint, submitLead, validateLead, type LeadContext, type LeadErrors, type LeadInput } from '../lib/leadCapture';
import WhatsAppIcon from '../../../../components/illustration/WhatsAppIcon';
import { track } from '../../../../lib/analytics';

type Status = 'idle' | 'submitting' | 'success' | 'whatsapp' | 'error';

const inputCls = 'h-11 w-full rounded-lg border border-ld-ash bg-white px-3 text-sm text-ld-onyx placeholder:text-ld-fog focus:border-ld-violet focus:outline-2 focus:outline-ld-violet/30';

const Field: React.FC<{ id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }> = ({ id, label, optional, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ld-graphite">
      {label} {optional && <span className="font-normal text-ld-fog">(opsional)</span>}
    </label>
    {children}
    {error && <p id={`${id}-error`} role="alert" className="m-0 mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const LeadCaptureForm: React.FC<{ context: LeadContext; defaultExperience: string }> = ({ context, defaultExperience }) => {
  const [values, setValues] = useState<LeadInput>({ name: '', email: '', whatsapp: '', experience: defaultExperience });
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const started = useRef(false);

  const set = (k: keyof LeadInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!started.current) { started.current = true; track('lead_form_start'); }
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined })); // don't keep a stale message while they fix it
  };
  const aria = (k: keyof LeadInput) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `lead-${k}-error` : undefined });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return; // no duplicate submissions
    const found = validateLead(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    track('lead_form_submit', { channel: hasLeadEndpoint ? 'api' : 'whatsapp' });

    if (!hasLeadEndpoint) {
      // Opened synchronously from the click so popup blockers allow it.
      window.open(buildWhatsappUrl(values, context), '_blank', 'noopener,noreferrer');
      track('whatsapp_click', { source: 'lead_form' });
      setStatus('whatsapp');
      return;
    }
    setStatus('submitting');
    try {
      await submitLead(values, context);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="m-0 text-sm text-emerald-900">Terima kasih! Datamu sudah kami terima. Kami akan menghubungimu lewat WhatsApp atau email dengan arahan sesuai jalurmu.</p>
      </div>
    );
  }
  if (status === 'whatsapp') {
    return (
      <div role="status" className="rounded-2xl border border-ld-lavender bg-ld-lilac/50 p-5 text-sm text-ld-graphite">
        <p className="m-0">Kami membuka WhatsApp dengan datamu yang sudah terisi. <strong>Tekan kirim di sana</strong> untuk menghubungi kami. Belum ada yang terkirim sebelum kamu menekannya.</p>
        {/* A button, not a link: the URL carries the visitor's details, which
            must not sit in the DOM where analytics autocapture reads it. */}
        <button
          type="button"
          onClick={() => window.open(buildWhatsappUrl(values, context), '_blank', 'noopener,noreferrer')}
          className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-ld-violet underline"
        >
          Tidak terbuka? Ketuk di sini
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-ld-frost bg-white p-5 sm:p-6">
      <h3 className="m-0 text-lg font-semibold text-ld-onyx">Mau jalurmu direview mentor?</h3>
      <p className="m-0 mt-1 text-sm text-ld-slate">Tinggalkan kontakmu untuk konsultasi karier gratis{hasLeadEndpoint ? '' : ' lewat WhatsApp'}.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="lead-name" label="Nama" error={errors.name}>
          <input id="lead-name" name="name" autoComplete="name" value={values.name} onChange={set('name')} className={inputCls} placeholder="Namamu" {...aria('name')} />
        </Field>
        <Field id="lead-email" label="Email" error={errors.email}>
          <input id="lead-email" name="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} className={inputCls} placeholder="kamu@email.com" {...aria('email')} />
        </Field>
        <Field id="lead-whatsapp" label="WhatsApp" error={errors.whatsapp}>
          <input id="lead-whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" value={values.whatsapp} onChange={set('whatsapp')} className={inputCls} placeholder="0812xxxxxxxx" {...aria('whatsapp')} />
        </Field>
        <Field id="lead-experience" label="Pengalaman QA saat ini" optional>
          <input id="lead-experience" name="experience" value={values.experience} onChange={set('experience')} className={inputCls} placeholder="contoh: 1 tahun manual testing" />
        </Field>
      </div>
      {status === 'error' && <p role="alert" className="m-0 mt-4 text-sm text-red-600">Ada yang salah. Coba lagi sebentar, ya.</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-ld-violet px-6 text-sm font-medium text-white transition-colors hover:bg-[#1f87e6] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ld-violet"
      >
        {status === 'submitting' ? <Loader2 size={16} className="motion-safe:animate-spin" aria-hidden="true" /> : <WhatsAppIcon size={18} />}
        {status === 'submitting' ? 'Mengirim…' : 'Konsultasi Karier Gratis'}
      </button>
      <p className="m-0 mt-3 text-xs text-ld-fog">Datamu hanya dipakai untuk memberikan arahan karier QA yang relevan.</p>
    </form>
  );
};

export default LeadCaptureForm;
