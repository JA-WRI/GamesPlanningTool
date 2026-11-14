import { expect, it, vi } from 'vitest';
import {
  saveEstimatedCosts,
  saveTravelers,
} from '@/features/nso-calculator/action';
import {
  saveEstimatedCostItems,
  saveTravelerItems,
} from '@/features/nso-calculator/components/calculator-actions';
vi.mock('@/features/nso-calculator/action', () => ({
  saveEstimatedCosts: vi.fn(),
  saveTravelers: vi.fn(),
}));
vi.mock('@/lib/calculator', () => ({ getCalculatorData: vi.fn() }));

it('routes draft cost commits through the original cents-based saving action', async () => {
  vi.mocked(saveEstimatedCosts).mockResolvedValue([
    {
      id: 42,
      name: 'Travel',
      costInCents: 13800,
      unitOfMeasure: 'CAD',
      notes: null,
    },
  ] as Awaited<ReturnType<typeof saveEstimatedCosts>>);
  const rows = [
    {
      id: 'temporary',
      category: 'Travel',
      amount: 138,
      unitOfMeasure: 'CAD',
      notes: '',
    },
  ];
  expect(await saveEstimatedCostItems('nso', '7', 1, rows)).toEqual([
    { ...rows[0], id: '42' },
  ]);
  expect(saveEstimatedCosts).toHaveBeenCalledWith(7, 'nso', rows);
});

it('maps saved traveler IDs, dates, cents and calculated totals back to the grid', async () => {
  vi.mocked(saveTravelers).mockResolvedValue([
    {
      id: 9,
      travelerCategory: { name: 'Staff' },
      numberOfTeamMembers: 2,
      days: 3,
      checkInDate: new Date('2030-07-01'),
      checkOutDate: new Date('2030-07-04'),
      travelCostInCents: 10000,
      accommodationCostInCents: 5000,
      mealsCostInCents: 2000,
      insuranceCostInCents: 1000,
    },
  ] as Awaited<ReturnType<typeof saveTravelers>>);
  const saved = await saveTravelerItems('nso', '7', 1, []);
  expect(saveTravelers).toHaveBeenCalledWith(7, 'nso', []);
  expect(saved[0]).toMatchObject({
    id: '9',
    checkIn: '2030-07-01',
    days: 3,
    travelBudget: 100,
    totalCostPerTeamMember: 280,
  });
});
