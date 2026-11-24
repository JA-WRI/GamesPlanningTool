// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  allowedDays,
  findPeriodError,
  formatDay,
  parseDay,
  parsePeriodInput,
  periodsOverlap,
} from '@/features/accreditation/lib/accreditationPeriodLogic';

const day = (value: string) => new Date(`${value}T00:00:00Z`);
const range = (start: string, end: string) => ({
  start: day(start),
  end: day(end),
});

const GAMES = range('2028-07-14', '2028-07-30');
const MEMBER_ID = '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b';
const HOTEL_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';

describe('parseDay', () => {
  it('reads a real day', () => {
    expect(parseDay('2028-07-14')).toEqual(day('2028-07-14'));
  });

  it('refuses anything that is not a real day', () => {
    for (const value of [
      '2028-02-30',
      '2028-7-14',
      '14/07/2028',
      '',
      5,
      null,
    ]) {
      expect(parseDay(value)).toBeNull();
    }
  });
});

describe('formatDay', () => {
  it('turns a day back into YYYY-MM-DD', () => {
    expect(formatDay(day('2028-07-14'))).toBe('2028-07-14');
  });
});

describe('parsePeriodInput', () => {
  const input = {
    gameMemberId: MEMBER_ID,
    propertyId: HOTEL_ID,
    startDate: '2028-07-14',
    endDate: '2028-07-20',
    status: 'TENTATIVE',
  };

  it('reads a valid period', () => {
    expect(parsePeriodInput(input)).toEqual({
      gameMemberId: MEMBER_ID,
      propertyId: HOTEL_ID,
      start: day('2028-07-14'),
      end: day('2028-07-20'),
      status: 'TENTATIVE',
    });
  });

  it('uses CONFIRMED when no status is sent', () => {
    expect(parsePeriodInput({ ...input, status: undefined })?.status).toBe(
      'CONFIRMED',
    );
  });

  it('refuses a wrong shape or value', () => {
    for (const bad of [
      null,
      'period',
      { ...input, gameMemberId: 'not-an-id' },
      { ...input, propertyId: undefined },
      { ...input, startDate: '2028-02-30' },
      { ...input, status: 'MAYBE' },
    ]) {
      expect(parsePeriodInput(bad)).toBeNull();
    }
  });
});

describe('periodsOverlap', () => {
  it('finds periods that share a day', () => {
    expect(
      periodsOverlap(
        range('2028-07-14', '2028-07-20'),
        range('2028-07-20', '2028-07-25'),
      ),
    ).toBe(true);
  });

  it('allows back to back periods, like a hotel change', () => {
    expect(
      periodsOverlap(
        range('2028-07-14', '2028-07-20'),
        range('2028-07-21', '2028-07-30'),
      ),
    ).toBe(false);
  });
});

describe('allowedDays', () => {
  it('uses the Games days when the person has no travel dates', () => {
    expect(allowedDays(GAMES, null, null)).toEqual(GAMES);
  });

  it('starts earlier and ends later for early arrivals and late departures', () => {
    expect(allowedDays(GAMES, day('2028-07-11'), day('2028-07-31'))).toEqual(
      range('2028-07-11', '2028-07-31'),
    );
  });

  it('never makes the Games days shorter', () => {
    expect(allowedDays(GAMES, day('2028-07-16'), day('2028-07-25'))).toEqual(
      GAMES,
    );
  });
});

describe('findPeriodError', () => {
  it('accepts a valid period', () => {
    expect(
      findPeriodError(range('2028-07-14', '2028-07-20'), GAMES, []),
    ).toBeNull();
  });

  it('accepts a one day period', () => {
    expect(
      findPeriodError(range('2028-07-14', '2028-07-14'), GAMES, []),
    ).toBeNull();
  });

  it('refuses an end date before the start date', () => {
    expect(findPeriodError(range('2028-07-20', '2028-07-14'), GAMES, [])).toBe(
      'The end date must be on or after the start date.',
    );
  });

  it('refuses dates outside the Games', () => {
    const message = 'The dates must be between 2028-07-14 and 2028-07-30.';
    expect(findPeriodError(range('2028-07-13', '2028-07-20'), GAMES, [])).toBe(
      message,
    );
    expect(findPeriodError(range('2028-07-20', '2028-07-31'), GAMES, [])).toBe(
      message,
    );
  });

  it('refuses a period that overlaps another one of the same person', () => {
    const others = [range('2028-07-18', '2028-07-25')];
    expect(
      findPeriodError(range('2028-07-14', '2028-07-20'), GAMES, others),
    ).toBe('This period overlaps another period for the same person.');
  });

  it('accepts a period right after another one', () => {
    const others = [range('2028-07-14', '2028-07-20')];
    expect(
      findPeriodError(range('2028-07-21', '2028-07-30'), GAMES, others),
    ).toBeNull();
  });
});
