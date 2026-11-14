// I used AI to accelerate the process and fill hardcoded data (50%)

import type { CostSummaryData } from './CostSummary';
import type { EstimatedCostRow } from './EstimatedCosts';

type SummaryInput = {
  numberOfTeamMembers: number;
  days: number;
  accommodationBudget: number;
  travelBudget: number;
  mealsBudget: number;
  insuranceBudget: number;
};

// Inputs and output amounts are CAD. Budget fields are per-person trip totals.
export function calculateCostSummary(
  rows: SummaryInput[],
  costs: EstimatedCostRow[],
): CostSummaryData {
  const amount = (id: string) =>
    Number(costs.find((cost) => cost.id === id)?.amount) || 0;
  const sumBudget = (
    field:
      | 'accommodationBudget'
      | 'travelBudget'
      | 'mealsBudget'
      | 'insuranceBudget',
  ) =>
    rows.reduce(
      (sum, row) => sum + Number(row.numberOfTeamMembers) * Number(row[field]),
      0,
    );
  const travelers = rows.reduce(
    (sum, row) => sum + Number(row.numberOfTeamMembers),
    0,
  );
  const bedNights = rows.reduce(
    (sum, row) => sum + Number(row.numberOfTeamMembers) * Number(row.days),
    0,
  );
  return {
    accommodation: sumBudget('accommodationBudget'),
    travel: sumBudget('travelBudget'),
    food: sumBudget('mealsBudget'),
    insurance: sumBudget('insuranceBudget'),
    cellphone: bedNights * amount('cellphone'),
    clothingPerTraveler: amount('clothingPackage'),
    travelers,
    bedNights,
  };
}
