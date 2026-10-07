// 100% AI generated to create unit tests
import { describe, it, expect } from 'vitest';
import { INITIAL_TEAM_SIZE } from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/mockData';
import {
  AthleteEstimate,
  TeamSize,
  formatMedalRange,
  getAthleteRangeErrors,
  getAthleteTotals,
  getMedalsMessage,
  getTotalTeamSize,
  toNumber,
  updateAthleteField,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/teamSizeLogic';

function estimate(
  low: string,
  bestGuess: string,
  high: string,
): AthleteEstimate {
  return { low, bestGuess, high };
}

function teamWith(
  male: AthleteEstimate,
  female: AthleteEstimate,
  staff = '',
): TeamSize {
  return { ...INITIAL_TEAM_SIZE, athletes: { male, female }, staff };
}

describe('toNumber', () => {
  it('turns text into a number', () => {
    expect(toNumber('12')).toBe(12);
    expect(toNumber('007')).toBe(7);
  });

  it('treats an empty box as 0', () => {
    expect(toNumber('')).toBe(0);
    expect(toNumber('0')).toBe(0);
  });
});

describe('getAthleteTotals', () => {
  it('adds male and female for low, best guess and high', () => {
    const team = teamWith(estimate('2', '4', '6'), estimate('1', '3', '5'));
    expect(getAthleteTotals(team.athletes)).toEqual({
      low: 3,
      bestGuess: 7,
      high: 11,
    });
  });

  it('returns all 0 when everything is empty', () => {
    expect(getAthleteTotals(INITIAL_TEAM_SIZE.athletes)).toEqual({
      low: 0,
      bestGuess: 0,
      high: 0,
    });
  });

  it('counts empty boxes as 0 when only some are filled', () => {
    const team = teamWith(estimate('2', '', '6'), estimate('', '3', ''));
    expect(getAthleteTotals(team.athletes)).toEqual({
      low: 2,
      bestGuess: 3,
      high: 6,
    });
  });
});

describe('getTotalTeamSize', () => {
  it('adds athletes best guess and staff', () => {
    const team = teamWith(estimate('', '4', ''), estimate('', '3', ''), '5');
    expect(getTotalTeamSize(team)).toBe(12);
  });

  it('works with no staff', () => {
    const team = teamWith(estimate('', '4', ''), estimate('', '3', ''));
    expect(getTotalTeamSize(team)).toBe(7);
  });

  it('is 0 for an empty team', () => {
    expect(getTotalTeamSize(INITIAL_TEAM_SIZE)).toBe(0);
  });

  it('ignores low and high (only best guess counts)', () => {
    const team = teamWith(estimate('9', '', '9'), estimate('9', '', '9'), '1');
    expect(getTotalTeamSize(team)).toBe(1);
  });
});

describe('getAthleteRangeErrors', () => {
  it('has no errors when Low < Best < High', () => {
    expect(getAthleteRangeErrors(estimate('1', '2', '3'))).toEqual({
      lowIsInvalid: false,
      bestIsInvalid: false,
      rangeIsInvalid: false,
    });
  });

  it('has no errors when the values are equal', () => {
    expect(getAthleteRangeErrors(estimate('5', '5', '5'))).toEqual({
      lowIsInvalid: false,
      bestIsInvalid: false,
      rangeIsInvalid: false,
    });
  });

  it('has no errors with 0 values', () => {
    expect(getAthleteRangeErrors(estimate('0', '0', '0'))).toEqual({
      lowIsInvalid: false,
      bestIsInvalid: false,
      rangeIsInvalid: false,
    });
  });

  it('flags Low when it is bigger than Best', () => {
    expect(getAthleteRangeErrors(estimate('5', '4', '9'))).toEqual({
      lowIsInvalid: true,
      bestIsInvalid: false,
      rangeIsInvalid: false,
    });
  });

  it('flags Best when it is bigger than High', () => {
    expect(getAthleteRangeErrors(estimate('1', '6', '5'))).toEqual({
      lowIsInvalid: false,
      bestIsInvalid: true,
      rangeIsInvalid: false,
    });
  });

  it('flags both when Low > Best > High', () => {
    expect(getAthleteRangeErrors(estimate('9', '5', '1'))).toEqual({
      lowIsInvalid: true,
      bestIsInvalid: true,
      rangeIsInvalid: true,
    });
  });

  it('compares as numbers, not text ("10" > "9")', () => {
    expect(getAthleteRangeErrors(estimate('9', '10', '11'))).toEqual({
      lowIsInvalid: false,
      bestIsInvalid: false,
      rangeIsInvalid: false,
    });
  });

  it('does not check when a box is empty', () => {
    expect(getAthleteRangeErrors(estimate('', '', ''))).toEqual({
      lowIsInvalid: false,
      bestIsInvalid: false,
      rangeIsInvalid: false,
    });
  });

  it('flags Low > High even when Best is empty', () => {
    expect(getAthleteRangeErrors(estimate('9', '', '1'))).toEqual({
      lowIsInvalid: false,
      bestIsInvalid: false,
      rangeIsInvalid: true,
    });
  });

  it('has no range error when Best is empty and Low ≤ High', () => {
    expect(getAthleteRangeErrors(estimate('1', '', '9'))).toEqual({
      lowIsInvalid: false,
      bestIsInvalid: false,
      rangeIsInvalid: false,
    });
  });
});

describe('getMedalsMessage', () => {
  const message =
    'High estimate must be greater than or equal to low estimate.';

  it('returns null when High > Low', () => {
    expect(getMedalsMessage('2', '5')).toBeNull();
  });

  it('returns null when High = Low', () => {
    expect(getMedalsMessage('3', '3')).toBeNull();
    expect(getMedalsMessage('0', '0')).toBeNull();
  });

  it('returns the message when High < Low', () => {
    expect(getMedalsMessage('5', '2')).toBe(message);
    expect(getMedalsMessage('1', '0')).toBe(message);
  });

  it('does not check until both are filled', () => {
    expect(getMedalsMessage('', '')).toBeNull();
    expect(getMedalsMessage('5', '')).toBeNull();
    expect(getMedalsMessage('', '5')).toBeNull();
  });
});

describe('formatMedalRange', () => {
  it('shows low – high', () => {
    expect(formatMedalRange('2', '5')).toBe('2 – 5');
  });

  it('shows 0 for empty boxes', () => {
    expect(formatMedalRange('', '')).toBe('0 – 0');
    expect(formatMedalRange('2', '')).toBe('2 – 0');
    expect(formatMedalRange('', '5')).toBe('0 – 5');
  });
});

describe('updateAthleteField', () => {
  it('changes only the chosen box', () => {
    const result = updateAthleteField(INITIAL_TEAM_SIZE, 'male', 'low', '4');
    expect(result.athletes.male).toEqual(estimate('4', '', ''));
    expect(result.athletes.female).toEqual(INITIAL_TEAM_SIZE.athletes.female);
    expect(result.staff).toBe(INITIAL_TEAM_SIZE.staff);
  });

  it('keeps digits only', () => {
    const result = updateAthleteField(
      INITIAL_TEAM_SIZE,
      'female',
      'high',
      '-1a2',
    );
    expect(result.athletes.female.high).toBe('12');
  });

  it('can clear a box', () => {
    const team = teamWith(estimate('4', '5', '6'), estimate('', '', ''));
    const result = updateAthleteField(team, 'male', 'bestGuess', '');
    expect(result.athletes.male).toEqual(estimate('4', '', '6'));
  });

  it('does not change the original object', () => {
    updateAthleteField(INITIAL_TEAM_SIZE, 'male', 'low', '4');
    expect(INITIAL_TEAM_SIZE.athletes.male.low).toBe('');
  });
});
