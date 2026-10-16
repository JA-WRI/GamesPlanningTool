// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import TeamSizeCard, { GRID_FIT } from './TeamSizeCard';
import { useGridCard } from './useGridCard';
import { TeamSize } from '../_lib/teamSizeLogic';
import {
  MAX_COUNT,
  MedalObjectiveRow,
  allWholeCounts,
  medalRowHasError,
  medalsToRows,
  rowsToMedals,
  withMedalsLabel,
} from '../_lib/teamSizeGridLogic';

type PerformanceObjectivesProps = {
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
  { field: 'label', label: '', width: '50%' },
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
export default function PerformanceObjectives({
  teamSize,
  onChange,
}: PerformanceObjectivesProps) {
  const card = useGridCard<MedalObjectiveRow>({
    initialRows: medalsToRows(teamSize),
    // never called, this table has no add button
    createRow: () => medalsToRows(teamSize)[0],
    isValid: (rows) =>
      allWholeCounts(rows, COUNT_FIELDS) && !rows.some(medalRowHasError),
    onSave: (rows) => onChange(rowsToMedals(rows, teamSize)),
  });

  return (
    <TeamSizeCard
      title="Performance objectives"
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
          onRowsChange={(rows) => card.setRows(withMedalsLabel(rows))}
          onValidationChange={card.setHasCellError}
          allowDelete={false}
        />
      </div>
      <MedalWarnings rows={card.rows} />
    </TeamSizeCard>
  );
}
