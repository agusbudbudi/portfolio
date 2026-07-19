import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QaLibraryMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

const textareaClass =
  'w-full h-80 px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx font-mono focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac resize-y';

// Markdown textarea + live preview, no WYSIWYG dependency — bare
// <ReactMarkdown> usage matches ProjectCard.tsx's case-study renderer.
const QaLibraryMarkdownEditor: React.FC<QaLibraryMarkdownEditorProps> = ({ value, onChange, error }) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="block">
      <div className="flex items-center gap-1 mb-1.5">
        <button
          type="button"
          onClick={() => setTab('write')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-none transition-colors ${tab === 'write' ? 'bg-ld-lilac/60 text-ld-violet' : 'bg-transparent text-ld-fog hover:text-ld-graphite'}`}
        >
          Tulis
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-none transition-colors ${tab === 'preview' ? 'bg-ld-lilac/60 text-ld-violet' : 'bg-transparent text-ld-fog hover:text-ld-graphite'}`}
        >
          Preview
        </button>
      </div>

      {tab === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tulis konten artikel dalam format Markdown…"
          className={textareaClass}
        />
      ) : (
        <div className="w-full h-80 overflow-y-auto px-3.5 py-2.5 rounded-lg border border-ld-frost bg-ld-cloud/40 text-sm text-ld-onyx markdown-body prose max-w-none">
          {value.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown> : <p className="text-ld-fog italic">Belum ada konten.</p>}
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1.5" role="alert">{error}</p>}
    </div>
  );
};

export default QaLibraryMarkdownEditor;
