// 50% ai generated code
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Date must use YYYY-MM-DD');
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);

  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    throw new Error('Invalid calendar date');
  }

  return timestamp;
}

export function calculateDaysOnSite(
  checkIn: string,
  checkOut: string,
  today?: string,
): number {
  if (!checkIn && !checkOut) return 0;
  if (!checkIn || !checkOut) {
    throw new Error('Both dates are required');
  }

  const start = parseDate(checkIn);
  const end = parseDate(checkOut);

  if (today && start < parseDate(today)) {
    throw new Error('Check-in cannot be in the past');
  }

  if (end <= start) {
    throw new Error('Check-out must be after check-in');
  }

  return (end - start) / MS_PER_DAY;
}


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
