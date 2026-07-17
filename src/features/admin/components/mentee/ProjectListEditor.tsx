import React from 'react';
import { Apple, ArrowDown, ArrowUp, ExternalLink, Globe, ImageIcon, Monitor, Plus, Smartphone, Trash2, X } from 'lucide-react';
import { PROJECT_PLATFORM_OPTIONS, PROJECT_TYPE_BADGE_COLOR, PROJECT_TYPE_OPTIONS, type ProjectEntry, type ProjectPlatform, type ProjectPlatformLink, type ProjectType, type ToolConfig } from '../../../../types/portfolio';
import ImageUploadField from '../superadmin/ImageUploadField';
import ProjectToolsField from './ProjectToolsField';
import FormField from '../shared/FormField';
import { ADD_ITEM_BUTTON } from '../shared/adminCard';

const PLATFORM_ICON: Record<ProjectPlatform, React.ComponentType<{ size?: number }>> = {
  web: Globe,
  ios: Apple,
  android: Smartphone,
  desktop: Monitor,
  other: ExternalLink,
};

interface ProjectListEditorProps {
  projects: ProjectEntry[];
  tools: ToolConfig[];
  onChange: (projects: ProjectEntry[]) => void;
  submitted: boolean;
}

const inputBaseClass =
  'px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';
const inputClass = `w-full ${inputBaseClass}`;

const URL_RE = /^https?:\/\/\S+$/;

const emptyEntry = (): ProjectEntry => ({
  id: crypto.randomUUID(),
  thumbnail: '',
  name: '',
  description: '',
  toolIds: [],
  projectUrl: '',
  platforms: [],
});

const emptyPlatformLink = (): ProjectPlatformLink => ({ platform: 'web', url: '' });

