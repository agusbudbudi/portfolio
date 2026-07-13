import React from 'react';
import { ExternalLink, ImageIcon, Plus, Trash2 } from 'lucide-react';
import type { ProjectEntry, ToolConfig } from '../../../../types/portfolio';
import ImageUploadField from '../superadmin/ImageUploadField';
import ProjectToolsField from './ProjectToolsField';
import FormField from '../shared/FormField';
import { ADD_ITEM_BUTTON } from '../shared/adminCard';

interface ProjectListEditorProps {
  projects: ProjectEntry[];
  tools: ToolConfig[];
  onChange: (projects: ProjectEntry[]) => void;
  submitted: boolean;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const URL_RE = /^https?:\/\/\S+$/;

const emptyEntry = (): ProjectEntry => ({
  id: crypto.randomUUID(),
  thumbnail: '',
  name: '',
  description: '',
  toolIds: [],
  projectUrl: '',
});

const ProjectListEditor: React.FC<ProjectListEditorProps> = ({ projects, tools, onChange, submitted }) => {
  const update = (id: string, patch: Partial<ProjectEntry>) => {
    onChange(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const remove = (id: string) => onChange(projects.filter((p) => p.id !== id));
  const add = () => onChange([...projects, emptyEntry()]);

  return (
    <div>
      <div className="space-y-3">
        {projects.map((entry, i) => {
          const urlTrimmed = (entry.projectUrl ?? '').trim();
          const urlInvalid = urlTrimmed.length > 0 && !URL_RE.test(urlTrimmed);
          const projectTools = entry.toolIds.map((id) => tools.find((t) => t.id === id)).filter((t): t is ToolConfig => Boolean(t?.logo));
          const visibleProjectTools = projectTools.slice(0, 5);
          const extraProjectToolsCount = projectTools.length - visibleProjectTools.length;

          return (
            <div key={entry.id} className="rounded-lg border border-ld-frost p-4 relative">
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Hapus project ${i + 1}`}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                {/* Left: inputs */}
                <div className="flex flex-col gap-3">
                  <FormField label="Nama Project" required compact error={submitted && !entry.name.trim() ? 'Nama project wajib diisi.' : null}>
                    <input type="text" value={entry.name} onChange={(e) => update(entry.id, { name: e.target.value })} className={inputClass} />
                  </FormField>
                  <FormField label="Deskripsi" required compact error={submitted && !entry.description.trim() ? 'Deskripsi wajib diisi.' : null}>
                    <textarea value={entry.description} onChange={(e) => update(entry.id, { description: e.target.value })} rows={3} className={inputClass} />
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
                    <div className="w-full aspect-video overflow-hidden bg-ld-cloud border-b border-ld-ash flex items-center justify-center">
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
