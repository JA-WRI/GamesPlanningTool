// AI contribution: 100% AI-generated
export type TravelerItemDbRow = {
  id: string;
  nsoId: string;
  gameId: string;
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
  nsoId: string;
  gameId: string;
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

const toText = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new Error('Invalid or missing text field.');
  }
  return value;
};

const toNullableText = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') {
    throw new Error('Invalid text field format.');
  }
  return value;
};

// Ensures whole numbers only
const toPositiveInt = (value: unknown): number => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0 || !Number.isFinite(number)) {
    throw new Error('Value must be a valid positive whole number.');
  }
  return number;
};

// Ensures valid numbers
const toPositiveNumber = (value: unknown): number => {
  const number = Number(value);
  if (isNaN(number) || number < 0 || !Number.isFinite(number)) {
    throw new Error('Value must be a valid positive number.');
  }
  return number;
};

export function travelerItemsToDb(
  nsoId: string,
  gameId: string,
  calculatorId: number,
  rows: unknown[],
): TravelerItemDbRow[] {
  return rows.map((value) => {
    const row = asRecord(value);
    return {
      id: toText(row.id),
      nsoId,
      gameId,
      calculatorId,
      category: toText(row.category),
      numberOfTeamMembers: toPositiveInt(row.numberOfTeamMembers),
      days: toPositiveInt(row.days),
      travelBudget: toPositiveNumber(row.travelBudget),
      checkIn: toNullableText(row.checkIn),
      checkOut: toNullableText(row.checkOut),
      accommodationBudget: toPositiveNumber(row.accommodationBudget),
      mealsBudget: toPositiveNumber(row.mealsBudget),
      insuranceBudget: toPositiveNumber(row.insuranceBudget),
      totalCostPerTeamMember: toPositiveNumber(row.totalCostPerTeamMember),
    };
  });
}

export function estimatedCostItemsToDb(
  nsoId: string,
  gameId: string,
  calculatorId: number,
  rows: unknown[],
): EstimatedCostItemDbRow[] {
  return rows.map((value) => {
    const row = asRecord(value);
    return {
      id: toText(row.id),
      nsoId,
      gameId,
      calculatorId,
      category: toText(row.category),
      amount: toPositiveNumber(row.amount),
      unitOfMeasure: toText(row.unitOfMeasure) || 'CAD',
      notes: toNullableText(row.notes),
    };
  });
}
