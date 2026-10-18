// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { Alert } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import NotesBox from '@/components/commons/NotesBox';
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
  // the rows as the user types, so the warnings update live
  const [liveRows, setLiveRows] = useState(() =>
    disciplinesToGridRows(disciplines.rows),
  );

  return (
    <div className="flex flex-col gap-3">
      <BaseGridPage
        title="Discipline breakdown"
        columns={columns}
        initialData={disciplinesToGridRows(disciplines.rows)}
        // never called, this table has no add button
        createEmptyRow={() => disciplinesToGridRows(disciplines.rows)[0]}
        isValid={(rows) =>
          allWholeCounts(rows, COUNT_FIELDS) &&
          brokenDisciplines(rows).length === 0
        }
        onSave={(rows) =>
          onChange({ ...disciplines, rows: gridRowsToDisciplines(rows) })
        }
        onRowsChange={setLiveRows}
        showSearch={false}
        allowAddRow={false}
        allowDelete={false}
        fitWidth
      />
      <DisciplineWarnings rows={liveRows} />
      <NotesBox
        id="discipline-notes"
        value={disciplines.notes}
        onSave={(notes) => onChange({ ...disciplines, notes })}
      />
    </div>
  );
}
