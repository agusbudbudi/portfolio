import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ProjectEntry, ToolConfig } from '../../../../../types/portfolio';
import ImageUploadField from './ImageUploadField';
import ProjectToolsField from './ProjectToolsField';
import FormField from './FormField';
import { ADD_ITEM_BUTTON } from './adminCard';

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
              <ImageUploadField label="Thumbnail" value={entry.thumbnail} onChange={(thumbnail) => update(entry.id, { thumbnail })} />
              <FormField label="Nama Project" required compact error={submitted && !entry.name.trim() ? 'Nama project wajib diisi.' : null}>
                <input type="text" value={entry.name} onChange={(e) => update(entry.id, { name: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Deskripsi" required compact className="md:col-span-2" error={submitted && !entry.description.trim() ? 'Deskripsi wajib diisi.' : null}>
                <textarea value={entry.description} onChange={(e) => update(entry.id, { description: e.target.value })} rows={3} className={inputClass} />
              </FormField>
              <FormField
                label="Link Project (opsional)"
                compact
                className="md:col-span-2"
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
              <div className="md:col-span-2">
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
