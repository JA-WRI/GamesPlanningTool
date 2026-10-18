// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import GridCard from './GridCard';
import { useGridCard } from './useGridCard';
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
  const card = useGridCard<MedalObjectiveRow>({
    initialRows: medalsToRows(teamSize),
    // never called, this table has no add button
    createRow: () => medalsToRows(teamSize)[0],
    isValid: (rows) =>
      allWholeCounts(rows, COUNT_FIELDS) && !rows.some(medalRowHasError),
    onSave: (rows) => onChange(rowsToMedals(rows, teamSize)),
  });

  return (
    <GridCard
      title="Performance objectives"
      isEditing={card.isEditing}
      isPreview={card.isPreview}
      onPreviewToggle={card.setIsPreview}
      onEdit={card.edit}
      onCancel={card.cancel}
      onSave={card.save}
    >
      <Grid
        columns={columns}
        rows={card.rows}
        isEditing={card.isEditing}
        isPreview={card.isPreview}
        onRowsChange={card.setRows}
        onValidationChange={card.setHasCellError}
        allowDelete={false}
        fitWidth
      />
      <MedalWarnings rows={card.rows} />
    </GridCard>
  );
}
