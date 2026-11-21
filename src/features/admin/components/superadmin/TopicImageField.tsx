import React, { useRef, useState } from 'react';
import { ImageOff, Link2, Loader2, Trash2, Upload } from 'lucide-react';
import { apiUploadImage, ApiError } from '../../../../lib/adminApi';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { useSnackbarStore } from '../../../../store/useSnackbarStore';

// Topic illustration source: either a URL (absolute, or a site path like the
// built-in /mentoring/illustrations/topics/*.svg) or an uploaded SVG file.
// Both end up as the single `topic.image` string, so only one source is ever
// stored; switching mode clears the current value.
type Mode = 'url' | 'upload';

const MAX_SVG_BYTES = 500 * 1024;
// Mirrors the server-side check in api/_endpoints/upload.ts, just for faster feedback.
const UNSAFE_SVG = /<script[\s>]|<foreignObject[\s>]|\son[a-z]+\s*=|javascript:/i;

export const BUILT_IN_TOPIC_ILLUSTRATION_DIR = '/mentoring/illustrations/topics/';

function isUploadedSvg(url: string | undefined): boolean {
  return !!url && /^https:\/\/[^/]+\.blob\.vercel-storage\.com\/Topics\//.test(url);
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const tabClass = (active: boolean) =>
  `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer ${
    active ? 'border-ld-violet bg-ld-lilac/40 text-ld-violet' : 'border-ld-frost bg-white text-ld-fog'
  }`;

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface TopicImageFieldProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  topicId: string;
}

const TopicImageField: React.FC<TopicImageFieldProps> = ({ value, onChange, topicId }) => {
  const token = useAdminAuthStore((s) => s.token);
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [mode, setMode] = useState<Mode>(isUploadedSvg(value) ? 'upload' : 'url');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setError(null);
    setBroken(false);
    onChange(undefined);
  };

  const fail = (msg: string) => {
    setError(msg);
    showSnackbar(msg, 'error');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || !token) return;
    setError(null);
    const looksSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    if (!looksSvg) return fail('File harus berformat SVG.');
    if (file.size > MAX_SVG_BYTES) return fail(`Ukuran SVG maksimal ${MAX_SVG_BYTES / 1024}KB.`);

    const text = await file.text();
    if (!/<svg[\s>]/i.test(text)) return fail('File bukan SVG yang valid.');
    if (UNSAFE_SVG.test(text)) return fail('SVG mengandung script/event handler. Hapus elemen tersebut lalu upload ulang.');

    setUploading(true);
    try {
      const dataBase64 = await readAsBase64(file);
      const safeName = (topicId || file.name.replace(/\.svg$/i, '')).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      const { url } = await apiUploadImage(
        { filename: `${safeName || 'topic'}.svg`, contentType: 'image/svg+xml', dataBase64, feature: 'topics' },
        token
      );
      setBroken(false);
      onChange(url);
      showSnackbar('Ilustrasi berhasil diunggah!', 'success');
    } catch (err) {
      fail(err instanceof ApiError ? err.message : 'Gagal upload SVG.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const preview =
    value && !broken ? (
      <img
        src={value}
        alt="preview"
        onError={() => setBroken(true)}
        className="w-20 h-20 rounded-lg object-cover border border-ld-frost shrink-0 bg-ld-cloud"
      />
    ) : (
      <span className="w-20 h-20 rounded-lg bg-ld-cloud border border-ld-frost shrink-0 flex flex-col items-center justify-center gap-1 text-[10px] text-ld-fog">
        <ImageOff size={16} />
        {broken ? 'rusak' : 'kosong'}
      </span>
    );

  return (
    <div className="block">
      <span className="block text-xs font-medium text-ld-graphite mb-1.5">Ilustrasi (opsional, isi salah satu)</span>

      <div className="flex gap-1.5 mb-2.5">
        <button type="button" onClick={() => switchMode('url')} className={tabClass(mode === 'url')}>
          <Link2 size={12} />
          Dari URL
        </button>
        <button type="button" onClick={() => switchMode('upload')} className={tabClass(mode === 'upload')}>
          <Upload size={12} />
          Upload SVG
        </button>
      </div>

      <div className="flex items-start gap-3">
        {preview}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {mode === 'url' ? (
            <>
              <input
                type="text"
                inputMode="url"
                value={value ?? ''}
                onChange={(e) => {
                  onChange(e.target.value);
                  setBroken(false);
                }}
                placeholder={`https://… atau ${BUILT_IN_TOPIC_ILLUSTRATION_DIR}${topicId || 'fundamental-qa'}.svg`}
                className={inputClass}
              />
              <p className="text-[11px] m-0 text-ld-fog">
                URL gambar (http/https) atau path di situs. Ilustrasi bawaan ada di{' '}
                <code className="font-ld-mono">{BUILT_IN_TOPIC_ILLUSTRATION_DIR}&lt;id&gt;.svg</code>.
              </p>
            </>
          ) : (
            <>
              <input
                ref={inputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite cursor-pointer hover:border-ld-violet disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {uploading ? 'Mengunggah…' : value ? 'Ganti SVG' : 'Pilih file SVG'}
                </button>
                {value && !uploading && (
                  <button
                    type="button"
                    onClick={() => onChange(undefined)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-ld-frost bg-white text-xs font-medium text-red-500 cursor-pointer hover:border-red-300"
                  >
                    <Trash2 size={13} />
                    Hapus
                  </button>
                )}
              </div>
              <p className="text-[11px] m-0 text-ld-fog">SVG maks 500KB, rasio 1:1 (mis. viewBox 400×400). Tanpa script.</p>
            </>
          )}
          {error && <p className="text-[11px] m-0 text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default TopicImageField;
