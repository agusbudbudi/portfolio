import React, { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { useSnackbarStore } from '../../../../store/useSnackbarStore';

// Client-direct-to-Blob upload for the QA Library document field (PDF/PPT) —
// bypasses /api/upload's base64-JSON 2MB cap since slide decks can be tens
// of MB. Posts straight from the browser to Blob storage; only the small
// token request hits /api/blob-upload (see api/_endpoints/blob-upload.ts).
const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/ms-powerpoint',
  'application/vnd.ms-powerpoint',
]);

function formatBytes(bytes: number | undefined): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

interface QaLibraryDocumentUploadFieldProps {
  label: string;
  value: string | undefined;
  filename: string | undefined;
  sizeBytes: number | undefined;
  onChange: (next: { url: string | undefined; filename: string | undefined; sizeBytes: number | undefined }) => void;
}

const QaLibraryDocumentUploadField: React.FC<QaLibraryDocumentUploadFieldProps> = ({ label, value, filename, sizeBytes, onChange }) => {
  const token = useAdminAuthStore((s) => s.token);
  const user = useAdminAuthStore((s) => s.user);
  const showSnackbar = useSnackbarStore((s) => s.show);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || !token) return;
    setError(null);
    if (!ALLOWED_TYPES.has(file.type)) {
      const msg = 'Format harus PDF atau PPT/PPTX.';
      setError(msg);
      showSnackbar(msg, 'error');
      return;
    }
    if (file.size > MAX_BYTES) {
      const msg = `Ukuran file maksimal ${MAX_BYTES / (1024 * 1024)}MB.`;
      setError(msg);
      showSnackbar(msg, 'error');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      // Matches FOLDER_BY_FEATURE's key convention in api/_endpoints/upload.ts
      // (Mentor/Portfolio/etc all group under `<Folder>/<email>/<timestamp>-<filename>`).
      const pathname = `QaLibrary/${user?.email ?? 'unknown'}/${Date.now()}-${file.name}`;
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });
      onChange({ url: blob.url, filename: file.name, sizeBytes: file.size });
      showSnackbar('Dokumen berhasil diunggah!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal upload dokumen.';
      setError(msg);
      showSnackbar(msg, 'error');
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
              {uploading ? `Mengunggah… ${progress}%` : value ? 'Ganti dokumen' : 'Unggah dokumen'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange({ url: undefined, filename: undefined, sizeBytes: undefined })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-fog hover:text-red-500 hover:border-red-200 cursor-pointer"
              >
                <Trash2 size={13} /> Hapus dokumen
              </button>
            )}
          </div>
          {value && (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-[11px] text-ld-violet hover:underline truncate" title={filename}>
              {filename ?? value} {sizeBytes ? `(${formatBytes(sizeBytes)})` : ''}
            </a>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5" role="alert">{error}</p>}
    </div>
  );
};

export default QaLibraryDocumentUploadField;
