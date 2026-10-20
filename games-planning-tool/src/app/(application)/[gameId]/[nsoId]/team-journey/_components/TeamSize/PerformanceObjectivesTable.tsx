// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { Alert } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import { TeamSize } from '../../_lib/teamSizeLogic';
import {
  MAX_COUNT,
  MedalObjectiveRow,
  allWholeCounts,
  medalRowHasError,
  medalsToRows,
  rowsToMedals,
} from '../../_lib/teamSizeGridLogic';

type PerformanceObjectivesTableProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
};

const COUNT_FIELDS: (keyof MedalObjectiveRow)[] = ['low', 'high'];

const numberColumn = (
  field: keyof MedalObjectiveRow,
  label: string,
): ColumnDefinition<MedalObjectiveRow> => ({
  field,
  label,
  type: 'number',
  min: 0,
  max: MAX_COUNT,
  align: 'center',
  width: '25%',
});

const columns: ColumnDefinition<MedalObjectiveRow>[] = [
  { field: 'label', label: '', width: '50%', readOnly: true },
  numberColumn('low', 'LOW'),
  numberColumn('high', 'HIGH'),
];

// warnings shown under the table while something can't be saved
function MedalWarnings({ rows }: { rows: MedalObjectiveRow[] }) {
  return (
    <>
      {rows.some(medalRowHasError) && (
        <Alert severity="warning">
          Projected medals: High must be greater than or equal to Low.
        </Alert>
      )}
      {!allWholeCounts(rows, COUNT_FIELDS) && (
        <Alert severity="warning">
          Use whole numbers from 0 to {MAX_COUNT}.
        </Alert>
      )}
    </>
  );
}

// projected medals Low and High, in the shared grid like the other tables
export default function PerformanceObjectivesTable({
  teamSize,
  onChange,
}: PerformanceObjectivesTableProps) {
  // the rows as the user types, so the warnings update live
  const [liveRows, setLiveRows] = useState(() => medalsToRows(teamSize));

  return (
    <div className="flex flex-col gap-3">
      <BaseGridPage
        title="Performance objectives"
        columns={columns}
        initialData={medalsToRows(teamSize)}
        // never called, this table has no add button
        createEmptyRow={() => medalsToRows(teamSize)[0]}
        isValid={(rows) =>
          allWholeCounts(rows, COUNT_FIELDS) && !rows.some(medalRowHasError)
        }
        onSave={(rows) => onChange(rowsToMedals(rows, teamSize))}
        onRowsChange={setLiveRows}
        showSearch={false}
        allowAddRow={false}
        allowDelete={false}
        fitWidth
      />
      <MedalWarnings rows={liveRows} />
    </div>
  );
}
