// AI contribution: 100% AI-generated
export type TravelerItemDbRow = {
  id: string;
  calculatorId: number;
  category: string;
  numberOfTeamMembers: number;
  days: number;
  travelBudget: number;
  checkIn: string | null;
  checkOut: string | null;
  accommodationBudget: number;
  mealsBudget: number;
  insuranceBudget: number;
  totalCostPerTeamMember: number;
};

export type EstimatedCostItemDbRow = {
  id: string;
  calculatorId: number;
  category: string;
  amount: number;
  unitOfMeasure: string;
  notes: string | null;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};

const toNumber = (value: unknown): number => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toText = (value: unknown): string =>
  typeof value === 'string' ? value : '';

const toNullableText = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

export function travelerItemsToDb(
  calculatorId: number,
  rows: unknown[],
): TravelerItemDbRow[] {
  return rows.map((value) => {
    const row = asRecord(value);
    return {
      id: toText(row.id),
      calculatorId,
      category: toText(row.category),
      numberOfTeamMembers: toNumber(row.numberOfTeamMembers),
      days: toNumber(row.days),
      travelBudget: toNumber(row.travelBudget),
      checkIn: toNullableText(row.checkIn),
      checkOut: toNullableText(row.checkOut),
      accommodationBudget: toNumber(row.accommodationBudget),
      mealsBudget: toNumber(row.mealsBudget),
      insuranceBudget: toNumber(row.insuranceBudget),
      totalCostPerTeamMember: toNumber(row.totalCostPerTeamMember),
    };
  });
}

export function estimatedCostItemsToDb(
  calculatorId: number,
  rows: unknown[],
): EstimatedCostItemDbRow[] {
  return rows.map((value) => {
    const row = asRecord(value);
    return {
      id: toText(row.id),
      calculatorId,
      category: toText(row.category),
      amount: toNumber(row.amount),
      unitOfMeasure: toText(row.unitOfMeasure) || 'CAD',
      notes: toNullableText(row.notes),
    };
  });
}
