// AI contribution: 100% AI-generated
import { describe, expect, it } from 'vitest';
import {
  estimatedCostItemsToDb,
  travelerItemsToDb,
} from '@/features/nso-calculator/lib/calculatorDbMapping';

describe('travelerItemsToDb', () => {
  it('maps supported traveler fields and normalizes optional text', () => {
    expect(
      travelerItemsToDb('nso-1', '5', 9, [
        {
          id: 'traveler-1',
          category: 'Athlete',
          numberOfTeamMembers: '12',
          days: 5,
          travelBudget: '1350.5',
          checkIn: '',
          checkOut: '2030-07-12',
          accommodationBudget: 600,
          mealsBudget: 125,
          insuranceBudget: 40,
          totalCostPerTeamMember: 2115.5,
          ignoredClientField: 'not persisted',
        },
      ]),
    ).toEqual([
      {
        id: 'traveler-1',
        nsoId: 'nso-1',
        gameId: '5',
        calculatorId: 9,
        category: 'Athlete',
        numberOfTeamMembers: 12,
        days: 5,
        travelBudget: 1350.5,
        checkIn: null,
        checkOut: '2030-07-12',
        accommodationBudget: 600,
        mealsBudget: 125,
        insuranceBudget: 40,
        totalCostPerTeamMember: 2115.5,
      },
    ]);
  });

  it('rejects malformed records and invalid whole numbers', () => {
    expect(() => travelerItemsToDb('nso-1', '5', 3, [null])).toThrow(
      'Invalid or missing text field.',
    );
    expect(() =>
      travelerItemsToDb('nso-1', '5', 3, [
        { id: 'traveler-1', category: 'Athlete', numberOfTeamMembers: 'NaN' },
      ]),
    ).toThrow('Value must be a valid positive whole number.');
  });
});

describe('estimatedCostItemsToDb', () => {
  it('maps amounts, supplies CAD for a blank unit, and converts blank notes to null', () => {
    expect(
      estimatedCostItemsToDb('nso-1', '5', 4, [
        {
          id: 'cost-1',
          category: 'Meals',
          amount: '58.25',
          unitOfMeasure: '',
          notes: '',
        },
      ]),
    ).toEqual([
      {
        id: 'cost-1',
        nsoId: 'nso-1',
        gameId: '5',
        calculatorId: 4,
        category: 'Meals',
        amount: 58.25,
        unitOfMeasure: 'CAD',
        notes: null,
      },
    ]);
  });

  it('preserves explicit units and rejects invalid amounts', () => {
    expect(
      estimatedCostItemsToDb('nso-1', '5', 4, [
        {
          id: 'cost-2',
          category: 'Meals',
          amount: 10,
          unitOfMeasure: 'EUR',
          notes: 'estimate',
        },
      ]),
    ).toEqual([
      {
        id: 'cost-2',
        nsoId: 'nso-1',
        gameId: '5',
        calculatorId: 4,
        category: 'Meals',
        amount: 10,
        unitOfMeasure: 'EUR',
        notes: 'estimate',
      },
    ]);
    expect(() =>
      estimatedCostItemsToDb('nso-1', '5', 4, [
        {
          id: 'cost-2',
          category: 'Meals',
          amount: Number.POSITIVE_INFINITY,
          unitOfMeasure: 'EUR',
        },
      ]),
    ).toThrow('Value must be a valid positive number.');
  });
});
