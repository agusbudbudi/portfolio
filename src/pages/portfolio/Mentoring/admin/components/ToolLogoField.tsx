import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import ImageUploadField from './ImageUploadField';
import { THESVG_CDN_BASE, thesvgIconUrl } from '../../../../../lib/thesvgRegistry';

// Logo source for a tool: either a slug looked up against the thesvg.org
// CDN (https://github.com/glincker/thesvg — 6400+ static brand SVGs, no
// backend/build dep) or a manually uploaded image via ImageUploadField.
// CDN url shape is stable and public, so "is this slug valid" is just
// "does the <img> load" — no HEAD/fetch/CORS dance needed. Found → applied
// straight away, no separate "use it" click; missing → left empty.
function isThesvgUrl(url: string | undefined): boolean {
  return !!url && url.startsWith(`${THESVG_CDN_BASE}/`);
}

interface ToolLogoFieldProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  defaultSlug: string;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const ToolLogoField: React.FC<ToolLogoFieldProps> = ({ value, onChange, defaultSlug }) => {
  const [mode, setMode] = useState<'icon' | 'upload'>(isThesvgUrl(value) || !value ? 'icon' : 'upload');
  const [manualSlug, setManualSlug] = useState(defaultSlug);
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<'idle' | 'found' | 'missing'>('idle');

  // Follows the tool name/id slug (via Name → ID auto-fill in ToolForm) as a
  // derived value until the user edits this field directly — same
  // "auto-fill but overridable" pattern as the Name → ID slug itself.
  const slug = (slugTouched ? manualSlug : defaultSlug).trim().toLowerCase();
  const previewUrl = slug ? thesvgIconUrl(slug) : undefined;

  return (
    <div className="block">
      <span className="block text-xs font-medium text-ld-graphite mb-1.5">Logo (opsional)</span>

      <div className="flex gap-1.5 mb-2.5">
        <button
          type="button"
          onClick={() => setMode('icon')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer ${mode === 'icon' ? 'border-ld-violet bg-ld-lilac/40 text-ld-violet' : 'border-ld-frost bg-white text-ld-fog'}`}
        >
          Icon library
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer ${mode === 'upload' ? 'border-ld-violet bg-ld-lilac/40 text-ld-violet' : 'border-ld-frost bg-white text-ld-fog'}`}
        >
          Upload manual
        </button>
      </div>

      {mode === 'icon' ? (
        <div className="flex items-center gap-3">
          {status === 'found' && previewUrl ? (
            <img src={previewUrl} alt="" className="w-14 h-14 object-contain rounded-lg border border-ld-frost shrink-0 p-1.5 bg-white" />
          ) : (
            <span className="w-14 h-14 rounded-lg bg-ld-cloud border border-ld-frost shrink-0 flex items-center justify-center text-ld-fog">
              <ImageOff size={16} />
            </span>
          )}
          {/* Hidden probe img — onLoad/onError just applies or clears the icon, nothing rendered from it directly */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt=""
              className="hidden"
              onLoad={() => { setStatus('found'); onChange(previewUrl); }}
              onError={() => { setStatus('missing'); onChange(undefined); }}
            />
          )}
          <div className="flex flex-col gap-1.5 flex-1">
            <input
              type="text"
              value={slugTouched ? manualSlug : defaultSlug}
              onChange={(e) => { setSlugTouched(true); setManualSlug(e.target.value); setStatus('idle'); }}
              placeholder="cypress"
              className={inputClass}
            />
            <p className="text-[11px] m-0 text-ld-fog">
              {status === 'missing' && `Ikon "${slug}" tidak ditemukan di thesvg.org — logo dikosongkan. Coba slug lain atau upload manual.`}
              {status === 'found' && 'Ikon ditemukan, otomatis dipakai.'}
              {status === 'idle' && !slug && 'Slug brand di thesvg.org, contoh: cypress, jira, postman.'}
            </p>
          </div>
        </div>
      ) : (
        <ImageUploadField label="File gambar" value={value} onChange={onChange} />
      )}
    </div>
  );
};

export default ToolLogoField;
