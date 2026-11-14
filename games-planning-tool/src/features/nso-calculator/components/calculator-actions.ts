// 50$ AI generated
'use server';

import { getCalculatorData } from '@/lib/calculator';
import { saveTravelers, saveEstimatedCosts } from '../action';
import type { CalculatorRow } from './CalculatorContent';
import type { EstimatedCostRow } from './EstimatedCosts';
import { dbTravelerToRow } from '../lib/canonicalMapping';

function requireCalculator(calculatorId: number) {
  if (calculatorId !== 1) throw new Error('Unknown calculator');
}

export async function getTravelerItems(
  nsoId: string,
  gameId: string,
  calculatorId: number,
) {
  requireCalculator(calculatorId);
  const data = await getCalculatorData(Number(gameId), nsoId);
  if (!data) throw new Error('Game or NSO not found');
  return data.travelers.map(dbTravelerToRow);
}

export async function saveTravelerItems(
  nsoId: string,
  gameId: string,
  calculatorId: number,
  rows: CalculatorRow[],
) {
  requireCalculator(calculatorId);
  return (await saveTravelers(Number(gameId), nsoId, rows)).map(
    dbTravelerToRow,
  );
}

export async function getEstimatedCostItems(
  nsoId: string,
  gameId: string,
  calculatorId: number,
) {
  requireCalculator(calculatorId);
  const data = await getCalculatorData(Number(gameId), nsoId);
  if (!data) throw new Error('Game or NSO not found');
  return data.estimatedCosts.map((cost) => ({
    id: String(cost.id),
    category: cost.name,
    amount: cost.costInCents / 100,
    unitOfMeasure: cost.unitOfMeasure,
    notes: cost.notes ?? '',
  }));
}

export async function saveEstimatedCostItems(
  nsoId: string,
  gameId: string,
  calculatorId: number,
  rows: EstimatedCostRow[],
) {
  requireCalculator(calculatorId);
  return (await saveEstimatedCosts(Number(gameId), nsoId, rows)).map(
    (cost) => ({
      id: String(cost.id),
      category: cost.name,
      amount: cost.costInCents / 100,
      unitOfMeasure: cost.unitOfMeasure,
      notes: cost.notes ?? '',
    }),
  );
}
