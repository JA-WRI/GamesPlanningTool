// Above 50% AI generated
'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { Funnel } from 'lucide-react';
import Tag, { type TagColor } from '@/components/commons/tag';

export type FilterOption = {
  label: string;
  value: string;
  color: TagColor;
};

type FilterButtonProps = {
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  ariaLabel?: string;
  description?: string;
  compact?: boolean;
};

// Closes the menu on outside click or Escape while it's open.
function useCloseOnOutsideOrEscape(
  containerRef: RefObject<HTMLDivElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, containerRef, onClose]);
}

// The dropdown's checkbox list + "Clear filters" button.
function FilterOptionsMenu({
  options,
  selected,
  description,
  onToggle,
  onClear,
}: {
  options: FilterOption[];
  selected: string[];
  description: string;
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-xs text-gray-600">{description}</p>

      <ul className="flex flex-col gap-2">
        {options.map((option) => (
          <li key={option.value}>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => onToggle(option.value)}
              />

              <Tag label={option.label} color={option.color ?? '#9CA3AF'} />
            </label>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onClear}
        disabled={selected.length === 0}
        className="mt-3 text-xs underline disabled:text-gray-400 disabled:no-underline"
      >
        Clear filters
      </button>
    </div>
  );
}

// The round funnel icon button with the selected-count badge.
function FilterToggleButton({
  open,
  ariaLabel,
  compact,
  selectedCount,
  onClick,
}: {
  open: boolean;
  ariaLabel: string;
  compact: boolean;
  selectedCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={open}
      onClick={onClick}
      className={`relative flex ${
        compact ? 'h-6 w-6' : 'h-10 w-10'
      } items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 ${
        selectedCount > 0 ? 'bg-[#EF8B64]/20' : 'bg-white'
      }`}
    >
      <Funnel size={compact ? 12 : 18} className="text-gray-600" />

      {selectedCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8B1010] px-1 text-[10px] text-white">
          {selectedCount}
        </span>
      )}
    </button>
  );
}

export default function FilterButton({
  options,
  selected,
  onChange,
  ariaLabel = 'Filter options',
  description = 'Select the options to display:',
  compact = false,
}: FilterButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useCloseOnOutsideOrEscape(containerRef, open, () => setOpen(false));

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <FilterToggleButton
        open={open}
        ariaLabel={ariaLabel}
        compact={compact}
        selectedCount={selected.length}
        onClick={() => setOpen((isOpen) => !isOpen)}
      />

      {open && (
        <FilterOptionsMenu
          options={options}
          selected={selected}
          description={description}
          onToggle={toggle}
          onClear={() => onChange([])}
        />
      )}
    </div>
  );
}
