import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { nextSort, type SortState } from '../../../../lib/tableSort';

interface Props<K extends string> {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onSort: (next: SortState<K>) => void;
  /** Words for the two directions in the tooltip, e.g. ['terlama', 'terbaru']. */
  dirLabels?: [asc: string, desc: string];
  className?: string;
}

/**
 * Admin table header that sorts by its column. Active column shows the
 * direction arrow (Sky Blue); others show a faint up-down hint on hover.
 */
function SortableTh<K extends string>({ label, sortKey, sort, onSort, dirLabels = ['terlama', 'terbaru'], className = '' }: Props<K>) {
  const active = sort.key === sortKey;
  const next = nextSort(sort, sortKey);
  const Icon = !active ? ArrowUpDown : sort.dir === 'desc' ? ArrowDown : ArrowUp;
  return (
    <th
      aria-sort={active ? (sort.dir === 'desc' ? 'descending' : 'ascending') : 'none'}
      className={`px-4 py-3 text-xs font-medium whitespace-nowrap ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(next)}
        title={`Urutkan ${label.toLowerCase()}: ${next.dir === 'desc' ? dirLabels[1] : dirLabels[0]} dulu`}
        className={`group inline-flex items-center gap-1 -mx-1.5 px-1.5 py-0.5 rounded-md border-none bg-transparent cursor-pointer transition-colors hover:bg-ld-frost/70 focus-visible:outline-2 focus-visible:outline-ld-violet ${
          active ? 'text-ld-graphite' : 'text-ld-steel hover:text-ld-graphite'
        }`}
      >
        {label}
        <Icon
          size={13}
          aria-hidden="true"
          className={active ? 'text-ld-violet' : 'text-ld-fog opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity'}
        />
        {active && <span className="sr-only">, urut {sort.dir === 'desc' ? dirLabels[1] : dirLabels[0]} dulu</span>}
      </button>
    </th>
  );
}

export default SortableTh;
