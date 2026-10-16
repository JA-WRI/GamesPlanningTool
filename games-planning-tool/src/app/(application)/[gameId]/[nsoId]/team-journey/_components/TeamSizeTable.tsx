// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from './NotesBox';
import TeamSizeCard, { GRID_LOOK, TotalRow } from './TeamSizeCard';
import { useGridCard } from './useGridCard';
import { TeamSize } from '../_lib/teamSizeLogic';
import {
  TeamSizeRow,
  athletesToRows,
  rowHasRangeError,
  rowsToAthletes,
  MAX_COUNT,
  allWholeCounts,
  withFixedLabels,
} from '../_lib/teamSizeGridLogic';

type TeamSizeTableProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
};

// Best guess is the 3rd column: muted header and bold muted numbers
const BEST_GUESS_LOOK =
  '[&_th:nth-child(3)_span]:text-muted! [&_td:nth-child(3)>span]:text-muted! [&_td:nth-child(3)>span]:font-semibold!';

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

const COUNT_FIELDS: (keyof TeamSizeRow)[] = ['low', 'bestGuess', 'high'];

const columns: ColumnDefinition<TeamSizeRow>[] = [
  { field: 'label', label: '', width: '25%' },
  numberColumn('low', 'LOW'),
  numberColumn('bestGuess', 'BEST GUESS'),
  numberColumn('high', 'HIGH'),
];

// warnings shown under the table while something can't be saved
function TeamSizeWarnings({ rows }: { rows: TeamSizeRow[] }) {
  const brokenRows = rows.filter(rowHasRangeError);
  return (
    <>
      {brokenRows.length > 0 && (
        <Alert severity="warning">
          {brokenRows.map((row) => row.label).join(', ')}: Low must be ≤ Best
          guess ≤ High. Fix this before saving.
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

export default function TeamSizeTable({
  teamSize,
  onChange,
}: TeamSizeTableProps) {
  const card = useGridCard<TeamSizeRow>({
    initialRows: athletesToRows(teamSize.athletes),
    initialNotes: teamSize.notes,
    // never called, this table has no add button
    createRow: () => athletesToRows(teamSize.athletes)[0],
    isValid: (rows) =>
      !rows.some(rowHasRangeError) && allWholeCounts(rows, COUNT_FIELDS),
    onSave: (rows, notes) =>
      onChange({
        ...teamSize,
        athletes: rowsToAthletes(rows, teamSize.athletes),
        notes,
      }),
  });

  return (
    <TeamSizeCard
      title="Team size estimate"
      isEditing={card.isEditing}
      canSave={card.canSave}
      onEdit={card.edit}
      onCancel={card.cancel}
      onSave={card.save}
    >
      <div className={`${GRID_LOOK} ${BEST_GUESS_LOOK} space-y-1`}>
        <Grid
          columns={columns}
          rows={card.rows}
          isEditing={card.isEditing}
          onRowsChange={(rows) => card.setRows(withFixedLabels(rows))}
          onValidationChange={card.setHasCellError}
          allowDelete={false}
        />
        <TotalRow rows={card.rows} columns={columns} />
      </div>
      <TeamSizeWarnings rows={card.rows} />
      <NotesBox
        id="team-size-notes"
        value={card.notes}
        isEditing={card.isEditing}
        onChange={card.setNotes}
      />
    </TeamSizeCard>
  );
}
