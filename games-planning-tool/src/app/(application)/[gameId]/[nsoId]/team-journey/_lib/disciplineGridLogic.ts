// AI contribution: 50% or more AI-generated
import type { ColumnDefinition } from '@/components/commons/Grid';
import {
  DISCIPLINE_LABELS,
  DisciplineId,
  DisciplineRow,
  GridNumber,
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

// HP + SS/BA + AE + MO for one row, empty boxes count as 0
export function disciplineTotal(row: DisciplineGridRow): number {
  return DISCIPLINE_IDS.reduce((sum, id) => sum + (Number(row[id]) || 0), 0);
}

// the shared grid works out the total itself, bold and read-only
export const DISCIPLINE_TOTAL_COLUMN: ColumnDefinition<DisciplineGridRow> = {
  field: 'total',
  label: 'TOTAL',
  type: 'calculated',
  formula: { evaluate: disciplineTotal },
  align: 'center',
};

// saved disciplines -> grid rows
export function disciplinesToGridRows(
  disciplines: DisciplineRow[],
): DisciplineGridRow[] {
  const valueFor = (id: DisciplineId, level: DisciplineLevel): GridNumber =>
    disciplines.find((discipline) => discipline.id === id)?.[level] ?? '';
  return LEVELS.map((level) => ({
    id: level,
    label: DISCIPLINE_LEVEL_LABELS[level],
    hp: valueFor('hp', level),
    ssba: valueFor('ssba', level),
    ae: valueFor('ae', level),
    mo: valueFor('mo', level),
  }));
}

// grid rows -> saved disciplines
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
