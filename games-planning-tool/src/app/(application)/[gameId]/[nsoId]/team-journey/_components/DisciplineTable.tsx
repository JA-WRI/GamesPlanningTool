// AI contribution: 50% or more AI-generated
'use client';

import { Alert } from '@mui/material';
import Grid, { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from './NotesBox';
import TeamSizeCard, { GRID_LOOK, TotalRow } from './TeamSizeCard';
import { useGridCard } from './useGridCard';
import {
  DisciplineBreakdown,
  DisciplineRow,
  MAX_COUNT,
  allWholeCounts,
  disciplineHasLowAboveBest,
  withDisciplineLabels,
} from '../_lib/teamSizeGridLogic';

type DisciplineTableProps = {
  disciplines: DisciplineBreakdown;
  onChange: (disciplines: DisciplineBreakdown) => void;
};

// Best F and Best M are the 2nd and 3rd columns: burgundy header and numbers
const BEST_COLUMNS_LOOK =
  '[&_th:nth-child(2)_span]:text-[#7d1a16]! [&_th:nth-child(3)_span]:text-[#7d1a16]! [&_td:nth-child(2)>span]:text-[#7d1a16]! [&_td:nth-child(3)>span]:text-[#7d1a16]! [&_td:nth-child(2)>span]:font-semibold! [&_td:nth-child(3)>span]:font-semibold!';

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
    initialNotes: disciplines.notes,
    // never called, this table has no add button
    createRow: () => disciplines.rows[0],
    isValid: (rows) =>
      allWholeCounts(rows, COUNT_FIELDS) &&
      !rows.some(disciplineHasLowAboveBest),
    onSave: (rows, notes) => onChange({ rows, notes }),
  });

  return (
    <TeamSizeCard
      title="Discipline breakdown"
      subtitle="Best guess & low estimate"
      isEditing={card.isEditing}
      canSave={card.canSave}
      onEdit={card.edit}
      onCancel={card.cancel}
      onSave={card.save}
    >
      <div className={`${GRID_LOOK} ${BEST_COLUMNS_LOOK} space-y-1`}>
        <Grid
          columns={columns}
          rows={card.rows}
          isEditing={card.isEditing}
          onRowsChange={(rows) => card.setRows(withDisciplineLabels(rows))}
          onValidationChange={card.setHasCellError}
          allowDelete={false}
        />
        <TotalRow rows={card.rows} columns={columns} />
      </div>
      <DisciplineWarnings rows={card.rows} />
      <NotesBox
        id="discipline-notes"
        value={card.notes}
        isEditing={card.isEditing}
        onChange={card.setNotes}
      />
    </TeamSizeCard>
  );
}
