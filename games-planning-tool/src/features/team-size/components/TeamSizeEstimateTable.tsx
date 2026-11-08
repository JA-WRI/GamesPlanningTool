// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { Alert } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from '@/components/commons/NotesBox';
import { TeamSize } from '../lib/teamSizeLogic';
import {
  TeamSizeRow,
  athletesToRows,
  gendersWithRangeError,
  rowsToAthletes,
  MAX_COUNT,
  allWholeCounts,
} from '../lib/teamSizeGridLogic';

type TeamSizeEstimateTableProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
};

const numberColumn = (
  field: keyof TeamSizeRow,
  label: string,
): ColumnDefinition<TeamSizeRow> => ({
  field,
  label,
  type: 'number',
  min: 0,
  max: MAX_COUNT,
  align: 'center',
  width: '25%',
});

const COUNT_FIELDS: (keyof TeamSizeRow)[] = ['male', 'female'];

const columns: ColumnDefinition<TeamSizeRow>[] = [
  { field: 'label', label: '', width: '25%', readOnly: true },
  numberColumn('male', 'MALE'),
  numberColumn('female', 'FEMALE'),
  // the shared grid adds Male + Female on its own
  {
    field: 'total',
    label: 'TOTAL',
    type: 'calculated',
    formula: { operator: '+', fieldA: 'male', fieldB: 'female' },
    align: 'center',
    width: '25%',
  },
];

// rows can be saved when every count is in order and a whole number
const isTeamSizeValid = (rows: TeamSizeRow[]) =>
  gendersWithRangeError(rows).length === 0 &&
  allWholeCounts(rows, COUNT_FIELDS);

// warnings shown under the table while something can't be saved
function TeamSizeWarnings({ rows }: { rows: TeamSizeRow[] }) {
  const brokenGenders = gendersWithRangeError(rows);
  return (
    <>
      {brokenGenders.length > 0 && (
        <Alert severity="warning">
          {brokenGenders.join(', ')}: Low must be ≤ Best guess ≤ High. Fix this
          before saving.
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

export default function TeamSizeEstimateTable({
  teamSize,
  onChange,
}: TeamSizeEstimateTableProps) {
  // the rows as the user types, so the warnings update live
  const [liveRows, setLiveRows] = useState(() =>
    athletesToRows(teamSize.athletes),
  );

  return (
    <div className="flex flex-col gap-3">
      <BaseGridPage
        title="Team size estimate"
        columns={columns}
        initialData={athletesToRows(teamSize.athletes)}
        // never called, this table has no add button
        createEmptyRow={() => athletesToRows(teamSize.athletes)[0]}
        isValid={isTeamSizeValid}
        onSave={(rows) =>
          onChange({ ...teamSize, athletes: rowsToAthletes(rows) })
        }
        onRowsChange={setLiveRows}
        showSearch={false}
        allowAddRow={false}
        allowDelete={false}
        fitWidth
      />
      <TeamSizeWarnings rows={liveRows} />
      <NotesBox
        id="team-size-notes"
        value={teamSize.notes}
        onSave={(notes) => onChange({ ...teamSize, notes })}
      />
    </div>
  );
}
