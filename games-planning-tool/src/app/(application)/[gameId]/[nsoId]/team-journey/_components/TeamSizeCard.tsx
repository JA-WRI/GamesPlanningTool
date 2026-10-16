// AI contribution: 50% or more AI-generated
'use client';

import type { ColumnDefinition } from '@/components/commons/Grid';
import { sumColumn } from '../_lib/teamSizeGridLogic';

// restyles the shared grid from outside: fits the card (no sideways
// scroll), no outer border, white header with gray labels, compact rows
// (~40px) and inputs that can shrink to the column width
export const GRID_LOOK =
  '[&_.MuiTable-root]:min-w-0! [&_.MuiTableContainer-root]:border-0! [&_thead]:bg-transparent! [&_th_span]:text-gray-500! [&_th]:px-2! [&_th]:py-2! [&_td]:px-2! [&_td]:py-2.5! [&_.MuiFormControl-root]:min-w-0!';

type CardActions = {
  isEditing: boolean;
  canSave: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

type TeamSizeCardProps = CardActions & {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-800">
      <span className="h-4 w-1 rounded-sm bg-[#d29b2c]" />
      {children}
    </h2>
  );
}

function EditButtons({
  isEditing,
  canSave,
  onEdit,
  onCancel,
  onSave,
}: CardActions) {
  const outline =
    'cursor-pointer rounded-md border px-4 py-1.5 text-sm font-semibold';

  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className={`${outline} border-[#7d1a16] text-[#7d1a16] hover:bg-red-50`}
      >
        Edit
      </button>
    );
  }
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCancel}
        className={`${outline} border-gray-300 text-gray-700 hover:bg-gray-50`}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className={`${outline} border-[#7d1a16] bg-[#7d1a16] text-white hover:bg-[#65140f] disabled:cursor-not-allowed disabled:opacity-50`}
      >
        Save
      </button>
    </div>
  );
}

// solid dark Total row, same columns and widths as the grid so
// each total sits under its header
export function TotalRow<T extends Record<string, unknown>>({
  rows,
  columns,
}: {
  rows: T[];
  columns: ColumnDefinition<T>[];
}) {
  return (
    <div className="flex rounded-lg bg-foreground py-2.5 text-sm font-bold text-white">
      {columns.map((col, index) => (
        <span
          key={String(col.field)}
          style={{ width: col.width }}
          className={index === 0 ? 'px-2' : 'px-2 text-center'}
        >
          {index === 0 ? 'Total' : sumColumn(rows, col.field)}
        </span>
      ))}
    </div>
  );
}

type CardBandProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

// beige band at the top of a card: title on the left, buttons on the right
export function CardBand({ title, subtitle, children }: CardBandProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 bg-background px-4 py-2">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// white card with a title band and Edit / Cancel / Save
export default function TeamSizeCard({
  title,
  subtitle,
  children,
  ...actions
}: TeamSizeCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <CardBand title={title} subtitle={subtitle}>
        <EditButtons {...actions} />
      </CardBand>
      <div className="space-y-3 px-4 pt-2 pb-4">{children}</div>
    </div>
  );
}
