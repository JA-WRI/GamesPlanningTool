// AI contribution: 50% or more AI-generated
'use client';

import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import {
  MEDAL_POTENTIAL_OPTIONS,
  MedalRow,
  createEmptyMedalRow,
} from '../lib/teamSizeGridLogic';

type MedalPotentialTableProps = {
  rows: MedalRow[];
  onSave: (rows: MedalRow[]) => void;
};

// the names come from members, so they cannot be edited here
const columns: ColumnDefinition<MedalRow>[] = [
  { field: 'firstName', label: 'FIRST NAME', width: '16%', readOnly: true },
  {
    field: 'lastName',
    label: 'LAST NAME',
    align: 'center',
    width: '18%',
    readOnly: true,
  },
  { field: 'event', label: 'EVENT', align: 'center', width: '24%' },
  {
    field: 'medalPotential',
    label: 'MEDAL POTENTIAL',
    type: 'select',
    options: MEDAL_POTENTIAL_OPTIONS,
    placeholder: 'Select',
    align: 'center',
    width: '18%',
  },
  {
    field: 'notes',
    label: 'NOTES',
    placeholder: 'Add note',
    align: 'center',
    width: '24%',
  },
];

export default function MedalPotentialTable({
  rows,
  onSave,
}: MedalPotentialTableProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* athletes are added in members, not here */}
      <BaseGridPage
        title="Medal potential"
        columns={columns}
        initialData={rows}
        createEmptyRow={createEmptyMedalRow}
        allowAddRow={false}
        allowDelete={false}
        onSave={onSave}
        showSearch={false}
      />
      {rows.length === 0 && (
        <p className="py-2 text-center text-sm text-gray-400">
          No athletes in this game yet
        </p>
      )}
    </div>
  );
}