const ProjectListEditor: React.FC<ProjectListEditorProps> = ({ projects, tools, onChange, submitted }) => {
  const update = (id: string, patch: Partial<ProjectEntry>) => {
    onChange(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const remove = (id: string) => onChange(projects.filter((p) => p.id !== id));
  const add = () => onChange([...projects, emptyEntry()]);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= projects.length || from === to) return;
    const next = [...projects];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="space-y-3">
        {projects.map((entry, i) => {
          const urlTrimmed = (entry.projectUrl ?? '').trim();
          const urlInvalid = urlTrimmed.length > 0 && !URL_RE.test(urlTrimmed);
          const projectTools = entry.toolIds.map((id) => tools.find((t) => t.id === id)).filter((t): t is ToolConfig => Boolean(t?.logo));
          const visibleProjectTools = projectTools.slice(0, 5);
          const extraProjectToolsCount = projectTools.length - visibleProjectTools.length;
          const platforms = entry.platforms ?? [];

          const updatePlatform = (index: number, patch: Partial<ProjectPlatformLink>) => {
            update(entry.id, { platforms: platforms.map((p, j) => (j === index ? { ...p, ...patch } : p)) });
          };
          const removePlatform = (index: number) => {
            update(entry.id, { platforms: platforms.filter((_, j) => j !== index) });
          };
          const addPlatform = () => {
            update(entry.id, { platforms: [...platforms, emptyPlatformLink()] });
          };

          return (
            <div key={entry.id} className="rounded-lg border border-ld-frost p-4 relative">
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Pindahkan project ${i + 1} ke atas`}
                  className="p-1.5 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === projects.length - 1}
                  aria-label={`Pindahkan project ${i + 1} ke bawah`}
                  className="p-1.5 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(entry.id)}
                  aria-label={`Hapus project ${i + 1}`}
                  className="p-1.5 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-24">
                {/* Left: inputs */}
                <div className="flex flex-col gap-3 min-w-0">
                  <FormField label="Nama Project" required compact error={submitted && !entry.name.trim() ? 'Nama project wajib diisi.' : null}>
                    <input type="text" value={entry.name} onChange={(e) => update(entry.id, { name: e.target.value })} className={inputClass} />
                  </FormField>
                  <FormField label="Deskripsi" required compact error={submitted && !entry.description.trim() ? 'Deskripsi wajib diisi.' : null}>
                    <textarea value={entry.description} onChange={(e) => update(entry.id, { description: e.target.value })} rows={3} className={inputClass} />
                  </FormField>
                  <FormField label="Tipe Project (opsional)" compact>
                    <select
                      value={entry.projectType ?? ''}
                      onChange={(e) => update(entry.id, { projectType: e.target.value ? (e.target.value as ProjectType) : undefined })}
                      className={inputClass}
                    >
                      <option value="">Tidak ditentukan</option>
                      {PROJECT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField
                    label="Link Project (opsional)"
                    compact
                    error={urlInvalid ? 'URL harus valid, diawali http:// atau https://.' : null}
                  >
                    <input
                      type="url"
                      value={entry.projectUrl ?? ''}
                      onChange={(e) => update(entry.id, { projectUrl: e.target.value })}
                      placeholder="https://…"
                      className={inputClass}
                    />
                  </FormField>
                  <div>
                    <span className="block text-[11px] font-medium text-ld-graphite mb-1.5">Platform (opsional)</span>
                    <div className="flex flex-col gap-2">
                      {platforms.map((link, j) => {
                        const linkUrlTrimmed = (link.url ?? '').trim();
                        const linkUrlInvalid = linkUrlTrimmed.length > 0 && !URL_RE.test(linkUrlTrimmed);
                        return (
                          <div key={j} className="flex flex-col gap-1">
                            <div className="flex gap-2 min-w-0">
                              <select
                                value={link.platform}
                                onChange={(e) => updatePlatform(j, { platform: e.target.value as ProjectPlatformLink['platform'] })}
                                className={`${inputBaseClass} w-28 shrink-0`}
                              >
                                {PROJECT_PLATFORM_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              <input
                                type="url"
                                value={link.url ?? ''}
                                onChange={(e) => updatePlatform(j, { url: e.target.value })}
                                placeholder="https://… (opsional)"
                                className={`${inputBaseClass} flex-1 min-w-0`}
                              />
                              <button
                                type="button"
                                onClick={() => removePlatform(j)}
                                aria-label={`Hapus platform ${j + 1}`}
                                className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            {linkUrlInvalid && <p className="text-[11px] text-red-500 m-0">URL harus valid, diawali http:// atau https://.</p>}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={addPlatform}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ld-violet cursor-pointer border-none bg-transparent"
                    >
                      <Plus size={13} /> Tambah Platform
                    </button>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-ld-graphite mb-1.5">Tools digunakan</span>
                    {tools.length === 0 ? (
                      <p className="text-xs text-ld-fog m-0">Belum ada tool. Tambahkan dulu di tab Tools.</p>
                    ) : (
                      <ProjectToolsField
                        allTools={tools}
                        selectedIds={entry.toolIds}
                        onChange={(toolIds) => update(entry.id, { toolIds })}
                      />
                    )}
                  </div>
                </div>

                {/* Right: thumbnail upload + live preview matching the public project card */}
                <div className="flex flex-col gap-2">
                  <ImageUploadField
                    label="Thumbnail"
                    value={entry.thumbnail}
                    onChange={(thumbnail) => update(entry.id, { thumbnail })}
                    feature="portfolio"
                    maxWidth={800}
                    ratioHint="Rasio 16:9, mis. 800×450px"
                  />
                  <span className="block text-[11px] font-medium text-ld-graphite mt-1">Preview</span>
                  <div className="bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden flex flex-col">
                    <div className="relative w-full aspect-video overflow-hidden bg-ld-cloud border-b border-ld-ash flex items-center justify-center">
                      {entry.projectType && (
                        <span
                          className={`absolute bottom-0 right-0 px-3 py-1 rounded-tl-lg text-[11px] font-semibold shadow-sm ${PROJECT_TYPE_BADGE_COLOR[entry.projectType]}`}
                        >
                          {PROJECT_TYPE_OPTIONS.find((o) => o.value === entry.projectType)?.label}
                        </span>
                      )}
                      {entry.thumbnail ? (
                        <img src={entry.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5 text-ld-mist p-4 text-center">
                          <ImageIcon size={24} />
                          <span className="text-[11px] leading-snug">Belum ada thumbnail — upload rasio 16:9 (mis. 800×450px) biar pas di card</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 pb-2 flex-grow">
                      <h4 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-2">{entry.name || 'Nama project'}</h4>
                      <p className="text-ld-slate text-xs leading-relaxed mb-4 line-clamp-3">{entry.description || 'Deskripsi project akan tampil di sini.'}</p>
                      {platforms.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-4">
                          {platforms.map((p, i) => {
                            const Icon = PLATFORM_ICON[p.platform];
                            return (
                              <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ld-graphite">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ld-violet text-white shrink-0">
                                  <Icon size={11} />
                                </span>
                                {PROJECT_PLATFORM_OPTIONS.find((o) => o.value === p.platform)?.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-3 flex justify-between items-center border-t border-ld-ash bg-ld-cloud/50 gap-3">
                      <div className="flex gap-2.5 flex-wrap items-center">
                        {visibleProjectTools.map((tool) => (
                          <img key={tool.id} src={tool.logo} alt={tool.name} title={tool.name} className="h-5 object-contain" />
                        ))}
                        {extraProjectToolsCount > 0 && (
                          <span className="text-xs font-medium text-ld-violet">+{extraProjectToolsCount}</span>
                        )}
                      </div>
                      {urlTrimmed && !urlInvalid && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-ld-canvas text-ld-violet border border-ld-ash rounded-lg font-medium text-xs whitespace-nowrap">
                          Lihat Project <ExternalLink size={14} />
                        </span>
                      )}
                    </div>
                  </div>
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
        <Plus size={13} /> Tambah Project
      </button>
    </div>
  );
};

export default ProjectListEditor;
