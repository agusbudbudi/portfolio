import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { GithubRepoEntry } from '../../../../types/portfolio';
import { GITHUB_REPO_URL_RE } from '../../../../lib/portfolioValidation';
import FormField from '../shared/FormField';
import { ADD_ITEM_BUTTON } from '../shared/adminCard';

interface GithubRepoListEditorProps {
  repos: GithubRepoEntry[];
  onChange: (repos: GithubRepoEntry[]) => void;
  submitted: boolean;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const emptyEntry = (): GithubRepoEntry => ({ id: crypto.randomUUID(), url: '' });

// Admin only pastes the repo URL — title/description/thumbnail are fetched
// live from the GitHub API on the public page (see useGithubRepos.ts), same
// "don't store what you can fetch" approach as GithubActivitySection.
const GithubRepoListEditor: React.FC<GithubRepoListEditorProps> = ({ repos, onChange, submitted }) => {
  const update = (id: string, url: string) => onChange(repos.map((r) => (r.id === id ? { ...r, url } : r)));
  const remove = (id: string) => onChange(repos.filter((r) => r.id !== id));
  const add = () => onChange([...repos, emptyEntry()]);

  return (
    <div>
      <p className="text-xs text-ld-fog mb-3 mt-0">
        Link repository GitHub publik. Thumbnail, judul, dan deskripsi diambil otomatis dari GitHub saat portfolio dibuka.
      </p>
      <div className="space-y-2.5">
        {repos.map((entry, i) => {
          const trimmed = entry.url.trim();
          const invalid = trimmed.length > 0 && !GITHUB_REPO_URL_RE.test(trimmed);
          return (
            <div key={entry.id} className="flex items-start gap-2">
              <FormField
                label={`Repo URL ${i + 1}`}
                required
                compact
                className="flex-grow"
                error={
                  submitted && !trimmed
                    ? 'URL repo wajib diisi.'
                    : invalid
                      ? 'Harus URL repo GitHub, mis. https://github.com/owner/repo.'
                      : null
                }
              >
                <input
                  type="url"
                  value={entry.url}
                  onChange={(e) => update(entry.id, e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className={inputClass}
                />
              </FormField>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Hapus repo ${i + 1}`}
                className="mt-6 p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={add} className={ADD_ITEM_BUTTON}>
        <Plus size={13} /> Tambah Repo
      </button>
    </div>
  );
};

export default GithubRepoListEditor;
