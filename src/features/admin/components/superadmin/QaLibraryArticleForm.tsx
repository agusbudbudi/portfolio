import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { QaLibraryArticle, QaLibraryArticleData, QaLibraryArticleStatus, QaLibraryCategory } from '../../../../types/qaLibrary';
import { slugify, isValidSlug } from '../../../../lib/portfolioValidation';
import { computeReadingTimeMinutes } from '../../../../lib/qaLibraryValidation';
import { useAdminUsersStore } from '../../../../store/useAdminUsersStore';
import ImageUploadField from './ImageUploadField';
import QaLibraryDocumentUploadField from './QaLibraryDocumentUploadField';
import QaLibraryAuthorSelect from './QaLibraryAuthorSelect';
import QaLibraryCategorySelect from './QaLibraryCategorySelect';
import QaLibraryMarkdownEditor from '../shared/QaLibraryMarkdownEditor';
import FormField from '../shared/FormField';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';

interface QaLibraryArticleFormProps {
  onClose: () => void;
  onSubmit: (payload: QaLibraryArticleData & { slug: string }) => Promise<{ ok: boolean; reason?: string }>;
  article: QaLibraryArticle | null; // null = create
  categories: QaLibraryCategory[];
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const STATUS_TONE: Record<QaLibraryArticleStatus, StatusBadgeTone> = {
  draft: 'slate',
  published: 'emerald',
};

const emptyData: QaLibraryArticleData = {
  title: '',
  categoryId: '',
  excerpt: '',
  body: '',
  thumbnailUrl: undefined,
  docUrl: undefined,
  docFilename: undefined,
  docSizeBytes: undefined,
  tags: [],
  authorName: '',
  authorUserId: undefined,
  authorAvatarUrl: undefined,
  status: 'draft',
  seoMetaTitle: undefined,
  seoMetaDescription: undefined,
  seoOgImage: undefined,
};

const QaLibraryArticleForm: React.FC<QaLibraryArticleFormProps> = ({ onClose, onSubmit, article, categories }) => {
  const isEdit = article !== null;
  const [data, setData] = useState<QaLibraryArticleData>(article ?? { ...emptyData, categoryId: categories[0]?.id ?? '' });
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [tagsInput, setTagsInput] = useState((article?.tags ?? []).join(', '));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { users, load: loadUsers } = useAdminUsersStore();

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleAuthorChange = (user: { id: string; name: string; avatarUrl: string | null }) => {
    setData((d) => ({ ...d, authorUserId: user.id, authorName: user.name, authorAvatarUrl: user.avatarUrl ?? undefined }));
  };

  const handleTitleChange = (title: string) => {
    setData((d) => ({ ...d, title }));
    if (!slugTouched) setSlug(slugify(title));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSlug(slug)) {
      setError('Slug harus lowercase (a-z, 0-9, tanda hubung).');
      return;
    }
    if (!data.title.trim()) { setError('Title wajib diisi.'); return; }
    if (!data.categoryId) { setError('Category wajib dipilih.'); return; }
    if (!data.excerpt.trim()) { setError('Excerpt wajib diisi.'); return; }
    if (!data.authorName.trim()) { setError('Author wajib dipilih.'); return; }
    if (!data.body.trim()) { setError('Konten artikel wajib diisi.'); return; }
    if (data.status === 'published' && !data.thumbnailUrl) {
      setError('Thumbnail wajib diisi sebelum artikel dipublish.');
      return;
    }

    setError(null);
    setSaving(true);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const result = await onSubmit({ ...data, tags, slug });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason ?? 'Gagal menyimpan artikel.');
      return;
    }
    onClose();
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
            aria-label="Kembali ke daftar artikel"
          >
            <ArrowLeft size={17} />
          </button>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">{isEdit ? 'Edit Artikel' : 'Tambah Artikel'}</h2>
        </div>
        <StatusBadge tone={STATUS_TONE[data.status]}>{data.status}</StatusBadge>
      </div>

      <form onSubmit={handleSubmit} className={ADMIN_CARD_BODY}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left panel — content */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <FormField label="Title" required className="md:col-span-2">
              <input
                type="text"
                value={data.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Cara Menulis Test Case yang Efektif"
                className={inputClass}
              />
            </FormField>

            <FormField label="Slug" required hint={<span className="block text-[11px] text-ld-fog mt-1">URL: /qa-library/{slug || '…'}</span>}>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }}
                placeholder="cara-menulis-test-case-efektif"
                className={inputClass}
              />
            </FormField>

            <FormField label="Category" required>
              <QaLibraryCategorySelect
                categories={categories}
                value={data.categoryId}
                onChange={(categoryId) => setData({ ...data, categoryId })}
              />
            </FormField>

            <FormField label="Excerpt" required className="md:col-span-2" hint={<span className="block text-[11px] text-ld-fog mt-1">Ringkasan singkat.</span>}>
              <textarea
                value={data.excerpt}
                onChange={(e) => setData({ ...data, excerpt: e.target.value })}
                rows={2}
                placeholder="Panduan singkat menulis test case yang jelas, ringkas, dan mudah dieksekusi tim QA."
                className={`${inputClass} resize-y`}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField
                label="Konten Artikel"
                required
                hint={<span className="block text-[11px] text-ld-fog mt-1">~{computeReadingTimeMinutes(data.body)} menit baca</span>}
              >
                <QaLibraryMarkdownEditor value={data.body} onChange={(body) => setData({ ...data, body })} />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <QaLibraryDocumentUploadField
                label="Dokumen (PDF/PPT, opsional)"
                value={data.docUrl}
                filename={data.docFilename}
                sizeBytes={data.docSizeBytes}
                onChange={({ url, filename, sizeBytes }) => setData({ ...data, docUrl: url, docFilename: filename, docSizeBytes: sizeBytes })}
              />
            </div>
          </div>

          {/* Right panel — thumbnail, status, SEO */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <ImageUploadField
              label="Thumbnail"
              value={data.thumbnailUrl}
              onChange={(thumbnailUrl) => setData({ ...data, thumbnailUrl })}
              feature="qaLibrary"
              maxWidth={1600}
              ratioHint="Rasio 16:9, mis. 1600x900px"
            />

            <FormField label="Author" required hint={<span className="block text-[11px] text-ld-fog mt-1">Lookup ke user terdaftar.</span>}>
              <QaLibraryAuthorSelect users={users} value={data.authorUserId} onChange={handleAuthorChange} />
            </FormField>

            <FormField label="Tags" hint={<span className="block text-[11px] text-ld-fog mt-1">Pisahkan dengan koma.</span>}>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="test case, manual testing, dokumentasi"
                className={inputClass}
              />
            </FormField>

            <FormField label="Status">
              <div className="flex items-center gap-2">
                {(['draft', 'published'] as QaLibraryArticleStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setData({ ...data, status: s })}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium cursor-pointer border transition-colors capitalize ${data.status === s ? 'bg-ld-violet text-white border-ld-violet' : 'bg-white text-ld-graphite border-ld-frost hover:border-ld-violet'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FormField>

            <div className="pt-2 mt-1 border-t border-ld-frost/60">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-fog mb-3">SEO</h3>
            </div>

            <FormField label="Meta Title" hint={<span className="block text-[11px] text-ld-fog mt-1">Kosongkan untuk pakai Title.</span>}>
              <input
                type="text"
                value={data.seoMetaTitle ?? ''}
                onChange={(e) => setData({ ...data, seoMetaTitle: e.target.value || undefined })}
                className={inputClass}
              />
            </FormField>

            <FormField label="Meta Description" hint={<span className="block text-[11px] text-ld-fog mt-1">Kosongkan untuk pakai Excerpt.</span>}>
              <textarea
                value={data.seoMetaDescription ?? ''}
                onChange={(e) => setData({ ...data, seoMetaDescription: e.target.value || undefined })}
                rows={2}
                className={`${inputClass} resize-y`}
              />
            </FormField>

            <FormField label="OG Image URL" hint={<span className="block text-[11px] text-ld-fog mt-1">Kosongkan untuk pakai Thumbnail.</span>}>
              <input
                type="text"
                value={data.seoOgImage ?? ''}
                onChange={(e) => setData({ ...data, seoOgImage: e.target.value || undefined })}
                className={inputClass}
              />
            </FormField>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 m-0 mt-6">{error}</p>}

        <div className="flex justify-end gap-2 mt-8 pt-5 border-t border-ld-frost/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Artikel' : 'Tambah Artikel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QaLibraryArticleForm;
