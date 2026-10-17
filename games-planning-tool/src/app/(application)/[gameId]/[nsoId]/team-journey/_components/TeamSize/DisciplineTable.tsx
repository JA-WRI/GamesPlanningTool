// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from '@/components/commons/NotesBox';
import GridCard, { GRID_FIT, JOIN_TOTAL_ROW, TotalRow } from './GridCard';
import { useGridCard } from './useGridCard';
import {
  DisciplineBreakdown,
  DisciplineRow,
  MAX_COUNT,
  allWholeCounts,
  disciplineHasLowAboveBest,
  withDisciplineLabels,
} from '../../_lib/teamSizeGridLogic';

type DisciplineTableProps = {
  disciplines: DisciplineBreakdown;
  onChange: (disciplines: DisciplineBreakdown) => void;
};

const numberColumn = (
  field: keyof DisciplineRow,
  label: string,
): ColumnDefinition<DisciplineRow> => ({
  field,
  label,
  type: 'number',
  min: 0,
  max: MAX_COUNT,
  align: 'center',
  width: '20%',
});

const COUNT_FIELDS: (keyof DisciplineRow)[] = [
  'bestF',
  'bestM',
  'lowF',
  'lowM',
];

const columns: ColumnDefinition<DisciplineRow>[] = [
  { field: 'label', label: '', width: '20%' },
  numberColumn('bestF', 'BEST · F'),
  numberColumn('bestM', 'BEST · M'),
  numberColumn('lowF', 'LOW · F'),
  numberColumn('lowM', 'LOW · M'),
];

// warnings shown under the table while something can't be saved
function DisciplineWarnings({ rows }: { rows: DisciplineRow[] }) {
  const brokenRows = rows.filter(disciplineHasLowAboveBest);
  return (
    <>
      {brokenRows.length > 0 && (
        <Alert severity="warning">
          {brokenRows.map((row) => row.label).join(', ')}: Low can&apos;t be
          higher than Best guess.
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

export default function DisciplineTable({
  disciplines,
  onChange,
}: DisciplineTableProps) {
  const card = useGridCard<DisciplineRow>({
    initialRows: disciplines.rows,
    // never called, this table has no add button
    createRow: () => disciplines.rows[0],
    isValid: (rows) =>
      allWholeCounts(rows, COUNT_FIELDS) &&
      !rows.some(disciplineHasLowAboveBest),
    onSave: (rows) => onChange({ ...disciplines, rows }),
  });

  return (
    <GridCard
      title="Discipline breakdown"
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
          onRowsChange={(rows) => card.setRows(withDisciplineLabels(rows))}
          onValidationChange={card.setHasCellError}
          allowDelete={false}
        />
        <TotalRow rows={card.rows} columns={columns} />
      </div>
      <DisciplineWarnings rows={card.rows} />
      <NotesBox
        id="discipline-notes"
        value={disciplines.notes}
        onSave={(notes) => onChange({ ...disciplines, notes })}
      />
    </GridCard>
  );
}
