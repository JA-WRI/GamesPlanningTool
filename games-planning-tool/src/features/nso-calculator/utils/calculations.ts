// No AI
export function calculateTotalCostPerMember(
  travelBudget: number,
  accommodationBudget: number,
  daysOnSite: number,
  mealsBudget: number,
  insuranceBudget: number,
): number {
  const values = [
    travelBudget,
    accommodationBudget,
    daysOnSite,
    mealsBudget,
    insuranceBudget,
  ];

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Invalid calculator values');
  }

  const total =
    travelBudget +
    accommodationBudget * daysOnSite +
    mealsBudget +
    insuranceBudget;

  return Math.round(total * 100) / 100;
}
