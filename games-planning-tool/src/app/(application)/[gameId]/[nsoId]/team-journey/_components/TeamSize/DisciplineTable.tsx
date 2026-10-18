// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from '@/components/commons/NotesBox';
import GridCard from './GridCard';
import { useGridCard } from './useGridCard';
import {
  DisciplineBreakdown,
  MAX_COUNT,
  allWholeCounts,
  disciplineHasLowAboveBest,
} from '../../_lib/teamSizeGridLogic';
import {
  DISCIPLINE_IDS,
  DISCIPLINE_TOTAL_COLUMN,
  DisciplineGridRow,
  disciplinesToGridRows,
  gridRowsToDisciplines,
} from '../../_lib/disciplineGridLogic';

type DisciplineTableProps = {
  disciplines: DisciplineBreakdown;
  onChange: (disciplines: DisciplineBreakdown) => void;
};

const numberColumn = (
  field: keyof DisciplineGridRow,
  label: string,
): ColumnDefinition<DisciplineGridRow> => ({
  field,
  label,
  type: 'number',
  min: 0,
  max: MAX_COUNT,
  align: 'center',
  width: '16%',
});

const COUNT_FIELDS: (keyof DisciplineGridRow)[] = DISCIPLINE_IDS;

const columns: ColumnDefinition<DisciplineGridRow>[] = [
  { field: 'label', label: '', width: '20%', readOnly: true },
  numberColumn('hp', 'HP'),
  numberColumn('ssba', 'SS/BA'),
  numberColumn('ae', 'AE'),
  numberColumn('mo', 'MO'),
  DISCIPLINE_TOTAL_COLUMN,
];

// disciplines where Low is above Best ['HP'...]
const brokenDisciplines = (rows: DisciplineGridRow[]) =>
  gridRowsToDisciplines(rows)
    .filter(disciplineHasLowAboveBest)
    .map((discipline) => discipline.label);

// warnings shown under the table while something can't be saved
function DisciplineWarnings({ rows }: { rows: DisciplineGridRow[] }) {
  const broken = brokenDisciplines(rows);
  return (
    <>
      {broken.length > 0 && (
        <Alert severity="warning">
          {broken.join(', ')}: Low can&apos;t be higher than Best guess.
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
  const card = useGridCard<DisciplineGridRow>({
    initialRows: disciplinesToGridRows(disciplines.rows),
    // never called, this table has no add button
    createRow: () => disciplinesToGridRows(disciplines.rows)[0],
    isValid: (rows) =>
      allWholeCounts(rows, COUNT_FIELDS) &&
      brokenDisciplines(rows).length === 0,
    onSave: (rows) =>
      onChange({ ...disciplines, rows: gridRowsToDisciplines(rows) }),
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
      <DisciplineWarnings rows={card.rows} />
      <NotesBox
        id="discipline-notes"
        value={disciplines.notes}
        onSave={(notes) => onChange({ ...disciplines, notes })}
      />
    </GridCard>
  );
}
