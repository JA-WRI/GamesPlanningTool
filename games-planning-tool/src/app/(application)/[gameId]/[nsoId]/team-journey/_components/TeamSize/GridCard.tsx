// AI contribution: 50% or more AI-generated
'use client';

import type { ColumnDefinition } from '@/components/commons/Grid';
import GridHeaderPage from '@/components/commons/GridHeader';
import { sumColumn } from '../../_lib/teamSizeGridLogic';

export const GRID_FIT =
  '[&_.MuiTable-root]:min-w-0! [&_.MuiFormControl-root]:min-w-0!';


export const JOIN_TOTAL_ROW = '[&_.MuiTableContainer-root]:rounded-b-none!';

type GridCardProps = {
  title: string;
  isEditing: boolean;
  isPreview: boolean;
  onEdit: () => void;
  onPreviewToggle: (preview: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
};

// Total row that looks like the grid's last row: same border colour on the
// left,right and bottom, rounded bottom corners, same column widths and
// cell padding, bold text, the table's own bottom border is the line above it
export function TotalRow<T extends Record<string, unknown>>({
  rows,
  columns,
}: {
  rows: T[];
  columns: ColumnDefinition<T>[];
}) {
  return (
    <div className="flex rounded-b-lg border border-t-0 border-gray-200 bg-white py-3 text-sm font-bold text-foreground">
      {columns.map((col, index) => (
        <span
          key={String(col.field)}
          style={{ width: col.width }}
          className={index === 0 ? 'px-3' : 'px-3 text-center'}
        >
          {index === 0 ? 'Total' : sumColumn(rows, col.field)}
        </span>
      ))}
    </div>
  );
}

// white card: Marwa's shared GridHeader (title only, used as is)then the table
// a column so the notes box can fill the space left at the bottom
export default function GridCard({
  title,
  isEditing,
  isPreview,
  onEdit,
  onPreviewToggle,
  onCancel,
  onSave,
  children,
}: GridCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <GridHeaderPage
        title={title}
        isEditing={isEditing}
        isPreview={isPreview}
        onEditToggle={onEdit}
        onPreviewToggle={onPreviewToggle}
        onCancel={onCancel}
        onSave={onSave}
      />
      {children}
    </div>
  );
}
