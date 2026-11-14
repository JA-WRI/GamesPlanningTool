// 80% ai generated
import type { getCalculatorData } from '@/lib/calculator';
import type { CalculatorRow } from '../components/CalculatorContent';
import {
  calculateDaysOnSite,
  calculateTotalCostPerMember,
} from '../utils/calculations';
type CalculatorData = NonNullable<
  Awaited<ReturnType<typeof getCalculatorData>>
>;
export function dbTravelerToRow(
  traveler: CalculatorData['travelers'][number],
): CalculatorRow {
  return calculateTravelerRow({
    id: String(traveler.id),
    category: traveler.travelerCategory.name,
    numberOfTeamMembers: traveler.numberOfTeamMembers,
    days: traveler.days,
    travelBudget: traveler.travelCostInCents / 100,
    checkIn: traveler.checkInDate
      ? new Date(traveler.checkInDate).toISOString().slice(0, 10)
      : '',
    checkOut: traveler.checkOutDate
      ? new Date(traveler.checkOutDate).toISOString().slice(0, 10)
      : '',
    accommodationBudget: traveler.accommodationCostInCents / 100,
    mealsBudget: traveler.mealsCostInCents / 100,
    insuranceBudget: traveler.insuranceCostInCents / 100,
    totalCostPerTeamMember: 0,
  });
}

function calculateTravelerRow(row: CalculatorRow): CalculatorRow {
  const days = calculateDaysOnSite(row.checkIn, row.checkOut);

  return {
    ...row,
    days,
    totalCostPerTeamMember: calculateTotalCostPerMember(
      row.travelBudget,
      row.accommodationBudget,
      days,
      row.mealsBudget,
      row.insuranceBudget,
    ),
  };
}
