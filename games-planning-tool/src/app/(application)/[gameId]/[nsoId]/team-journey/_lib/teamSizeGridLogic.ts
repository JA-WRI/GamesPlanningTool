// AI contribution: Below 50% AI-generated
import type { SelectOption } from '@/components/commons/Grid';
import type { AthleteEstimate, TeamSize } from './teamSizeLogic';
import { getAthleteRangeErrors, getMedalsMessage } from './teamSizeLogic';

// the grid gives a number or '' when the box is empty
export type GridNumber = number | '';

export type EstimateLevel = 'low' | 'bestGuess' | 'high';

// one row per estimate (Low, Best Guess, High), one column per gender
export interface TeamSizeRow extends Record<string, unknown> {
  id: EstimateLevel;
  label: string;
  male: GridNumber;
  female: GridNumber;
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

export interface MedalObjectiveRow extends Record<string, unknown> {
  id: 'medals';
  label: string;
  low: GridNumber;
  high: GridNumber;
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

// row names that never change
export const ESTIMATE_LABELS: Record<EstimateLevel, string> = {
  low: 'Low',
  bestGuess: 'Best Guess',
  high: 'High',
};

const ESTIMATE_LEVELS: EstimateLevel[] = ['low', 'bestGuess', 'high'];

const GENDER_LABELS = { male: 'Male', female: 'Female' } as const;

// discipline names that never change
export const DISCIPLINE_LABELS: Record<DisciplineId, string> = {
  hp: 'HP',
  ssba: 'SS/BA',
  ae: 'AE',
  mo: 'MO',
};

// team size state -> Low, Best Guess and High grid rows
export function athletesToRows(athletes: TeamSize['athletes']): TeamSizeRow[] {
  return ESTIMATE_LEVELS.map((id) => ({
    id,
    label: ESTIMATE_LABELS[id],
    male: toGridNumber(athletes.male[id]),
    female: toGridNumber(athletes.female[id]),
  }));
}

// grid rows -> team size state, numbers back to text for the Review step
export function rowsToAthletes(rows: TeamSizeRow[]): TeamSize['athletes'] {
  const empty = (): AthleteEstimate => ({ low: '', bestGuess: '', high: '' });
  const athletes = { male: empty(), female: empty() };
  rows.forEach((row) => {
    athletes.male[row.id] = toText(row.male);
    athletes.female[row.id] = toText(row.female);
  });
  return athletes;
}

// "Male" and/or "Female" when their Low ≤ Best ≤ High is broken
export function gendersWithRangeError(rows: TeamSizeRow[]): string[] {
  const athletes = rowsToAthletes(rows);
  return (['male', 'female'] as const)
    .filter((gender) => {
      const errors = getAthleteRangeErrors(athletes[gender]);
      return (
        errors.lowIsInvalid || errors.bestIsInvalid || errors.rangeIsInvalid
      );
    })
    .map((gender) => GENDER_LABELS[gender]);
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

// row name that never changes
export const MEDALS_LABEL = 'Projected medals';

// team size state -> the one "Projected medals" grid row
export function medalsToRows(teamSize: TeamSize): MedalObjectiveRow[] {
  return [
    {
      id: 'medals',
      label: MEDALS_LABEL,
      low: toGridNumber(teamSize.projectedMedalsLow),
      high: toGridNumber(teamSize.projectedMedalsHigh),
    },
  ];
}

// grid row -> team size state, numbers back to text for the Review step
export function rowsToMedals(
  rows: MedalObjectiveRow[],
  teamSize: TeamSize,
): TeamSize {
  const [row] = rows;
  if (!row) return teamSize;
  return {
    ...teamSize,
    projectedMedalsLow: toText(row.low),
    projectedMedalsHigh: toText(row.high),
  };
}

// true when Low is above High (empty boxes are not checked)
export function medalRowHasError(row: MedalObjectiveRow): boolean {
  return getMedalsMessage(toText(row.low), toText(row.high)) !== null;
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
