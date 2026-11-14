// AI contribution: 50% or more AI-generated
import { INITIAL_TEAM_SIZE } from './constants';
import type { TeamSize } from './teamSizeLogic';
import { getAthleteRangeErrors, getMedalsMessage } from './teamSizeLogic';
import {
  DISCIPLINE_LABELS,
  DisciplineBreakdown,
  DisciplineId,
  GridNumber,
  disciplineHasLowAboveBest,
  isWholeCount,
  toGridNumber,
} from './teamSizeGridLogic';
import { DISCIPLINE_IDS } from './disciplineGridLogic';

// one team_size_estimates row, without nso_id and game_id
export type TeamSizeEstimateData = {
  lowFemale: number | null;
  bestGuessFemale: number | null;
  highFemale: number | null;
  lowMale: number | null;
  bestGuessMale: number | null;
  highMale: number | null;
  notes: string;
  disciplineBreakdownNotes: string;
  lowMedals: number | null;
  highMedals: number | null;
};

// one discipline_breakdowns row, without id, nso_id and game_id
export type DisciplineBreakdownData = {
  discipline: DisciplineId;
  bestFemale: number | null;
  bestMale: number | null;
  lowFemale: number | null;
  lowMale: number | null;
};

// what the page needs from the database
export type SavedTeamSize = {
  teamSize: TeamSize;
  disciplines: DisciplineBreakdown;
};

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// url ids -> db ids, null for the fake ids from mock-data ('game_id_1', 'nso_1')
export function toDbIds(
  gameId: string,
  nsoId: string,
): { gameId: number; nsoId: string } | null {
  if (!/^\d+$/.test(gameId) || !UUID_PATTERN.test(nsoId)) return null;
  return { gameId: Number(gameId), nsoId };
}

