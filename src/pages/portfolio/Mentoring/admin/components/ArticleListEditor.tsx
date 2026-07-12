import React, { useState } from 'react';
import { ExternalLink, ImageOff, Loader2, Newspaper, Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { ArticleEntry } from '../../../../../types/portfolio';
import { apiFetchArticleMetadata, ApiError } from '../../../../../lib/adminApi';
import { useAdminAuthStore } from '../../../../../store/useAdminAuthStore';
import { ADD_ITEM_BUTTON } from './adminCard';
import FormField from './FormField';

interface ArticleListEditorProps {
  articles: ArticleEntry[];
  onChange: (articles: ArticleEntry[]) => void;
  submitted: boolean;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const URL_RE = /^https?:\/\/\S+$/;

const emptyEntry = (): ArticleEntry => ({
  id: crypto.randomUUID(),
  url: '',
  title: '',
  description: '',
  thumbnail: '',
  source: '',
});

// URL on the left drives everything: on blur we fetch the page's og:*/meta
// tags server-side (via /api/article-metadata, avoids browser CORS) and use
// them to fill title/description/thumbnail/source. Title is only overwritten
// when the admin hasn't typed one manually — a failed/incomplete fetch just
// leaves title editable by hand.
const ArticleListEditor: React.FC<ArticleListEditorProps> = ({ articles, onChange, submitted }) => {
  const token = useAdminAuthStore((s) => s.token);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastFetchedUrl, setLastFetchedUrl] = useState<Record<string, string>>({});

  const update = (id: string, patch: Partial<ArticleEntry>) => {
    onChange(articles.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const remove = (id: string) => onChange(articles.filter((a) => a.id !== id));
  const add = () => onChange([...articles, emptyEntry()]);

  const fetchMetadata = async (entry: ArticleEntry, force: boolean) => {
    const url = entry.url.trim();
    if (!url || !URL_RE.test(url) || !token) return;
    if (!force && lastFetchedUrl[entry.id] === url) return;

    setErrors((prev) => ({ ...prev, [entry.id]: '' }));
    setLoadingIds((prev) => new Set(prev).add(entry.id));
    try {
      const meta = await apiFetchArticleMetadata(url, token);
      update(entry.id, {
        title: entry.title.trim() ? entry.title : (meta.title ?? entry.title),
        description: meta.description ?? entry.description,
        thumbnail: meta.thumbnail ?? entry.thumbnail,
        source: meta.source ?? entry.source,
      });
      setLastFetchedUrl((prev) => ({ ...prev, [entry.id]: url }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [entry.id]: err instanceof ApiError ? err.message : 'Gagal mengambil metadata dari URL.' }));
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(entry.id);
        return next;
      });
    }
  };

  return (
    <div>
      <div className="space-y-3">
        {articles.map((entry, i) => {
          const urlTrimmed = entry.url.trim();
          const urlInvalid = urlTrimmed.length > 0 && !URL_RE.test(urlTrimmed);
          const urlMissing = submitted && !urlTrimmed;
          const titleMissing = submitted && !entry.title.trim();
          const loading = loadingIds.has(entry.id);
          const fetchError = errors[entry.id];
          const hasPreview = Boolean(entry.title || entry.description || entry.thumbnail);

          return (
            <div key={entry.id} className="rounded-lg border border-ld-frost p-4 relative">
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Hapus article ${i + 1}`}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
              >
                <Trash2 size={14} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                {/* Left: inputs */}
                <div className="flex flex-col gap-3">
                  <FormField
                    label="URL"
                    required
                    compact
                    error={urlMissing ? 'URL wajib diisi.' : !urlMissing && urlInvalid ? 'URL harus valid, diawali http:// atau https://.' : !urlMissing && !urlInvalid && fetchError ? fetchError : null}
                  >
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={entry.url}
                        onChange={(e) => update(entry.id, { url: e.target.value })}
                        onBlur={() => fetchMetadata(entry, false)}
                        placeholder="https://…"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => fetchMetadata(entry, true)}
                        disabled={loading || !urlTrimmed || urlInvalid}
                        aria-label="Ambil ulang metadata"
                        title="Ambil ulang metadata"
                        className="shrink-0 px-2.5 rounded-lg border border-ld-frost bg-white text-ld-graphite hover:border-ld-violet cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      </button>
                    </div>
                  </FormField>
                  <FormField
                    label={<>Judul {loading && <span className="text-ld-fog font-normal">(mengambil dari artikel…)</span>}</>}
                    required
                    compact
                    error={titleMissing ? 'Judul wajib diisi.' : null}
                  >
                    <input
                      type="text"
                      value={entry.title}
                      onChange={(e) => update(entry.id, { title: e.target.value })}
                      placeholder="Diisi otomatis dari artikel, atau isi manual"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                {/* Right: preview card */}
                <div>
                  <span className="block text-[11px] font-medium text-ld-graphite mb-1">Preview</span>
                  {hasPreview ? (
                    <div className="rounded-lg border border-ld-frost overflow-hidden bg-ld-cloud/30">
                      <div className="w-full aspect-video bg-ld-cloud flex items-center justify-center overflow-hidden">
                        {entry.thumbnail ? (
                          <img src={entry.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageOff size={20} className="text-ld-fog" />
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-semibold text-ld-onyx m-0 line-clamp-2">{entry.title || 'Tanpa judul'}</h4>
                        {entry.description && (
                          <p className="text-xs text-ld-slate mt-1 mb-0 line-clamp-2">{entry.description}</p>
                        )}
                        {entry.source && (
                          <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-ld-fog">
                            <ExternalLink size={10} /> {entry.source}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-ld-frost p-4 flex flex-col items-center justify-center gap-1.5 text-ld-fog aspect-video">
                      <Newspaper size={20} />
                      <span className="text-[11px] text-center">Preview muncul setelah URL diisi</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={add}
        className={ADD_ITEM_BUTTON}
      >
        <Plus size={13} /> Tambah Article
      </button>
    </div>
  );
};

export default ArticleListEditor;
