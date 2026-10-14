//AI contribution:Below 50% AI-generated 
import type { SelectOption } from '@/components/commons/Grid';
import type { AthleteEstimate, TeamSize } from './teamSizeLogic';
import { getAthleteRangeErrors } from './teamSizeLogic';

// the grid gives a numb or '' when the box is empty
export type GridNumber = number | '';

export interface TeamSizeRow extends Record<string, unknown> {
  id: 'male' | 'female';
  label: string;
  low: GridNumber;
  bestGuess: GridNumber;
  high: GridNumber;
}

export interface DisciplineRow extends Record<string, unknown> {
  id: string;
  discipline: string;
  bestF: GridNumber;
  bestM: GridNumber;
  lowF: GridNumber;
  lowM: GridNumber;
}

export type MedalPotential = '' | 'SP' | 'MP' | 'LP';

export interface MedalRow extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  event: string;
  medalPotential: MedalPotential;
  notes: string;
}

export const MEDAL_POTENTIAL_OPTIONS: SelectOption[] = [
  { label: 'SP', value: 'SP' },
  { label: 'MP', value: 'MP' },
  { label: 'LP', value: 'LP' },
];

// '12' -> 12, '' -> ''
export function toGridNumber(value: string): GridNumber {
  return value === '' ? '' : Number(value);
}

// 12 -> '12', '' -> ''
export function toText(value: unknown): string {
  return value === '' || value === undefined ? '' : String(value);
}

// adds one column from top to bottom
export function sumColumn<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
): number {
   // empty boxes count as 0
  return rows.reduce((total, row) => total + (Number(row[field]) || 0), 0); 
}

// team size state -> Male and Female grid rows
export function athletesToRows(athletes: TeamSize['athletes']): TeamSizeRow[] {
  const toRow = (id: 'male' | 'female', label: string): TeamSizeRow => ({
    id,
    label,
    low: toGridNumber(athletes[id].low),
    bestGuess: toGridNumber(athletes[id].bestGuess),
    high: toGridNumber(athletes[id].high),
  });
  return [toRow('male', 'Male'), toRow('female', 'Female')];
}

// one grid row ->values used by teamSizeLogic
export function rowToEstimate(row: TeamSizeRow): AthleteEstimate {
  return {
    low: toText(row.low),
    bestGuess: toText(row.bestGuess),
    high: toText(row.high),
  };
}

// grid rows -> team size state 
export function rowsToAthletes(
  rows: TeamSizeRow[],
  current: TeamSize['athletes'],
): TeamSize['athletes'] {
  const athletes = { ...current };
  rows.forEach((row) => {
    athletes[row.id] = rowToEstimate(row);
  });
  return athletes;
}

// true when Low ≤ Best ≤ High is broken
export function rowHasRangeError(row: TeamSizeRow): boolean {
  const { lowIsInvalid, bestIsInvalid, rangeIsInvalid } = getAthleteRangeErrors(
    rowToEstimate(row),
  );
  return lowIsInvalid || bestIsInvalid || rangeIsInvalid;
}

// Makes a blank athlete row with a new id for "Add athlete"
export function createEmptyMedalRow(): MedalRow {
  return {
    id: crypto.randomUUID(),
    firstName: '',
    lastName: '',
    event: '',
    medalPotential: '',
    notes: '',
  };
}
