import React, { useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { PORTFOLIO_SECTION_LABELS, type PortfolioSectionId } from '../../../../types/portfolio';

interface SectionOrderEditorProps {
  order: PortfolioSectionId[];
  onChange: (order: PortfolioSectionId[]) => void;
}

// Drag-and-drop (native HTML5 DnD, no extra dependency) + arrow-button
// fallback for keyboard/no-JS-drag access. Reordering only ever permutes the
// fixed set of ids already in `order` — see DEFAULT_SECTION_ORDER /
// normalizeSectionOrder in portfolioValidation.ts.
const SectionOrderEditor: React.FC<SectionOrderEditorProps> = ({ order, onChange }) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <p className="text-xs text-ld-fog mb-3 mt-0">
        Urutan tampilan section di halaman portfolio publik. Drag untuk mengubah urutan, atau pakai tombol panah.
      </p>
      <ul className="flex flex-col gap-2 m-0 p-0 list-none">
        {order.map((id, i) => (
          <li
            key={id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
            onDragLeave={() => setOverIndex((cur) => (cur === i ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border bg-white transition-colors ${
              overIndex === i && dragIndex !== null && dragIndex !== i ? 'border-ld-violet bg-ld-lilac/40' : 'border-ld-frost'
            } ${dragIndex === i ? 'opacity-50' : ''}`}
          >
            <span className="cursor-grab text-ld-fog shrink-0" aria-hidden="true">
              <GripVertical size={16} />
            </span>
            <span className="text-sm text-ld-onyx flex-grow">{PORTFOLIO_SECTION_LABELS[id]}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label={`Pindahkan ${PORTFOLIO_SECTION_LABELS[id]} ke atas`}
                className="p-1.5 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === order.length - 1}
                aria-label={`Pindahkan ${PORTFOLIO_SECTION_LABELS[id]} ke bawah`}
                className="p-1.5 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SectionOrderEditor;
