import React, { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { SKILL_LEVEL_OPTIONS, type PortfolioSkillEntry, type SkillConfig, type SkillLevel } from '../../../../types/portfolio';
import { slugify } from '../../../../lib/portfolioValidation';
import { useAdminSkillsStore } from '../../../../store/useAdminSkillsStore';

// Name-search dropdown for picking which skills a mentee wants to show on
// their portfolio, plus a per-skill proficiency level. Suggestions come from
// the shared Skills master list (Skills tab) — typing a name that doesn't
// match anything yet offers to create it inline via the skills store (same
// as SkillForm), so it stays consistent with the server-side check that
// every skillEntries[].skillId exists in the skills document
// (portfolioValidation.ts's validatePortfolioData).
interface PortfolioSkillsFieldProps {
  allSkills: SkillConfig[];
  entries: PortfolioSkillEntry[];
  onChange: (entries: PortfolioSkillEntry[]) => void;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const DEFAULT_LEVEL: SkillLevel = 'intermediate';

const PortfolioSkillsField: React.FC<PortfolioSkillsFieldProps> = ({ allSkills, entries, onChange }) => {
  const upsertSkill = useAdminSkillsStore((s) => s.upsertSkill);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const selectedIds = entries.map((e) => e.skillId);
  const skillById = new Map(allSkills.map((s) => [s.id, s]));
  const availableSkills = allSkills.filter((s) => !selectedIds.includes(s.id));
  const q = query.trim().toLowerCase();

  const matches = (q ? availableSkills.filter((s) => s.name.toLowerCase().includes(q)) : availableSkills).slice(0, 8);
  const exactMatch = q.length > 0 && allSkills.some((s) => s.name.toLowerCase() === q);
  const canCreate = q.length > 0 && !exactMatch;

  const select = (skill: SkillConfig) => {
    onChange([...entries, { skillId: skill.id, level: DEFAULT_LEVEL }]);
    setQuery('');
    setOpen(false);
  };

  const createAndSelect = async () => {
    const name = query.trim();
    if (!name) return;
    setCreateError(null);
    setCreating(true);
    const id = slugify(name);
    const result = await upsertSkill({ id, name });
    setCreating(false);
    if (!result.ok) {
      setCreateError(result.reason ?? `Gagal menambah skill "${name}".`);
      return;
    }
    onChange([...entries, { skillId: id, level: DEFAULT_LEVEL }]);
    setQuery('');
    setOpen(false);
  };

  const remove = (skillId: string) => onChange(entries.filter((e) => e.skillId !== skillId));
  const setLevel = (skillId: string, level: SkillLevel) =>
    onChange(entries.map((e) => (e.skillId === skillId ? { ...e, level } : e)));

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { setTimeout(() => setOpen(false), 150); }}
        placeholder="Cari skill… (dari Skills tab, atau ketik nama baru)"
        autoComplete="off"
        className={inputClass}
      />
      {open && (matches.length > 0 || canCreate) && (
        <ul className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-ld-frost bg-white shadow-lg max-h-64 overflow-y-auto py-1">
          {matches.map((skill) => (
            <li key={skill.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(skill)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-ld-onyx hover:bg-ld-cloud cursor-pointer border-none bg-transparent"
              >
                <span>{skill.name}</span>
              </button>
            </li>
          ))}
          {canCreate && (
            <li>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={createAndSelect}
                disabled={creating}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Plus size={14} className="shrink-0" />}
                <span>Tambah skill "{query.trim()}"</span>
              </button>
            </li>
          )}
        </ul>
      )}
      {createError && <p className="text-xs text-red-500 mt-1.5 m-0">{createError}</p>}

      {entries.length > 0 && (
        <div className="flex flex-col gap-2 mt-2.5">
          {entries.map((entry) => {
            const skill = skillById.get(entry.skillId);
            if (!skill) return null;
            return (
              <div
                key={entry.skillId}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-ld-frost bg-ld-cloud/40"
              >
                <span className="text-sm text-ld-onyx flex-grow truncate">{skill.name}</span>
                <select
                  value={entry.level}
                  onChange={(e) => setLevel(entry.skillId, e.target.value as SkillLevel)}
                  className="px-2 py-1 rounded-md border border-ld-frost bg-white text-xs text-ld-graphite focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac cursor-pointer"
                >
                  {SKILL_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(entry.skillId)}
                  aria-label={`Hapus ${skill.name}`}
                  className="p-1 rounded-full text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioSkillsField;
