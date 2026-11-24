import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, FlaskConical, Plus, Trash2 } from 'lucide-react';
import type {
  QaCourseData, QaCourseDetail, QaCourseItem, QaCourseLevel, QaCourseModule, QaCourseStatus,
} from '../../../../types/qaCourse';
import { QA_COURSE_LEVEL_LABEL } from '../../../../types/qaCourse';
import type { QaLibraryArticleSummary } from '../../../../types/qaLibrary';
import type { SimulatorProject } from '../../../../types/qaSimulator';
import { slugify, isValidSlug } from '../../../../lib/portfolioValidation';
import { validateQaCourseData } from '../../../../lib/qaCourseValidation';
import { useAdminQaLibraryStore } from '../../../../store/useAdminQaLibraryStore';
import { fetchSimulatorIndex, fetchSimulatorProject } from '../../../qa-simulator/lib/simulatorApi';
import ImageUploadField from './ImageUploadField';
import FormField from '../shared/FormField';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY, ADD_ITEM_BUTTON } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';
import Select from '../../../../components/common/Select';
import Combobox from '../../../../components/common/Combobox';

interface QaCourseFormProps {
  onClose: () => void;
  onSubmit: (payload: QaCourseData & { slug: string }) => Promise<{ ok: boolean; reason?: string }>;
  course: QaCourseDetail | null; // null = create
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';
const smallInputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';
const iconBtn =
  'p-1.5 rounded-md text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent disabled:opacity-30 disabled:cursor-not-allowed';

const STATUS_TONE: Record<QaCourseStatus, StatusBadgeTone> = { draft: 'slate', published: 'emerald' };

const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 12);

const emptyData: QaCourseData = {
  title: '',
  description: '',
  level: 'beginner',
  estimatedHours: 4,
  thumbnailUrl: undefined,
  status: 'draft',
  modules: [],
  seoMetaTitle: undefined,
  seoMetaDescription: undefined,
  seoOgImage: undefined,
};

function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// Simulator projects are static JSON; load them all once for the mission pickers.
function useSimulatorProjects() {
  const [projects, setProjects] = useState<SimulatorProject[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchSimulatorIndex()
      .then((index) => Promise.all(
        index.projects.filter((p) => p.status === 'available').map((p) => fetchSimulatorProject(p.id).catch(() => null))
      ))
      .then((list) => { if (!cancelled) setProjects(list.filter((p): p is SimulatorProject => Boolean(p))); })
      .catch(() => { /* pickers stay empty; the form shows no missions to pick */ });
    return () => { cancelled = true; };
  }, []);
  return projects;
}

const ItemRow: React.FC<{
  item: QaCourseItem;
  index: number;
  count: number;
  articles: QaLibraryArticleSummary[];
  projects: SimulatorProject[];
  onChange: (item: QaCourseItem) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}> = ({ item, index, count, articles, projects, onChange, onMove, onRemove }) => {
  const project = item.kind === 'mission' ? projects.find((p) => p.id === item.projectId) : undefined;
  const article = item.kind === 'article' ? articles.find((a) => a.id === item.articleId) : undefined;

  return (
    <li className="flex items-start gap-2 rounded-lg border border-ld-frost bg-white p-2.5">
      <span className={`mt-1.5 shrink-0 ${item.kind === 'article' ? 'text-ld-violet' : 'text-emerald-600'}`}>
        {item.kind === 'article' ? <BookOpen size={15} /> : <FlaskConical size={15} />}
      </span>
      <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {item.kind === 'article' ? (
          <>
            <Combobox
              options={articles.map((a) => ({
                value: a.id,
                label: a.title,
                description: [a.status === 'draft' ? 'Draft' : null, a.visibility === 'course-only' ? 'Course only' : null]
                  .filter(Boolean).join(' · ') || undefined,
              }))}
              value={item.articleId}
              onChange={(articleId) => onChange({ ...item, articleId })}
              placeholder="Pilih artikel…"
              searchPlaceholder="Cari artikel…"
              emptyLabel="Artikel tidak ditemukan."
              className={`${smallInputClass} sm:col-span-2`}
              aria-label={`Artikel item ${index + 1}`}
            />
            {item.articleId && !article && <p className="m-0 sm:col-span-2 text-xs text-red-600">Artikel ini sudah tidak ada.</p>}
            {article?.status === 'draft' && <p className="m-0 sm:col-span-2 text-xs text-amber-700">Artikel masih draft. Course tidak bisa dipublish sampai artikel ini dipublish.</p>}
          </>
        ) : (
          <>
            <Select
              value={item.projectId}
              onChange={(projectId) => onChange({ ...item, projectId, phaseId: '' })}
              options={projects.map((p) => ({ value: p.id, label: `${p.product}: ${p.title}` }))}
              placeholder="Pilih project…"
              className={smallInputClass}
              aria-label={`Project simulator item ${index + 1}`}
            />
            <Select
              value={item.phaseId}
              onChange={(phaseId) => onChange({ ...item, phaseId })}
              options={(project?.phases ?? []).map((ph, i) => ({ value: ph.id, label: `Phase ${i + 1}: ${ph.title}` }))}
              placeholder="Pilih phase…"
              disabled={!project}
              className={smallInputClass}
              aria-label={`Phase simulator item ${index + 1}`}
            />
          </>
        )}
      </div>
      <div className="flex items-center shrink-0">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={iconBtn} aria-label="Naikkan item"><ArrowUp size={14} /></button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className={iconBtn} aria-label="Turunkan item"><ArrowDown size={14} /></button>
        <button type="button" onClick={onRemove} className={`${iconBtn} hover:text-red-500`} aria-label="Hapus item"><Trash2 size={14} /></button>
      </div>
    </li>
  );
};

