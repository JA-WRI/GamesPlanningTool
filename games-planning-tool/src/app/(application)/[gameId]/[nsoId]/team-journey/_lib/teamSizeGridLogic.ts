// AI contribution: Below 50% AI-generated
import type { SelectOption } from '@/components/commons/Grid';
import type { AthleteEstimate, TeamSize } from './teamSizeLogic';
import { getAthleteRangeErrors } from './teamSizeLogic';

// the grid gives a number or '' when the box is empty
export type GridNumber = number | '';

export interface TeamSizeRow extends Record<string, unknown> {
  id: 'male' | 'female';
  label: string;
  low: GridNumber;
  bestGuess: GridNumber;
  high: GridNumber;
}

export type DisciplineId = 'hp' | 'ssba' | 'ae' | 'mo';

export interface DisciplineRow extends Record<string, unknown> {
  id: DisciplineId;
  label: string;
  bestF: GridNumber;
  bestM: GridNumber;
  lowF: GridNumber;
  lowM: GridNumber;
}

export type DisciplineBreakdown = {
  rows: DisciplineRow[];
  notes: string;
};

export type MedalPotential = '' | 'SP – Method A' | 'SP' | 'MP' | 'LP';

export interface MedalRow extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  event: string;
  medalPotential: MedalPotential;
  notes: string;
}

export const MEDAL_POTENTIAL_OPTIONS: SelectOption[] = [
  { label: 'SP – Method A', value: 'SP – Method A' },
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

// row names that never change
export const ATHLETE_LABELS: Record<TeamSizeRow['id'], string> = {
  male: 'Male',
  female: 'Female',
};

// discipline names that never change
export const DISCIPLINE_LABELS: Record<DisciplineId, string> = {
  hp: 'HP',
  ssba: 'SS/BA',
  ae: 'AE',
  mo: 'MO',
};

// team size state -> Male and Female grid rows
export function athletesToRows(athletes: TeamSize['athletes']): TeamSizeRow[] {
  const toRow = (id: TeamSizeRow['id']): TeamSizeRow => ({
    id,
    label: ATHLETE_LABELS[id],
    low: toGridNumber(athletes[id].low),
    bestGuess: toGridNumber(athletes[id].bestGuess),
    high: toGridNumber(athletes[id].high),
  });
  return [toRow('male'), toRow('female')];
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

// puts the row names back if someone typed over them
function restoreLabels<T extends { id: string; label: string }>(
  rows: T[],
  labels: Record<string, string>,
): T[] {
  return rows.map((row) => ({ ...row, label: labels[row.id] }));
}

// fixed names for the Male/Female rows
export function withFixedLabels(rows: TeamSizeRow[]): TeamSizeRow[] {
  return restoreLabels(rows, ATHLETE_LABELS);
}

// fixed names for the HP, SS/BA, AE, MO rows
export function withDisciplineLabels(rows: DisciplineRow[]): DisciplineRow[] {
  return restoreLabels(rows, DISCIPLINE_LABELS);
}

// biggest number allowed in a count box
export const MAX_COUNT = 999;

// empty, or a whole number from 0 to 999
export function isWholeCount(value: unknown): boolean {
  if (value === '') return true;
  return (
    Number.isInteger(value) && Number(value) >= 0 && Number(value) <= MAX_COUNT
  );
}

// true when every count box in these columns is empty or a whole number
export function allWholeCounts<T extends Record<string, unknown>>(
  rows: T[],
  fields: (keyof T)[],
): boolean {
  return rows.every((row) => fields.every((field) => isWholeCount(row[field])));
}

// true when Low is above Best for women or men (empty boxes are not checked)
export function disciplineHasLowAboveBest(row: DisciplineRow): boolean {
  const lowAbove = (low: GridNumber, best: GridNumber) =>
    low !== '' && best !== '' && low > best;
  return lowAbove(row.lowF, row.bestF) || lowAbove(row.lowM, row.bestM);
}

// true when Low ≤ Best ≤ High is broken
export function rowHasRangeError(row: TeamSizeRow): boolean {
  const { lowIsInvalid, bestIsInvalid, rangeIsInvalid } = getAthleteRangeErrors(
    rowToEstimate(row),
  );
  return lowIsInvalid || bestIsInvalid || rangeIsInvalid;
}

// the shared grid shows "-" for an empty cell, a space keeps the note blank
// (only for showing, never saved)
export function withBlankNotes(rows: MedalRow[]): MedalRow[] {
  return rows.map((row) => (row.notes ? row : { ...row, notes: ' ' }));
}

// athletes missing a first or last name (spaces only count as missing)
export function rowsMissingName(rows: MedalRow[]): MedalRow[] {
  return rows.filter((row) => !row.firstName.trim() || !row.lastName.trim());
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