// '12' -> 12, '' -> null
export function textToDb(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

// 12 -> '12', null -> ''
export function dbToText(value: number | null): string {
  return value === null ? '' : String(value);
}

// 12 -> 12, '' -> null
export function gridNumberToDb(value: GridNumber): number | null {
  return value === '' ? null : value;
}

// 12 -> 12, null -> ''
export function dbToGridNumber(value: number | null): GridNumber {
  return value === null ? '' : value;
}

// longest notes we accept
export const MAX_NOTES_LENGTH = 2000;

const isText = (value: unknown): value is string => typeof value === 'string';

const isNotes = (value: unknown) =>
  isText(value) && value.length <= MAX_NOTES_LENGTH;

const isGridNumber = (value: unknown) =>
  value === '' || typeof value === 'number';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isEstimate = (value: unknown) =>
  isRecord(value) &&
  isText(value.low) &&
  isText(value.bestGuess) &&
  isText(value.high);

// true when the data sent to the server looks like the page data (anyone can call a server function)
export function hasTeamSizeShape(
  teamSize: unknown,
  disciplines: unknown,
): boolean {
  if (!isRecord(teamSize) || !isRecord(disciplines)) return false;
  const { athletes, notes, projectedMedalsLow, projectedMedalsHigh } = teamSize;
  const teamSizeOk =
    isRecord(athletes) &&
    isEstimate(athletes.male) &&
    isEstimate(athletes.female) &&
    isNotes(notes) &&
    isText(projectedMedalsLow) &&
    isText(projectedMedalsHigh);

  const { rows } = disciplines;
  if (!teamSizeOk || !isNotes(disciplines.notes) || !Array.isArray(rows))
    return false;
  // only the 4 known disciplines, each at most once
  const ids = rows.map((row) => (isRecord(row) ? row.id : undefined));
  const knownIds = ids.every((id) =>
    DISCIPLINE_IDS.includes(id as DisciplineId),
  );
  return (
    knownIds &&
    new Set(ids).size === ids.length &&
    rows.every(
      (row) =>
        isGridNumber(row.bestF) &&
        isGridNumber(row.bestM) &&
        isGridNumber(row.lowF) &&
        isGridNumber(row.lowM),
    )
  );
}

// same rules as the page, checked again before saving
export function isTeamSizeSavable(
  teamSize: TeamSize,
  disciplines: DisciplineBreakdown,
): boolean {
  const { male, female } = teamSize.athletes;
  const texts = [
    ...Object.values(male),
    ...Object.values(female),
    teamSize.projectedMedalsLow,
    teamSize.projectedMedalsHigh,
  ];
  const disciplineCounts = disciplines.rows.flatMap((row) => [
    row.bestF,
    row.bestM,
    row.lowF,
    row.lowM,
  ]);
  const hasRangeError = [male, female].some((estimate) =>
    Object.values(getAthleteRangeErrors(estimate)).some(Boolean),
  );
  return (
    texts.every((text) => isWholeCount(toGridNumber(text))) &&
    disciplineCounts.every(isWholeCount) &&
    !hasRangeError &&
    getMedalsMessage(
      teamSize.projectedMedalsLow,
      teamSize.projectedMedalsHigh,
    ) === null &&
    !disciplines.rows.some(disciplineHasLowAboveBest)
  );
}

// page data -> team_size_estimates row
export function teamSizeToDb(
  teamSize: TeamSize,
  disciplines: DisciplineBreakdown,
): TeamSizeEstimateData {
  const { male, female } = teamSize.athletes;
  return {
    lowFemale: textToDb(female.low),
    bestGuessFemale: textToDb(female.bestGuess),
    highFemale: textToDb(female.high),
    lowMale: textToDb(male.low),
    bestGuessMale: textToDb(male.bestGuess),
    highMale: textToDb(male.high),
    notes: teamSize.notes,
    disciplineBreakdownNotes: disciplines.notes,
    lowMedals: textToDb(teamSize.projectedMedalsLow),
    highMedals: textToDb(teamSize.projectedMedalsHigh),
  };
}

// team_size_estimates row -> page data (nothing saved yet = empty page)
export function dbToTeamSize(row: TeamSizeEstimateData | null): TeamSize {
  if (!row) return INITIAL_TEAM_SIZE;
  return {
    ...INITIAL_TEAM_SIZE,
    athletes: {
      male: {
        low: dbToText(row.lowMale),
        bestGuess: dbToText(row.bestGuessMale),
        high: dbToText(row.highMale),
      },
      female: {
        low: dbToText(row.lowFemale),
        bestGuess: dbToText(row.bestGuessFemale),
        high: dbToText(row.highFemale),
      },
    },
    notes: row.notes,
    projectedMedalsLow: dbToText(row.lowMedals),
    projectedMedalsHigh: dbToText(row.highMedals),
  };
}

// page discipline rows -> discipline_breakdowns rows
export function disciplinesToDb(
  disciplines: DisciplineBreakdown,
): DisciplineBreakdownData[] {
  return disciplines.rows.map((row) => ({
    discipline: row.id,
    bestFemale: gridNumberToDb(row.bestF),
    bestMale: gridNumberToDb(row.bestM),
    lowFemale: gridNumberToDb(row.lowF),
    lowMale: gridNumberToDb(row.lowM),
  }));
}

// discipline_breakdowns rows -> page data, always HP, SS/BA, AE, MO in order
export function dbToDisciplines(
  rows: DisciplineBreakdownData[],
  notes: string,
): DisciplineBreakdown {
  return {
    rows: DISCIPLINE_IDS.map((id) => {
      const saved = rows.find((row) => row.discipline === id);
      return {
        id,
        label: DISCIPLINE_LABELS[id],
        bestF: dbToGridNumber(saved?.bestFemale ?? null),
        bestM: dbToGridNumber(saved?.bestMale ?? null),
        lowF: dbToGridNumber(saved?.lowFemale ?? null),
        lowM: dbToGridNumber(saved?.lowMale ?? null),
      };
    }),
    notes,
  };
}
