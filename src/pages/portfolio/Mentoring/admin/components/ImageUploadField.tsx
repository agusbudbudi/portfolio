import React, { useRef, useState } from 'react';
import { ImageOff, Loader2, Upload } from 'lucide-react';
import { apiUploadImage, ApiError } from '../../../../../lib/adminApi';
import { useAdminAuthStore } from '../../../../../store/useAdminAuthStore';

// Reusable file-upload-to-URL field for the four portfolio image spots
// (profile photo, tool logo, project thumbnail, endorsement photo). Uploads
// through /api/upload (Vercel Blob) and writes the returned URL back via
// onChange — the rest of the form only ever deals with a URL string, same as
// mentor.avatar / topic.image today.
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ImageUploadFieldProps {
  label: string;
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  shape?: 'square' | 'circle' | 'rounded-md';
  fallbackSrc?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, value, onChange, shape = 'square', fallbackSrc }) => {
  const token = useAdminAuthStore((s) => s.token);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || !token) return;
    setError(null);
    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Format harus PNG, JPEG, WEBP, atau GIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Ukuran maksimal ${MAX_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    setUploading(true);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const { url } = await apiUploadImage({ filename: file.name, contentType: file.type, dataBase64 }, token);
      setBroken(false);
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal upload gambar.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const previewClass = shape === 'circle' ? 'rounded-full' : shape === 'rounded-md' ? 'rounded-md' : 'rounded-lg';

  return (
    <div className="block">
      <span className="block text-xs font-medium text-ld-graphite mb-1.5">{label}</span>
      <div className="flex items-center gap-3">
        {value && !broken ? (
          <img
            src={value}
            alt=""
            onError={() => setBroken(true)}
            className={`w-14 h-14 object-cover border border-ld-frost shrink-0 ${previewClass}`}
          />
        ) : fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt=""
            className={`w-14 h-14 object-cover border border-ld-frost shrink-0 ${previewClass}`}
          />
        ) : (
          <span className={`w-14 h-14 bg-ld-cloud border border-ld-frost shrink-0 flex items-center justify-center text-ld-fog ${previewClass}`}>
            <ImageOff size={16} />
          </span>
        )}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite hover:border-ld-violet cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploading ? 'Mengunggah…' : value ? 'Ganti gambar' : 'Unggah gambar'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => { onChange(undefined); setBroken(false); }}
              className="text-[11px] text-ld-fog hover:text-red-500 cursor-pointer bg-transparent border-none p-0 text-left"
            >
              Hapus gambar
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={[...ALLOWED_TYPES].join(',')}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5" role="alert">{error}</p>}
    </div>
  );
};

export default ImageUploadField;
