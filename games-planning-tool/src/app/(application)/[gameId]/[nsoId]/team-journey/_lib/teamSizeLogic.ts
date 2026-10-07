// 65% AI generated to write the team size calculations
import { onlyDigits } from './utils';

export type AthleteEstimate = {
  low: string;
  bestGuess: string;
  high: string;
};

export type TeamSize = {
  athletes: {
    male: AthleteEstimate;
    female: AthleteEstimate;
  };
  staff: string;
  notes: string;
  projectedMedalsLow: string;
  projectedMedalsHigh: string;
};

export type AthleteTotals = {
  low: number;
  bestGuess: number;
  high: number;
};

// empty box counts as 0
export function toNumber(value: string) {
  return Number(value || 0);
}

// male + female for each column
export function getAthleteTotals(
  athletes: TeamSize['athletes'],
): AthleteTotals {
  const { male, female } = athletes;
  return {
    low: toNumber(male.low) + toNumber(female.low),
    bestGuess: toNumber(male.bestGuess) + toNumber(female.bestGuess),
    high: toNumber(male.high) + toNumber(female.high),
  };
}

// athletes (best guess) + staff
export function getTotalTeamSize(teamSize: TeamSize) {
  return (
    getAthleteTotals(teamSize.athletes).bestGuess + toNumber(teamSize.staff)
  );
}

// Low ≤ Best ≤ High
export function getAthleteRangeErrors(estimate: AthleteEstimate) {
  const lowIsInvalid =
    estimate.low !== '' &&
    estimate.bestGuess !== '' &&
    toNumber(estimate.low) > toNumber(estimate.bestGuess);
  const bestIsInvalid =
    estimate.bestGuess !== '' &&
    estimate.high !== '' &&
    toNumber(estimate.bestGuess) > toNumber(estimate.high);
  // still checks Low ≤ High when Best is empty
  const rangeIsInvalid =
    estimate.low !== '' &&
    estimate.high !== '' &&
    toNumber(estimate.low) > toNumber(estimate.high);
  return { lowIsInvalid, bestIsInvalid, rangeIsInvalid };
}

// medals High ≥ Low
export function getMedalsMessage(low: string, high: string) {
  if (low === '' || high === '') return null;
  if (toNumber(high) < toNumber(low))
    return 'High estimate must be greater than or equal to low estimate.';
  return null;
}

// "2 – 5" empty boxes show as 0
export function formatMedalRange(low: string, high: string) {
  return `${low || '0'} – ${high || '0'}`;
}

// change one athlete box (digits only)
export function updateAthleteField(
  teamSize: TeamSize,
  key: 'male' | 'female',
  field: keyof AthleteEstimate,
  value: string,
): TeamSize {
  return {
    ...teamSize,
    athletes: {
      ...teamSize.athletes,
      [key]: {
        ...teamSize.athletes[key],
        [field]: onlyDigits(value),
      },
    },
  };
}
