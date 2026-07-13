import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalItems <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between mt-3 px-1">
      <p className="text-xs text-ld-fog m-0">{start}–{end} dari {totalItems} data</p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className="p-1.5 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border border-ld-frost bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs text-ld-slate px-2 whitespace-nowrap">Halaman {page} / {totalPages}</span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className="p-1.5 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border border-ld-frost bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