const QaCourseForm: React.FC<QaCourseFormProps> = ({ onClose, onSubmit, course }) => {
  const isEdit = course !== null;
  const [data, setData] = useState<QaCourseData>(() => {
    if (!course) return emptyData;
    // Keep only the editable fields (drop id, slug, timestamps, resolved articles).
    return {
      title: course.title,
      description: course.description,
      level: course.level,
      estimatedHours: course.estimatedHours,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      modules: course.modules,
      seoMetaTitle: course.seoMetaTitle,
      seoMetaDescription: course.seoMetaDescription,
      seoOgImage: course.seoOgImage,
    };
  });
  const [slug, setSlug] = useState(course?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { articles, load: loadArticles } = useAdminQaLibraryStore();
  const projects = useSimulatorProjects();

  useEffect(() => { loadArticles(); }, [loadArticles]);

  const sortedArticles = [...articles].sort((a, b) => a.title.localeCompare(b.title, 'id'));

  const setModules = (modules: QaCourseModule[]) => setData((d) => ({ ...d, modules }));
  const updateModule = (mi: number, patch: Partial<QaCourseModule>) =>
    setModules(data.modules.map((m, i) => (i === mi ? { ...m, ...patch } : m)));
  const addModule = () => setModules([...data.modules, { id: newId(), title: '', intro: '', items: [] }]);
  const addItem = (mi: number, kind: QaCourseItem['kind']) => {
    const item: QaCourseItem = kind === 'article'
      ? { id: newId(), kind: 'article', articleId: '' }
      : { id: newId(), kind: 'mission', projectId: '', phaseId: '' };
    updateModule(mi, { items: [...data.modules[mi].items, item] });
  };

  const handleTitleChange = (title: string) => {
    setData((d) => ({ ...d, title }));
    if (!slugTouched) setSlug(slugify(title));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSlug(slug) || slug === 'admin') { setError('Slug harus lowercase (a-z, 0-9, tanda hubung).'); return; }
    const payload: QaCourseData = {
      ...data,
      modules: data.modules.map((m) => ({ ...m, intro: m.intro?.trim() ? m.intro : undefined })),
    };
    const result = validateQaCourseData(payload);
    if (!result.ok) { setError(result.errors.join(' ')); return; }

    setError(null);
    setSaving(true);
    const saved = await onSubmit({ ...payload, slug });
    setSaving(false);
    if (!saved.ok) { setError(saved.reason ?? 'Gagal menyimpan course.'); return; }
    onClose();
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
            aria-label="Kembali ke daftar course"
          >
            <ArrowLeft size={17} />
          </button>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">{isEdit ? 'Edit Course' : 'Tambah Course'}</h2>
        </div>
        <StatusBadge tone={STATUS_TONE[data.status]}>{data.status}</StatusBadge>
      </div>

      <form onSubmit={handleSubmit} className={ADMIN_CARD_BODY}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — details + curriculum */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Judul" required className="md:col-span-2">
                <input type="text" value={data.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Junior QA Ready" className={inputClass} />
              </FormField>
              <FormField label="Slug" required hint={<span className="block text-[11px] text-ld-fog mt-1">URL: /courses/{slug || '…'}</span>}>
                <input type="text" value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} className={inputClass} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Level" required>
                  <Select
                    value={data.level}
                    onChange={(level) => setData({ ...data, level: level as QaCourseLevel })}
                    options={(Object.keys(QA_COURSE_LEVEL_LABEL) as QaCourseLevel[]).map((l) => ({ value: l, label: QA_COURSE_LEVEL_LABEL[l] }))}
                    className={inputClass}
                    aria-label="Level"
                  />
                </FormField>
                <FormField label="Estimasi jam" required>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={data.estimatedHours}
                    onChange={(e) => setData({ ...data, estimatedHours: Number(e.target.value) })}
                    className={inputClass}
                  />
                </FormField>
              </div>
              <FormField label="Deskripsi" required className="md:col-span-2" hint={<span className="block text-[11px] text-ld-fog mt-1">Tampil di kartu dan hero halaman course.</span>}>
                <textarea
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </FormField>
            </div>

            <div className="pt-4 mt-1 border-t border-ld-frost/60">
              <h3 className="m-0 text-sm font-semibold text-ld-onyx">Kurikulum</h3>
              <p className="m-0 mt-1 text-xs text-ld-fog">Tiap modul berisi artikel (belajar) lalu misi simulator (praktik).</p>
            </div>

            <ol className="m-0 p-0 list-none flex flex-col gap-4">
              {data.modules.map((mod, mi) => (
                <li key={mod.id} className="rounded-xl border border-ld-frost bg-ld-cloud/40 p-3 sm:p-4">
                  <div className="flex items-start gap-2">
                    <span className="mt-2.5 text-xs font-semibold text-ld-fog tabular-nums w-6 shrink-0">{mi + 1}.</span>
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <input
                        type="text"
                        value={mod.title}
                        onChange={(e) => updateModule(mi, { title: e.target.value })}
                        placeholder="Judul modul, mis. Requirement"
                        className={smallInputClass}
                        aria-label={`Judul modul ${mi + 1}`}
                      />
                      <textarea
                        value={mod.intro ?? ''}
                        onChange={(e) => updateModule(mi, { intro: e.target.value })}
                        rows={2}
                        placeholder="Intro singkat yang menyambungkan materi di modul ini (opsional)"
                        className={`${smallInputClass} resize-y`}
                        aria-label={`Intro modul ${mi + 1}`}
                      />
                    </div>
                    <div className="flex items-center shrink-0">
                      <button type="button" onClick={() => setModules(move(data.modules, mi, -1))} disabled={mi === 0} className={iconBtn} aria-label="Naikkan modul"><ArrowUp size={14} /></button>
                      <button type="button" onClick={() => setModules(move(data.modules, mi, 1))} disabled={mi === data.modules.length - 1} className={iconBtn} aria-label="Turunkan modul"><ArrowDown size={14} /></button>
                      <button
                        type="button"
                        onClick={() => { if (window.confirm(`Hapus modul "${mod.title || mi + 1}"?`)) setModules(data.modules.filter((_, i) => i !== mi)); }}
                        className={`${iconBtn} hover:text-red-500`}
                        aria-label="Hapus modul"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <ul className="m-0 mt-3 pl-0 sm:pl-8 list-none flex flex-col gap-2">
                    {mod.items.map((item, ii) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        index={ii}
                        count={mod.items.length}
                        articles={sortedArticles}
                        projects={projects}
                        onChange={(next) => updateModule(mi, { items: mod.items.map((it, i) => (i === ii ? next : it)) })}
                        onMove={(delta) => updateModule(mi, { items: move(mod.items, ii, delta) })}
                        onRemove={() => updateModule(mi, { items: mod.items.filter((_, i) => i !== ii) })}
                      />
                    ))}
                  </ul>
                  <div className="mt-2 pl-0 sm:pl-8 flex flex-wrap gap-2">
                    <button type="button" onClick={() => addItem(mi, 'article')} className={ADD_ITEM_BUTTON}><BookOpen size={14} /> Artikel</button>
                    <button type="button" onClick={() => addItem(mi, 'mission')} className={ADD_ITEM_BUTTON}><FlaskConical size={14} /> Misi simulator</button>
                  </div>
                </li>
              ))}
            </ol>
            <button type="button" onClick={addModule} className={ADD_ITEM_BUTTON}><Plus size={14} /> Tambah modul</button>
          </div>

          {/* Right — thumbnail, status, SEO */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <ImageUploadField
              label="Thumbnail"
              value={data.thumbnailUrl}
              onChange={(thumbnailUrl) => setData({ ...data, thumbnailUrl })}
              feature="qaLibrary"
              maxWidth={1600}
              ratioHint="Rasio 16:9, mis. 1600x900px"
            />

            <FormField label="Status">
              <div className="flex items-center gap-2">
                {(['draft', 'published'] as QaCourseStatus[]).map((s) => (
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
            <FormField label="Meta Title" hint={<span className="block text-[11px] text-ld-fog mt-1">Kosongkan untuk pakai Judul.</span>}>
              <input type="text" value={data.seoMetaTitle ?? ''} onChange={(e) => setData({ ...data, seoMetaTitle: e.target.value || undefined })} className={inputClass} />
            </FormField>
            <FormField label="Meta Description" hint={<span className="block text-[11px] text-ld-fog mt-1">Kosongkan untuk pakai Deskripsi.</span>}>
              <textarea
                value={data.seoMetaDescription ?? ''}
                onChange={(e) => setData({ ...data, seoMetaDescription: e.target.value || undefined })}
                rows={2}
                className={`${inputClass} resize-y`}
              />
            </FormField>
            <FormField label="OG Image URL" hint={<span className="block text-[11px] text-ld-fog mt-1">Kosongkan untuk pakai Thumbnail.</span>}>
              <input type="text" value={data.seoOgImage ?? ''} onChange={(e) => setData({ ...data, seoOgImage: e.target.value || undefined })} className={inputClass} />
            </FormField>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 m-0 mt-6">{error}</p>}

        <div className="flex justify-end gap-2 mt-8 pt-5 border-t border-ld-frost/60">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite cursor-pointer">
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Course' : 'Tambah Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QaCourseForm;
