// about 50% ai usage
import { describe, expect, it } from 'vitest';
import {
  calculateDaysOnSite,
  calculateTotalCostPerMember,
} from '@/features/nso-calculator/utils/calculations';

describe('calculateDaysOnSite', () => {
  it.each([
    ['2026-11-15', '2026-11-17', 2],
    ['2027-01-30', '2027-02-03', 4],
    ['2026-12-30', '2027-01-03', 4],
    ['2028-02-28', '2028-03-01', 2], // leap year
  ])('calculates %s to %s as %i days', (start, end, days) => {
    expect(calculateDaysOnSite(start, end)).toBe(days);
  });

  it('allows both dates to be blank (before data entry)', () => {
    expect(calculateDaysOnSite('', '')).toBe(0);
  });

  it.each([
    ['2027-05-10', ''],
    ['', '2027-05-15'],
    ['2027-05-15', '2027-05-10'], // backwards
    ['2027-05-10', '2027-05-10'], // no positive stay
    ['2027-02-30', '2027-03-05'], // non-existent day
    ['2027-02-29', '2027-03-02'], // not leap year
    ['2027-13-01', '2027-13-05'], // invalid month
    ['15-11-2027', '17-11-2027'], // invalid format
  ])('rejects invalid date pair %s to %s', (start, end) => {
    expect(() => calculateDaysOnSite(start, end)).toThrow();
  });

  it('rejects a past check-in on a new or edited row', () => {
    expect(() =>
      calculateDaysOnSite('2026-11-08', '2026-11-12', '2026-11-09'),
    ).toThrow(/past/i);
  });

  it('accepts check-in today', () => {
    expect(calculateDaysOnSite('2026-11-09', '2026-11-12', '2026-11-09')).toBe(3);
  });

  it('can still calculate an old saved trip when no today constraint is provided', () => {
    expect(calculateDaysOnSite('2025-11-20', '2025-11-25')).toBe(5);
  });
});

describe('calculateTotalCostPerMember', () => {
  it('computes travel + accommodation x days', () => {
    expect(calculateTotalCostPerMember(2400, 150, 2, 0, 0)).toBe(2700);
  });

  it('includes meals and insurance (one-time totals)', () => {
    expect(calculateTotalCostPerMember(2400, 150, 2, 100, 50)).toBe(2850);
  });

  it('does not multiply travel, meals, or insurance by days', () => {
    expect(calculateTotalCostPerMember(1000, 100, 5, 50, 25)).toBe(1575);
  });

  it('allows all zero values', () => {
    expect(calculateTotalCostPerMember(0, 0, 0, 0, 0)).toBe(0);
  });

  it('rounds monetary totals to cents', () => {
    expect(calculateTotalCostPerMember(10.105, 1.005, 2, 0, 0)).toBe(12.12);
  });

  it.each([
    [-100, 150, 2, 100, 50],
    [2400, -150, 2, 100, 50],
    [2400, 150, -2, 100, 50],
    [2400, 150, 2, -100, 50],
    [2400, 150, 2, 100, -50],
    [Number.NaN, 150, 2, 100, 50],
    [Number.POSITIVE_INFINITY, 150, 2, 100, 50],
  ])('rejects invalid amounts', (travel, accommodation, days, meals, insurance) => {
    expect(() =>
      calculateTotalCostPerMember(travel, accommodation, days, meals, insurance),
    ).toThrow(/invalid/i);
  });
});
