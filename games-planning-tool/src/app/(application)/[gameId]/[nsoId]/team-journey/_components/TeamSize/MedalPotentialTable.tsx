// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { Alert } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import {
  MEDAL_POTENTIAL_OPTIONS,
  MedalRow,
  createEmptyMedalRow,
  rowsMissingName,
} from '../../_lib/teamSizeGridLogic';

type MedalPotentialTableProps = {
  rows: MedalRow[];
  onChange: (rows: MedalRow[]) => void;
};

const columns: ColumnDefinition<MedalRow>[] = [
  { field: 'firstName', label: 'FIRST NAME', width: '16%' },
  { field: 'lastName', label: 'LAST NAME', align: 'center', width: '18%' },
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
  onChange,
}: MedalPotentialTableProps) {
  // the rows as the user types, so the messages update live
  const [liveRows, setLiveRows] = useState(rows);

  return (
    <div className="flex flex-col gap-3">
      <BaseGridPage
        title="Medal potential"
        columns={columns}
        initialData={rows}
        createEmptyRow={createEmptyMedalRow}
        addButtonLabel="Add athlete"
        isValid={(rows) => rowsMissingName(rows).length === 0}
        onSave={onChange}
        onRowsChange={setLiveRows}
        showSearch={false}
      />
      {liveRows.length === 0 && (
        <p className="py-2 text-center text-sm text-gray-400">
          No athletes added yet
        </p>
      )}
      {/* only new rows can miss a name, saved rows always have both */}
      {rowsMissingName(liveRows).length > 0 && (
        <Alert severity="warning">
          Every athlete needs a first and last name.
        </Alert>
      )}
    </div>
  );
}
