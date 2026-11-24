import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Loader2, Plus, Search } from 'lucide-react';
import { PANEL_CLASS, TRIGGER_CLASS, useAnchoredPanel } from './useAnchoredPanel';

// Searchable select (single or multi) — the companion to Select for lists
// long enough that scanning isn't practical (mentors, users, articles,
// categories, topics). Same panel look as Select, portalled to <body>.
//
// Keyboard: on the trigger ↓/Enter/Space open (typing opens and starts the
// search); in the search box ↑/↓ move, Enter chooses (multi: toggles and
// stays open), Esc closes, Tab closes.
//
// Optional `onCreate` adds an "Add …" row when the query matches no option
// exactly; it may return an error message to show under the list.

export interface ComboboxOption {
  value: string;
  label: string;
  /** Second line under the label (e.g. email, expertise). Not searched. */
  description?: string;
  /** Avatar/icon before the label, in the list and in the trigger. */
  leading?: React.ReactNode;
  /** Extra text matched by the search but not shown (e.g. an email). */
  keywords?: string;
}

interface BaseProps {
  options: ComboboxOption[];
  /** Trigger text when nothing is selected. */
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  /** Trigger classes; defaults to the standard admin input look. */
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  onCreate?: (query: string) => Promise<string | void> | string | void;
  createLabel?: (query: string) => string;
}

interface SingleProps extends BaseProps {
  multiple?: false;
  value: string | undefined;
  onChange: (value: string) => void;
}

interface MultiProps extends BaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
  /** Cap on selected values; further options are disabled once reached. */
  max?: number;
  maxReachedLabel?: string;
}

export type ComboboxProps = SingleProps | MultiProps;

const LIST_MAX_H = 256;

function matches(option: ComboboxOption, q: string): boolean {
  return option.label.toLowerCase().includes(q) || (option.keywords?.toLowerCase().includes(q) ?? false);
}

