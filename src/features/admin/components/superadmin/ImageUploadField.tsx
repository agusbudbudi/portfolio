import React, { useRef, useState } from 'react';
import { ImageOff, Loader2, Trash2, Upload } from 'lucide-react';
import { apiUploadImage, ApiError, type UploadFeature } from '../../../../lib/adminApi';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { optimizeImage } from '../../../../lib/imageOptimize';
import { fileNameFromUrl } from '../../../../lib/fileNameFromUrl';

import { useSnackbarStore } from '../../../../store/useSnackbarStore';

// Reusable file-upload-to-URL field for the four portfolio image spots
// (profile photo, tool logo, project thumbnail, endorsement photo). Uploads
// through /api/upload (Vercel Blob) and writes the returned URL back via
// onChange — the rest of the form only ever deals with a URL string, same as
// mentor.avatar / topic.image today.
// Raw-file cap is generous (source photos can be large) — the real size
// limit is enforced after optimizeImage resizes/re-encodes to WebP, since
// that's the number that actually hits Blob storage.
const MAX_RAW_BYTES = 15 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

interface ImageUploadFieldProps {
  label: string;
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  /** Blob storage folder to group this upload under — see FOLDER_BY_FEATURE in api/upload.ts. */
  feature: UploadFeature;
  /** Target width (px) to downscale to before upload — match the largest on-page display size (~2-3x for retina). */
  maxWidth: number;
  /** Recommended aspect ratio/size shown above the upload buttons, e.g. "Rasio 1:1, mis. 480×480px". */
  ratioHint: string;
  shape?: 'square' | 'circle' | 'rounded-md';
  fallbackSrc?: string;
  /** 'contain' for logos/marks that shouldn't be cropped (default 'cover'). */
  objectFit?: 'cover' | 'contain';
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({ label, value, onChange, feature, maxWidth, ratioHint, shape = 'square', fallbackSrc, objectFit = 'cover' }) => {
  const token = useAdminAuthStore((s) => s.token);
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || !token) return;
    setError(null);
    if (!ALLOWED_TYPES.has(file.type)) {
      const msg = 'Format harus PNG, JPEG, WEBP, atau GIF.';
      setError(msg);
      showSnackbar(msg, 'error');
      return;
    }
    if (file.size > MAX_RAW_BYTES) {
      const msg = `Ukuran file asli maksimal ${MAX_RAW_BYTES / (1024 * 1024)}MB.`;
      setError(msg);
      showSnackbar(msg, 'error');
      return;
    }
    setUploading(true);
    try {
      const optimized = await optimizeImage(file, maxWidth);
      const approxBytes = Math.ceil((optimized.dataBase64.length * 3) / 4);
      if (approxBytes > MAX_UPLOAD_BYTES) {
        const msg = `Gambar masih terlalu besar setelah dioptimasi (maks ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB). Coba gambar lain.`;
        setError(msg);
        showSnackbar(msg, 'error');
        return;
      }
      const { url } = await apiUploadImage(
        { filename: optimized.filename, contentType: optimized.contentType, dataBase64: optimized.dataBase64, feature },
        token
      );
      setBroken(false);
      onChange(url);
      showSnackbar('Gambar berhasil diunggah!', 'success');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gagal upload gambar.';
      setError(msg);
      showSnackbar(msg, 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const previewClass = shape === 'circle' ? 'rounded-full' : shape === 'rounded-md' ? 'rounded-md' : 'rounded-lg';
  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <div className="block">
      <span className="block text-xs font-medium text-ld-graphite mb-1.5">{label}</span>
      <div className="flex items-start gap-3">
        {value && !broken ? (
          <img
            src={value}
            alt=""
            onError={() => setBroken(true)}
            className={`w-20 h-20 ${fitClass} border border-ld-frost shrink-0 ${previewClass}`}
          />
        ) : fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt=""
            className={`w-20 h-20 ${fitClass} border border-ld-frost shrink-0 ${previewClass}`}
          />
        ) : (
          <span className={`w-20 h-20 bg-ld-cloud border border-ld-frost shrink-0 flex items-center justify-center text-ld-fog ${previewClass}`}>
            <ImageOff size={18} />
          </span>
        )}
        <div className="flex flex-col gap-2 min-w-0">
          <span className="text-[11px] text-ld-fog">{ratioHint}</span>
          <div className="flex items-center gap-2">
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
                onClick={() => { onChange(undefined); setBroken(false); showSnackbar('Gambar berhasil dihapus.', 'info'); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-fog hover:text-red-500 hover:border-red-200 cursor-pointer"
              >
                <Trash2 size={13} /> Hapus gambar
              </button>
            )}
          </div>
          {value && !broken && (
            <span className="text-[11px] text-ld-fog truncate" title={fileNameFromUrl(value)}>
              {fileNameFromUrl(value)}
            </span>
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
