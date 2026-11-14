// AI contribution: 50% or more AI-generated
import { MAX_NOTES_LENGTH, UUID_PATTERN } from './teamSizeDbMapping';
import {
  MEDAL_POTENTIAL_OPTIONS,
  MedalPotential,
  MedalRow,
} from './teamSizeGridLogic';

// one athlete's game_members row with the name from members
export type AthleteGameMember = {
  id: string;
  event: string | null;
  medal: string | null;
  medalNotes: string | null;
  member: { firstName: string; lastName: string };
};

// the 3 columns the medal table saves in game_members
export type MedalRowData = {
  id: string;
  event: string | null;
  medal: string | null;
  medalNotes: string | null;
};

const MEDAL_VALUES = MEDAL_POTENTIAL_OPTIONS.map((option) => option.value);

const isMedalPotential = (value: unknown): value is MedalPotential =>
  value === '' || MEDAL_VALUES.includes(value as string);

const isShortText = (value: unknown) =>
  typeof value === 'string' && value.length <= MAX_NOTES_LENGTH;

// 'abc' -> 'abc', '  ' -> null
const textOrNull = (value: string) => (value.trim() === '' ? null : value);

// game_members rows -> table rows, an unknown medal shows as empty
export function dbToMedalRows(athletes: AthleteGameMember[]): MedalRow[] {
  return athletes.map((athlete) => ({
    id: athlete.id,
    firstName: athlete.member.firstName,
    lastName: athlete.member.lastName,
    event: athlete.event ?? '',
    medalPotential: isMedalPotential(athlete.medal) ? athlete.medal : '',
    notes: athlete.medalNotes ?? '',
  }));
}

// table rows -> the columns to save, names are not saved here
export function medalRowsToDb(rows: MedalRow[]): MedalRowData[] {
  return rows.map((row) => ({
    id: row.id,
    event: textOrNull(row.event),
    medal: textOrNull(row.medalPotential),
    medalNotes: textOrNull(row.notes),
  }));
}

// checks the data from the browser before saving
export function hasMedalRowsShape(rows: unknown): rows is MedalRow[] {
  if (!Array.isArray(rows)) return false;
  return rows.every(
    (row) =>
      typeof row === 'object' &&
      row !== null &&
      typeof row.id === 'string' &&
      UUID_PATTERN.test(row.id) &&
      isShortText(row.event) &&
      isMedalPotential(row.medalPotential) &&
      isShortText(row.notes),
  );
}
