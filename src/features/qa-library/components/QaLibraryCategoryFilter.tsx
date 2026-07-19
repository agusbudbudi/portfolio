import React from 'react';
import type { QaLibraryCategory } from '../../../types/qaLibrary';

interface QaLibraryCategoryFilterProps {
  categories: QaLibraryCategory[];
  activeCategoryId: string | undefined;
  onChange: (categoryId: string | undefined) => void;
}

const QaLibraryCategoryFilter: React.FC<QaLibraryCategoryFilterProps> = ({ categories, activeCategoryId, onChange }) => (
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => onChange(undefined)}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer border transition-colors ${!activeCategoryId ? 'bg-ld-violet text-white border-ld-violet' : 'bg-white text-ld-graphite border-ld-frost hover:border-ld-violet'}`}
    >
      Semua
    </button>
    {categories.map((category) => (
      <button
        key={category.id}
        onClick={() => onChange(category.id)}
        className={`px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer border transition-colors ${activeCategoryId === category.id ? 'bg-ld-violet text-white border-ld-violet' : 'bg-white text-ld-graphite border-ld-frost hover:border-ld-violet'}`}
      >
        {category.label}
      </button>
    ))}
  </div>
);

export default QaLibraryCategoryFilter;
