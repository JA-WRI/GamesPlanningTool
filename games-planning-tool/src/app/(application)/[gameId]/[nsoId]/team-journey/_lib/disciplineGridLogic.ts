// AI contribution: 50% or more AI-generated
import type { ColumnDefinition } from '@/components/commons/Grid';
import {
  DISCIPLINE_LABELS,
  DisciplineId,
  DisciplineRow,
  GridNumber,
  restoreLabels,
} from './teamSizeGridLogic';

export type DisciplineLevel = 'bestF' | 'bestM' | 'lowF' | 'lowM';

// one row per estimate (Best F, Best M, Low F, Low M), one column per discipline
export interface DisciplineGridRow extends Record<string, unknown> {
  id: DisciplineLevel;
  label: string;
  hp: GridNumber;
  ssba: GridNumber;
  ae: GridNumber;
  mo: GridNumber;
  total: number;
}

export const DISCIPLINE_IDS: DisciplineId[] = ['hp', 'ssba', 'ae', 'mo'];

// row names that never change
export const DISCIPLINE_LEVEL_LABELS: Record<DisciplineLevel, string> = {
  bestF: 'Best F',
  bestM: 'Best M',
  lowF: 'Low F',
  lowM: 'Low M',
};

const LEVELS: DisciplineLevel[] = ['bestF', 'bestM', 'lowF', 'lowM'];

// total = HP + SS/BA + AE + MO for each row, empty boxes count as 0
// done in our code because the shared grid's formula only adds 2 fields;
// ====> this can switch to Marwa's formula once it supports more fields
export function withDisciplineTotals(
  rows: DisciplineGridRow[],
): DisciplineGridRow[] {
  return rows.map((row) => ({
    ...row,
    total: DISCIPLINE_IDS.reduce((sum, id) => sum + (Number(row[id]) || 0), 0),
  }));
}

//TEMPORARY until the shared grid's formula supports more than 2 fields
// the real total comes from withDisciplineTotals. making this a formula column
// lets the grid show it bold and read only,like the Team Size total
// 'none' is not a field on the row so the grid reads it as 0: total + 0
// Once the grid allows it, replace with the real formula HP + SS/BA + AE + MO
export const DISCIPLINE_TOTAL_COLUMN: ColumnDefinition<DisciplineGridRow> = {
  field: 'total',
  label: 'TOTAL',
  type: 'calculated',
  formula: { operator: '+', fieldA: 'total', fieldB: 'none' },
  align: 'center',
};

// fixed names for the Best F, Best M, Low F, Low M rows
export function withDisciplineLevelLabels(
  rows: DisciplineGridRow[],
): DisciplineGridRow[] {
  return restoreLabels(rows, DISCIPLINE_LEVEL_LABELS);
}

// saved disciplines -> grid rows, with their totals
export function disciplinesToGridRows(
  disciplines: DisciplineRow[],
): DisciplineGridRow[] {
  const valueFor = (id: DisciplineId, level: DisciplineLevel): GridNumber =>
    disciplines.find((discipline) => discipline.id === id)?.[level] ?? '';
  return withDisciplineTotals(
    LEVELS.map((level) => ({
      id: level,
      label: DISCIPLINE_LEVEL_LABELS[level],
      hp: valueFor('hp', level),
      ssba: valueFor('ssba', level),
      ae: valueFor('ae', level),
      mo: valueFor('mo', level),
      total: 0,
    })),
  );
}

// grid rows -> saved disciplines (the total is never saved)
export function gridRowsToDisciplines(
  rows: DisciplineGridRow[],
): DisciplineRow[] {
  const valueFor = (level: DisciplineLevel, id: DisciplineId): GridNumber =>
    rows.find((row) => row.id === level)?.[id] ?? '';
  return DISCIPLINE_IDS.map((id) => ({
    id,
    label: DISCIPLINE_LABELS[id],
    bestF: valueFor('bestF', id),
    bestM: valueFor('bestM', id),
    lowF: valueFor('lowF', id),
    lowM: valueFor('lowM', id),
  }));
}
