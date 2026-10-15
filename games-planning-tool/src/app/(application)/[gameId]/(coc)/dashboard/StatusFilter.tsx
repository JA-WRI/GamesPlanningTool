//50% or more AI-generated
'use client';

import { useEffect, useRef, useState } from 'react';
import { Funnel } from 'lucide-react';
import {
  STATUS_ORDER,
  statusColor,
  type Status,
} from '@/components/commons/status';
import Tag from '@/components/commons/tag';

type StatusFilterProps = {
  selected: Status[];
  onChange: (statuses: Status[]) => void;
};

export default function StatusFilter({
  selected,
  onChange,
}: StatusFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function toggle(status: Status) {
    onChange(
      selected.includes(status)
        ? selected.filter((s) => s !== status)
        : [...selected, status],
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Filter by status"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 ${
          selected.length > 0 ? 'bg-[#EF8B64]/20' : 'bg-white'
        }`}
      >
        <Funnel size={18} className="text-gray-600" />
        {selected.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8B1010] px-1 text-[10px] text-white">
            {selected.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 text-xs text-gray-600">
            Show NSOs with at least one step marked:
          </p>
          <ul className="flex flex-col gap-2">
            {STATUS_ORDER.map((status) => (
              <li key={status}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(status)}
                    onChange={() => toggle(status)}
                  />
                  <Tag label={status} color={statusColor[status]} />
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={selected.length === 0}
            className="mt-3 text-xs underline disabled:text-gray-400 disabled:no-underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