const Combobox: React.FC<ComboboxProps> = (props) => {
  const {
    options, placeholder = 'Pilih…', searchPlaceholder = 'Cari…', emptyLabel = 'Tidak ditemukan.',
    className, invalid = false, disabled = false, id, 'aria-label': ariaLabel, onCreate,
    createLabel = (q) => `Tambah "${q}"`,
  } = props;
  const selectedValues = useMemo(
    () => (props.multiple ? props.value : props.value ? [props.value] : []),
    [props.multiple, props.value],
  );
  const max = props.multiple ? props.max : undefined;
  const atMax = max !== undefined && selectedValues.length >= max;

  const autoId = useId();
  const triggerId = id ?? `combobox-${autoId}`;
  const listId = `${triggerId}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => (q ? options.filter((o) => matches(o, q)) : options), [options, q]);
  const canCreate = !!onCreate && q.length > 0 && !options.some((o) => o.label.toLowerCase() === q);
  const rowCount = filtered.length + (canCreate ? 1 : 0);

  const closeQuietly = useCallback(() => {
    setOpen(false);
    setQuery('');
    setCreateError(null);
  }, []);
  const close = (refocus = true) => {
    closeQuietly();
    if (refocus) triggerRef.current?.focus();
  };

  const { pos, place } = useAnchoredPanel({
    open,
    triggerRef,
    panelRef,
    panelHeight: 52 + Math.min(LIST_MAX_H, rowCount * 40 + 8),
    onOutsideClick: closeQuietly,
  });

  const openPanel = (initialQuery = '') => {
    if (disabled) return;
    place();
    setQuery(initialQuery);
    const selectedIndex = initialQuery ? -1 : options.findIndex((o) => o.value === selectedValues[0]);
    setActive(Math.max(0, selectedIndex));
    setOpen(true);
  };

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const isDisabledOption = (value: string) => atMax && !selectedValues.includes(value);

  const choose = (option: ComboboxOption) => {
    if (props.multiple) {
      if (props.value.includes(option.value)) {
        props.onChange(props.value.filter((v) => v !== option.value));
      } else if (!isDisabledOption(option.value)) {
        props.onChange([...props.value, option.value]);
      }
      return;
    }
    props.onChange(option.value);
    close();
  };

  const create = async () => {
    if (!onCreate || creating) return;
    const label = query.trim();
    setCreateError(null);
    setCreating(true);
    try {
      const error = await onCreate(label);
      if (error) setCreateError(error);
      else if (props.multiple) setQuery('');
      else close();
    } catch (err) {
      setCreateError(err instanceof Error && err.message ? err.message : `Gagal menambah "${label}".`);
    } finally {
      setCreating(false);
    }
  };

  const chooseRow = (index: number) => {
    if (index < filtered.length) choose(filtered[index]);
    else if (canCreate) void create();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || open) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPanel();
    } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openPanel(e.key);
    }
  };

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((a) => Math.min(rowCount - 1, a + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (rowCount > 0) chooseRow(Math.min(active, rowCount - 1));
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        close(false);
        break;
    }
  };

  // Multi keeps unknown ids visible as chips so they can still be spotted;
  // a single value with no matching option (e.g. a deleted article) shows
  // the placeholder, like a native <select> would.
  const selectedOptions: ComboboxOption[] = props.multiple
    ? selectedValues.map((v) => options.find((o) => o.value === v) ?? { value: v, label: v })
    : options.filter((o) => o.value === selectedValues[0]);
  const single = !props.multiple ? selectedOptions[0] : undefined;
  const borderClass = invalid ? 'border-red-500' : open ? 'border-ld-violet' : 'border-ld-frost hover:border-ld-violet';
  // A caller's className replaces the default look, but invalid/open still win.
  const stateOverride = invalid ? 'border-red-500!' : open ? 'border-ld-violet!' : '';

  return (
    <>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openPanel())}
        onKeyDown={onTriggerKeyDown}
        className={`${className ? `${className} ${stateOverride}` : `${TRIGGER_CLASS} ${borderClass}`} flex items-center justify-between gap-2 text-left cursor-pointer disabled:cursor-not-allowed`}
      >
        {props.multiple && selectedOptions.length > 0 ? (
          <span className="flex flex-wrap gap-1.5 min-w-0 py-0.5">
            {selectedOptions.map((o) => (
              <span key={o.value} className="px-2 py-0.5 rounded-full bg-ld-lilac text-ld-violet text-[11px] font-medium whitespace-nowrap">
                {o.label}
              </span>
            ))}
          </span>
        ) : single ? (
          <span className="flex items-center gap-2.5 min-w-0">
            {single.leading}
            <span className="min-w-0 truncate font-medium">{single.label}</span>
          </span>
        ) : (
          <span className="min-w-0 truncate text-ld-fog">{placeholder}</span>
        )}
        <ChevronDown size={16} className={`shrink-0 text-ld-fog transition-transform duration-200 ${open ? 'rotate-180 text-ld-violet' : ''}`} aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', left: pos.left, width: Math.max(pos.width, 240), top: pos.top, bottom: pos.bottom }}
            className={`${PANEL_CLASS} overflow-hidden`}
          >
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-ld-frost/60">
              <Search size={14} className="text-ld-fog shrink-0" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                role="combobox"
                aria-expanded
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={rowCount > 0 ? `${listId}-${Math.min(active, rowCount - 1)}` : undefined}
                aria-label={ariaLabel ?? searchPlaceholder}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActive(0); setCreateError(null); }}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full text-sm outline-none border-none bg-transparent text-ld-onyx placeholder:text-ld-fog"
              />
            </div>

            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-multiselectable={props.multiple || undefined}
              className="m-0 p-1 list-none overflow-y-auto"
              style={{ maxHeight: LIST_MAX_H }}
            >
              {rowCount === 0 && (
                <li className="px-3 py-3 text-xs text-ld-fog text-center">{emptyLabel}</li>
              )}
              {filtered.map((o, i) => {
                const isSelected = selectedValues.includes(o.value);
                const isDisabled = isDisabledOption(o.value);
                return (
                  <li
                    key={o.value}
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled || undefined}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(o)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm select-none ${
                      isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    } ${i === active ? 'bg-ld-lilac' : ''}`}
                  >
                    {props.multiple && (
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-ld-violet border-ld-violet text-white' : 'border-ld-frost bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </span>
                    )}
                    {o.leading}
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate ${isSelected ? 'text-ld-violet font-medium' : 'text-ld-graphite'}`}>{o.label}</span>
                      {o.description && <span className="block text-[11px] text-ld-fog truncate">{o.description}</span>}
                    </span>
                    {!props.multiple && isSelected && <Check size={14} className="shrink-0 text-ld-violet" aria-hidden="true" />}
                  </li>
                );
              })}
              {canCreate && (
                <li
                  id={`${listId}-${filtered.length}`}
                  data-index={filtered.length}
                  role="option"
                  aria-selected={false}
                  aria-disabled={creating || undefined}
                  onMouseEnter={() => setActive(filtered.length)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void create()}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-ld-violet select-none ${
                    creating ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  } ${active === filtered.length ? 'bg-ld-lilac' : ''}`}
                >
                  {creating ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Plus size={14} className="shrink-0" />}
                  <span className="min-w-0 truncate">{createLabel(query.trim())}</span>
                </li>
              )}
            </ul>

            {createError && <p className="m-0 px-3 pb-2.5 text-xs text-red-500" role="alert">{createError}</p>}
            {props.multiple && atMax && props.maxReachedLabel && (
              <p className="m-0 px-3 py-2 text-[11px] text-ld-fog border-t border-ld-frost/60">{props.maxReachedLabel}</p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};

export default Combobox;
