import React, { useRef, useState } from 'react';
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { apiUploadImage, ApiError } from '../../../../lib/adminApi';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { fileNameFromUrl } from '../../../../lib/fileNameFromUrl';

// CV upload field for the portfolio profile — same /api/upload flow as
// ImageUploadField, but restricted to PDF only.
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPE = 'application/pdf';

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

interface CvUploadFieldProps {
  label: string;
  value: string | undefined;
  onChange: (url: string | undefined) => void;
}

const CvUploadField: React.FC<CvUploadFieldProps> = ({ label, value, onChange }) => {
  const token = useAdminAuthStore((s) => s.token);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || !token) return;
    setError(null);
    if (file.type !== ALLOWED_TYPE) {
      setError('Format harus PDF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Ukuran maksimal ${MAX_BYTES / (1024 * 1024)}MB.`);
      return;
    }
    setUploading(true);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const { url } = await apiUploadImage({ filename: file.name, contentType: file.type, dataBase64, feature: 'cv' }, token);
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal upload CV.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="block">
      <span className="block text-xs font-medium text-ld-graphite mb-1.5">{label}</span>
      <div className="flex items-start gap-3">
        <span className={`w-20 h-20 rounded-lg border border-ld-frost shrink-0 flex items-center justify-center ${value ? 'bg-ld-lilac/30 text-ld-violet' : 'bg-ld-cloud text-ld-fog'}`}>
          <FileText size={22} />
        </span>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite hover:border-ld-violet cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Mengunggah…' : value ? 'Ganti CV' : 'Unggah CV'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-fog hover:text-red-500 hover:border-red-200 cursor-pointer"
              >
                <Trash2 size={13} /> Hapus CV
              </button>
            )}
          </div>
          {value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-ld-violet hover:underline truncate"
              title={fileNameFromUrl(value)}
            >
              {fileNameFromUrl(value)}
            </a>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5" role="alert">{error}</p>}
    </div>
  );
};

export default CvUploadField;
