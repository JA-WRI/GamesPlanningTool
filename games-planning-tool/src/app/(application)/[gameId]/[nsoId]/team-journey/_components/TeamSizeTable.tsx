// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from './NotesBox';
import TeamSizeCard, { GRID_LOOK } from './TeamSizeCard';
import { useGridCard } from './useGridCard';
import { TeamSize } from '../_lib/teamSizeLogic';
import {
  TeamSizeRow,
  athletesToRows,
  rowHasRangeError,
  rowsToAthletes,
  sumColumn,
  withFixedLabels,
} from '../_lib/teamSizeGridLogic';

type TeamSizeTableProps = {
  teamSize: TeamSize;
  onChange: (teamSize: TeamSize) => void;
};

// Best guess is the 3rd column: burgundy header and numbers
const BEST_GUESS_LOOK =
  '[&_th:nth-child(3)_span]:text-[#7d1a16]! [&_td:nth-child(3)>span]:text-[#7d1a16]! [&_td:nth-child(3)>span]:font-semibold!';

const numberColumn = (
  field: keyof TeamSizeRow,
  label: string,
): ColumnDefinition<TeamSizeRow> => ({
  field,
  label,
  type: 'number',
  min: 0,
  align: 'center',
  width: '25%',
});

const columns: ColumnDefinition<TeamSizeRow>[] = [
  { field: 'label', label: '', width: '25%' },
  numberColumn('low', 'LOW'),
  numberColumn('bestGuess', 'BEST GUESS'),
  numberColumn('high', 'HIGH'),
];

// same columns and widths as the grid, so totals sit under each header
function TotalRow({ rows }: { rows: TeamSizeRow[] }) {
  return (
    <div className="flex rounded-lg bg-[#7d1a16] py-2.5 text-sm font-bold text-white">
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

export default function TeamSizeTable({
  teamSize,
  onChange,
}: TeamSizeTableProps) {
  const card = useGridCard<TeamSizeRow>({
    initialRows: athletesToRows(teamSize.athletes),
    initialNotes: teamSize.notes,
    // never called, this table has no add button
    createRow: () => athletesToRows(teamSize.athletes)[0],
    isValid: (rows) => !rows.some(rowHasRangeError),
    onSave: (rows, notes) =>
      onChange({
        ...teamSize,
        athletes: rowsToAthletes(rows, teamSize.athletes),
        notes,
      }),
  });
  const brokenRows = card.rows.filter(rowHasRangeError);

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
        <TotalRow rows={card.rows} />
      </div>
      {brokenRows.length > 0 && (
        <Alert severity="warning">
          {brokenRows.map((row) => row.label).join(', ')}: Low must be ≤ Best
          guess ≤ High. Fix this before saving.
        </Alert>
      )}
      <NotesBox
        id="team-size-notes"
        value={card.notes}
        isEditing={card.isEditing}
        onChange={card.setNotes}
      />
    </TeamSizeCard>
  );
}
