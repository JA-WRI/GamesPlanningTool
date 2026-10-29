import { describe, expect, it } from 'vitest';
import { calculateCostSummary } from '@/app/(application)/[gameId]/[nsoId]/calculator/_components/calculateCostSummary';
import { INITIAL_COST_ROWS } from '@/app/(application)/[gameId]/[nsoId]/calculator/_components/EstimatedCosts';

describe('calculateCostSummary', () => {
  it('aggregates saved budgets by team size and daily cell costs by traveler-days', () => {
    const row = {
      numberOfTeamMembers: 2,
      days: 3,
      accommodationBudget: 750,
      travelBudget: 2400,
      mealsBudget: 118,
      insuranceBudget: 28,
    };
    expect(calculateCostSummary([row], INITIAL_COST_ROWS)).toEqual({
      accommodation: 1500,
      travel: 4800,
      food: 236,
      insurance: 56,
      cellphone: 648,
      clothingPerTraveler: 3200,
      travelers: 2,
      bedNights: 6,
    });
    expect(
      calculateCostSummary(
        [{ ...row, numberOfTeamMembers: 0 }],
        INITIAL_COST_ROWS,
      ).travel,
    ).toBe(0);
    expect(
      calculateCostSummary([{ ...row, travelBudget: 0 }], INITIAL_COST_ROWS)
        .travel,
    ).toBe(0);
  });
});
