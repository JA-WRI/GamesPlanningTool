// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from '@/components/commons/NotesBox';
import GridCard, { GRID_FIT, JOIN_TOTAL_ROW, TotalRow } from './GridCard';
import { useGridCard } from './useGridCard';
import { TeamSize } from '../../_lib/teamSizeLogic';
import {
  TeamSizeRow,
  athletesToRows,
  rowHasRangeError,
  rowsToAthletes,
  MAX_COUNT,
  allWholeCounts,
  withFixedLabels,
} from '../../_lib/teamSizeGridLogic';

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

const COUNT_FIELDS: (keyof TeamSizeRow)[] = ['low', 'bestGuess', 'high'];

const columns: ColumnDefinition<TeamSizeRow>[] = [
  { field: 'label', label: '', width: '25%' },
  numberColumn('low', 'LOW'),
  numberColumn('bestGuess', 'BEST GUESS'),
  numberColumn('high', 'HIGH'),
];

// rows can be saved when every count is in order and a whole number
const isTeamSizeValid = (rows: TeamSizeRow[]) =>
  !rows.some(rowHasRangeError) && allWholeCounts(rows, COUNT_FIELDS);

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

export default function TeamSizeEstimateTable({
  teamSize,
  onChange,
}: TeamSizeEstimateTableProps) {
  const card = useGridCard<TeamSizeRow>({
    initialRows: athletesToRows(teamSize.athletes),
    // never called, this table has no add button
    createRow: () => athletesToRows(teamSize.athletes)[0],
    isValid: isTeamSizeValid,
    onSave: (rows) =>
      onChange({
        ...teamSize,
        athletes: rowsToAthletes(rows, teamSize.athletes),
      }),
  });

  return (
    <GridCard
      title="Team size estimate"
      isEditing={card.isEditing}
      isPreview={card.isPreview}
      onPreviewToggle={card.setIsPreview}
      onEdit={card.edit}
      onCancel={card.cancel}
      onSave={card.save}
    >
      {/* shared grid with its default look; only its width and bottom
          corners change so the Total row joins it */}
      <div className={`${GRID_FIT} ${JOIN_TOTAL_ROW}`}>
        <Grid
          columns={columns}
          rows={card.rows}
          isEditing={card.isEditing}
          isPreview={card.isPreview}
          onRowsChange={(rows) => card.setRows(withFixedLabels(rows))}
          onValidationChange={card.setHasCellError}
          allowDelete={false}
        />
        <TotalRow rows={card.rows} columns={columns} />
      </div>
      <TeamSizeWarnings rows={card.rows} />
      <NotesBox
        id="team-size-notes"
        value={teamSize.notes}
        onSave={(notes) => onChange({ ...teamSize, notes })}
      />
    </GridCard>
  );
}
