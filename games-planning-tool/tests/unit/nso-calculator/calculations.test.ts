// about 50% ai usage
import { describe, expect, it } from 'vitest';
import { calculateTotalCostPerMember } from '@/features/nso-calculator/utils/calculations';

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
  ])(
    'rejects invalid amounts',
    (travel, accommodation, days, meals, insurance) => {
      expect(() =>
        calculateTotalCostPerMember(
          travel,
          accommodation,
          days,
          meals,
          insurance,
        ),
      ).toThrow(/invalid/i);
    },
  );
});
