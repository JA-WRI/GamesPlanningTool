// AI contribution: 100% AI-generated
import { describe, expect, it } from 'vitest';
import {
  estimatedCostItemsToDb,
  travelerItemsToDb,
} from '@/features/nso-calculator/lib/calculatorDbMapping';

describe('travelerItemsToDb', () => {
  it('maps supported traveler fields and normalizes optional text', () => {
    expect(
      travelerItemsToDb(9, [
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

  it('defaults malformed records and non-finite numbers safely', () => {
    expect(
      travelerItemsToDb(3, [null, { id: 4, category: null, days: 'NaN' }]),
    ).toEqual([
      {
        id: '',
        calculatorId: 3,
        category: '',
        numberOfTeamMembers: 0,
        days: 0,
        travelBudget: 0,
        checkIn: null,
        checkOut: null,
        accommodationBudget: 0,
        mealsBudget: 0,
        insuranceBudget: 0,
        totalCostPerTeamMember: 0,
      },
      {
        id: '',
        calculatorId: 3,
        category: '',
        numberOfTeamMembers: 0,
        days: 0,
        travelBudget: 0,
        checkIn: null,
        checkOut: null,
        accommodationBudget: 0,
        mealsBudget: 0,
        insuranceBudget: 0,
        totalCostPerTeamMember: 0,
      },
    ]);
  });
});

describe('estimatedCostItemsToDb', () => {
  it('maps amounts, supplies CAD when unit is missing, and converts blank notes to null', () => {
    expect(
      estimatedCostItemsToDb(4, [
        { id: 'cost-1', category: 'Meals', amount: '58.25', notes: '' },
      ]),
    ).toEqual([
      {
        id: 'cost-1',
        calculatorId: 4,
        category: 'Meals',
        amount: 58.25,
        unitOfMeasure: 'CAD',
        notes: null,
      },
    ]);
  });

  it('preserves explicit units and maps invalid amounts to zero', () => {
    expect(
      estimatedCostItemsToDb(4, [
        {
          id: 'cost-2',
          amount: Number.POSITIVE_INFINITY,
          unitOfMeasure: 'EUR',
          notes: 'estimate',
        },
      ]),
    ).toEqual([
      {
        id: 'cost-2',
        calculatorId: 4,
        category: '',
        amount: 0,
        unitOfMeasure: 'EUR',
        notes: 'estimate',
      },
    ]);
  });
});
