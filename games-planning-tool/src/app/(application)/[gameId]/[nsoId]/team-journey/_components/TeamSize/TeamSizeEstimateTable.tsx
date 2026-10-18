// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from '@/components/commons/NotesBox';
import GridCard, { GRID_FIT } from './GridCard';
import { useGridCard } from './useGridCard';
import { TeamSize } from '../../_lib/teamSizeLogic';
import {
  TeamSizeRow,
  athletesToRows,
  gendersWithRangeError,
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

const COUNT_FIELDS: (keyof TeamSizeRow)[] = ['male', 'female'];

const columns: ColumnDefinition<TeamSizeRow>[] = [
  { field: 'label', label: '', width: '25%' },
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
  const card = useGridCard<TeamSizeRow>({
    initialRows: athletesToRows(teamSize.athletes),
    // never called, this table has no add button
    createRow: () => athletesToRows(teamSize.athletes)[0],
    isValid: isTeamSizeValid,
    onSave: (rows) => onChange({ ...teamSize, athletes: rowsToAthletes(rows) }),
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
      {/* shared grid with its default look; GRID_FIT only changes its width */}
      <div className={GRID_FIT}>
        <Grid
          columns={columns}
          rows={card.rows}
          isEditing={card.isEditing}
          isPreview={card.isPreview}
          onRowsChange={(rows) => card.setRows(withFixedLabels(rows))}
          onValidationChange={card.setHasCellError}
          allowDelete={false}
        />
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
