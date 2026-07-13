import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2, X } from 'lucide-react';
import type { ToolConfig } from '../../../../types/portfolio';
import { loadThesvgRegistry, searchThesvgIcons, thesvgIconUrl, type ThesvgIcon } from '../../../../lib/thesvgRegistry';
import { useAdminToolsStore } from '../../../../store/useAdminToolsStore';

// Name-search dropdown for picking which tools a project used. Suggestions
// merge two sources: tools already defined in the Tools tab (picked as-is),
// and the thesvg.org CDN registry (https://github.com/glincker/thesvg) for
// brands that aren't in the Tools tab yet — picking one of those creates
// the tool for real via the tools store (same as ToolForm), so it satisfies
// the server-side check that every project.toolIds entry exists in the
// tools document (portfolioValidation.ts's validateProjects).
interface ProjectToolsFieldProps {
  allTools: ToolConfig[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

type Suggestion =
  | { source: 'local'; tool: ToolConfig }
  | { source: 'cdn'; icon: ThesvgIcon };

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const ProjectToolsField: React.FC<ProjectToolsFieldProps> = ({ allTools, selectedIds, onChange }) => {
  const upsertTool = useAdminToolsStore((s) => s.upsertTool);
  const [registry, setRegistry] = useState<ThesvgIcon[] | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creatingSlug, setCreatingSlug] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    loadThesvgRegistry().then(setRegistry);
  }, []);

  const selectedTools = allTools.filter((t) => selectedIds.includes(t.id));
  const availableTools = allTools.filter((t) => !selectedIds.includes(t.id));
  const existingIds = new Set(allTools.map((t) => t.id));
  const q = query.trim().toLowerCase();

  const localMatches: Suggestion[] = (q ? availableTools.filter((t) => t.name.toLowerCase().includes(q)) : availableTools)
    .slice(0, 6)
    .map((tool) => ({ source: 'local', tool }));

  const cdnMatches: Suggestion[] = registry && q.length >= 2
    ? searchThesvgIcons(registry, q, 8)
        .filter((icon) => !existingIds.has(icon.slug))
        .slice(0, 8 - localMatches.length)
        .map((icon) => ({ source: 'cdn', icon }))
    : [];

  const suggestions = [...localMatches, ...cdnMatches];

  const selectLocal = (tool: ToolConfig) => {
    onChange([...selectedIds, tool.id]);
    setQuery('');
    setOpen(false);
  };

  const selectCdn = async (icon: ThesvgIcon) => {
    setCreateError(null);
    setCreatingSlug(icon.slug);
    const result = await upsertTool({ id: icon.slug, name: icon.title, logo: thesvgIconUrl(icon.slug) });
    setCreatingSlug(null);
    if (!result.ok) {
      setCreateError(result.reason ?? `Gagal menambah tool "${icon.title}".`);
      return;
    }
    onChange([...selectedIds, icon.slug]);
    setQuery('');
    setOpen(false);
  };

  const remove = (toolId: string) => onChange(selectedIds.filter((id) => id !== toolId));

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { setTimeout(() => setOpen(false), 150); }}
        placeholder="Cari tool… (dari Tools tab atau icon library)"
        autoComplete="off"
        className={inputClass}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-ld-frost bg-white shadow-lg max-h-64 overflow-y-auto py-1">
          {suggestions.map((s) => {
            const key = s.source === 'local' ? `local-${s.tool.id}` : `cdn-${s.icon.slug}`;
            const logo = s.source === 'local' ? s.tool.logo : thesvgIconUrl(s.icon.slug);
            const name = s.source === 'local' ? s.tool.name : s.icon.title;
            const busy = s.source === 'cdn' && creatingSlug === s.icon.slug;
            return (
              <li key={key}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => (s.source === 'local' ? selectLocal(s.tool) : selectCdn(s.icon))}
                  disabled={busy}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-ld-onyx hover:bg-ld-cloud cursor-pointer border-none bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin shrink-0" />
                  ) : logo ? (
                    <img src={logo} alt="" className="w-5 h-5 object-contain shrink-0" />
                  ) : (
                    <ImageOff size={14} className="text-ld-fog shrink-0" />
                  )}
                  <span>{name}</span>
                  {s.source === 'cdn' && <span className="ml-auto text-[10px] text-ld-fog">icon library · baru</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {createError && <p className="text-xs text-red-500 mt-1.5 m-0">{createError}</p>}

      {selectedTools.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {selectedTools.map((tool) => (
            <span
              key={tool.id}
              className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border border-ld-frost bg-ld-cloud/60 text-xs text-ld-onyx"
            >
              {tool.logo ? (
                <img src={tool.logo} alt="" className="w-4 h-4 object-contain shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-ld-cloud shrink-0" />
              )}
              {tool.name}
              <button
                type="button"
                onClick={() => remove(tool.id)}
                aria-label={`Hapus ${tool.name}`}
                className="p-0.5 rounded-full text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectToolsField;
