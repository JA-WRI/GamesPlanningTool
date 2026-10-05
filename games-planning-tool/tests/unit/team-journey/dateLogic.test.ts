import { describe, it, expect } from 'vitest';
import { ALLOWED_YEAR_RANGE } from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/constants';
import {
  allInvalidParts,
  emptyDate,
  getDateProblem,
  getInvalidParts,
  isEndBeforeStart,
  isInRange,
  noInvalidParts,
  toDate,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/dateLogic';

// years come from constants.ts so the tests still pass next year
const minYear = String(ALLOWED_YEAR_RANGE.min);
const maxYear = String(ALLOWED_YEAR_RANGE.max);
const tooEarlyYear = String(ALLOWED_YEAR_RANGE.min - 1);
const tooLateYear = String(ALLOWED_YEAR_RANGE.max + 1);

// first leap year in the allowed range (there is always one in 10 years)
const leapYear = String(
  Array.from({ length: 11 }, (_, i) => ALLOWED_YEAR_RANGE.min + i).find(
    (year) => new Date(year, 1, 29).getDate() === 29,
  ),
);
// first non leap year in the allowed range
const normalYear = String(
  Array.from({ length: 11 }, (_, i) => ALLOWED_YEAR_RANGE.min + i).find(
    (year) => new Date(year, 1, 29).getDate() !== 29,
  ),
);

function date(day: string, month: string, year: string) {
  return { day, month, year };
}

describe('isInRange', () => {
  it('allows an empty box and a single 0 (user is still typing)', () => {
    expect(isInRange('', 31)).toBe(true);
    expect(isInRange('0', 31)).toBe(true);
  });

  it('allows numbers from 1 to max', () => {
    expect(isInRange('1', 31)).toBe(true);
    expect(isInRange('05', 12)).toBe(true);
    expect(isInRange('31', 31)).toBe(true);
  });

  it('blocks 00 and numbers above max', () => {
    expect(isInRange('00', 31)).toBe(false);
    expect(isInRange('32', 31)).toBe(false);
    expect(isInRange('13', 12)).toBe(false);
  });
});

describe('toDate', () => {
  it('turns a valid date into a Date', () => {
    const result = toDate(date('15', '06', minYear));
    expect(result).not.toBeNull();
    expect(result?.getDate()).toBe(15);
    expect(result?.getMonth()).toBe(5); // months start at 0
    expect(result?.getFullYear()).toBe(ALLOWED_YEAR_RANGE.min);
  });

  it('returns null for an empty or incomplete date', () => {
    expect(toDate(emptyDate)).toBeNull();
    expect(toDate(date('15', '06', '20'))).toBeNull();
    expect(toDate(date('', '06', minYear))).toBeNull();
  });

  it('returns null when the year is out of range', () => {
    expect(toDate(date('15', '06', tooEarlyYear))).toBeNull();
    expect(toDate(date('15', '06', tooLateYear))).toBeNull();
  });

  it('returns null for a day that does not exist', () => {
    expect(toDate(date('31', '04', minYear))).toBeNull();
    expect(toDate(date('29', '02', normalYear))).toBeNull();
  });

  it('accepts 29 February in a leap year', () => {
    expect(toDate(date('29', '02', leapYear))).not.toBeNull();
  });
});

describe('getDateProblem', () => {
  it('returns null for an empty date', () => {
    expect(getDateProblem(emptyDate)).toBeNull();
  });

  it('returns null for a valid date', () => {
    expect(getDateProblem(date('01', '01', minYear))).toBeNull();
  });

  it('accepts the first and last allowed years', () => {
    expect(getDateProblem(date('01', '01', minYear))).toBeNull();
    expect(getDateProblem(date('31', '12', maxYear))).toBeNull();
  });

  it('says "incomplete" when a box is missing or the year is short', () => {
    expect(getDateProblem(date('08', '', ''))).toBe('incomplete');
    expect(getDateProblem(date('08', '07', '20'))).toBe('incomplete');
    expect(getDateProblem(date('', '07', minYear))).toBe('incomplete');
  });

  it('says "yearOutOfRange" just outside the allowed years', () => {
    expect(getDateProblem(date('01', '01', tooEarlyYear))).toBe(
      'yearOutOfRange',
    );
    expect(getDateProblem(date('01', '01', tooLateYear))).toBe(
      'yearOutOfRange',
    );
    expect(getDateProblem(date('01', '01', '1850'))).toBe('yearOutOfRange');
  });

  it('says "impossible" for a date that does not exist', () => {
    expect(getDateProblem(date('31', '02', minYear))).toBe('impossible');
    expect(getDateProblem(date('00', '05', minYear))).toBe('impossible');
    expect(getDateProblem(date('10', '00', minYear))).toBe('impossible');
  });
});

describe('getInvalidParts', () => {
  it('marks nothing for a valid or empty date', () => {
    expect(getInvalidParts(date('01', '01', minYear))).toEqual(noInvalidParts);
    expect(getInvalidParts(emptyDate)).toEqual(noInvalidParts);
  });

  it('marks only the year when it is out of range', () => {
    expect(getInvalidParts(date('01', '01', tooLateYear))).toEqual({
      day: false,
      month: false,
      year: true,
    });
  });

  it('marks the missing boxes of an incomplete date', () => {
    expect(getInvalidParts(date('08', '', '20'))).toEqual({
      day: false,
      month: true,
      year: true,
    });
  });

  it('marks a 00 day or month', () => {
    expect(getInvalidParts(date('00', '05', minYear))).toEqual({
      day: true,
      month: false,
      year: false,
    });
    expect(getInvalidParts(date('10', '00', minYear))).toEqual({
      day: false,
      month: true,
      year: false,
    });
  });

  it('blames the day when every box looks ok (31 / 04)', () => {
    expect(getInvalidParts(date('31', '04', minYear))).toEqual({
      day: true,
      month: false,
      year: false,
    });
  });
});

describe('isEndBeforeStart', () => {
  it('is true when the end date is before the start date', () => {
    expect(
      isEndBeforeStart(date('10', '06', minYear), date('09', '06', minYear)),
    ).toBe(true);
  });

  it('is false when the end date is after the start date', () => {
    expect(
      isEndBeforeStart(date('10', '06', minYear), date('11', '06', minYear)),
    ).toBe(false);
  });

  it('is false when both dates are the same day', () => {
    expect(
      isEndBeforeStart(date('10', '06', minYear), date('10', '06', minYear)),
    ).toBe(false);
  });

  it('is false when one of the dates is empty or invalid', () => {
    expect(isEndBeforeStart(emptyDate, date('10', '06', minYear))).toBe(false);
    expect(isEndBeforeStart(date('10', '06', minYear), emptyDate)).toBe(false);
    expect(
      isEndBeforeStart(date('10', '06', minYear), date('31', '02', minYear)),
    ).toBe(false);
  });
});

describe('invalid parts constants', () => {
  it('has all false / all true helpers', () => {
    expect(noInvalidParts).toEqual({ day: false, month: false, year: false });
    expect(allInvalidParts).toEqual({ day: true, month: true, year: true });
  });
});
