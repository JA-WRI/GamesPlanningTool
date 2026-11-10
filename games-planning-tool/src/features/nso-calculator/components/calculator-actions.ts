// No Substantial AI contribution
'use server';

import { prisma } from '@/lib/prisma';
import {
  hasUniqueRowIds,
  replaceCollection,
  runDraftSave,
} from '@/lib/db-helpers';
import {
  estimatedCostItemsToDb,
  travelerItemsToDb,
} from '../lib/calculatorDbMapping';

export async function getTravelerItems(calculatorId: number) {
  const records = await prisma.calculatorTravelerItem.findMany({
    where: { calculatorId },
    orderBy: { createdAt: 'asc' },
  });

  return records.map((r) => ({
    id: r.id,
    calculatorId: r.calculatorId,
    category: r.category,
    numberOfTeamMembers: r.numberOfTeamMembers,
    days: r.days,
    travelBudget: r.travelBudget,
    checkIn: r.checkIn ?? '',
    checkOut: r.checkOut ?? '',
    accommodationBudget: r.accommodationBudget,
    mealsBudget: r.mealsBudget,
    insuranceBudget: r.insuranceBudget,
    totalCostPerTeamMember: r.totalCostPerTeamMember,
  }));
}

export async function saveTravelerItems(calculatorId: number, rows: unknown[]) {
  const outcome = await runDraftSave(rows, {
    validate: hasUniqueRowIds,
    map: (draft) => travelerItemsToDb(calculatorId, draft),
    persist: async (mappedRows) => {
      await replaceCollection(
        (operation) => prisma.$transaction(operation),
        (tx: any) => tx.calculatorTravelerItem,
        { calculatorId },
        mappedRows,
      );
      return getTravelerItems(calculatorId);
    },
  });

  if (!outcome.ok) throw new Error('Invalid traveler-item draft.');
  return outcome.value;
}

export async function getEstimatedCostItems(calculatorId: number) {
  const records = await prisma.calculatorEstimatedCostItem.findMany({
    where: { calculatorId },
    orderBy: { createdAt: 'asc' },
  });

  return records.map((r) => ({
    id: r.id,
    calculatorId: r.calculatorId,
    category: r.category,
    amount: r.amount,
    unitOfMeasure: r.unitOfMeasure,
    notes: r.notes ?? '',
  }));
}

export async function saveEstimatedCostItems(
  calculatorId: number,
  rows: unknown[],
) {
  const outcome = await runDraftSave(rows, {
    validate: hasUniqueRowIds,
    map: (draft) => estimatedCostItemsToDb(calculatorId, draft),
    persist: async (mappedRows) => {
      await replaceCollection(
        (operation) => prisma.$transaction(operation),
        (tx: any) => tx.calculatorEstimatedCostItem,
        { calculatorId },
        mappedRows,
      );
      return getEstimatedCostItems(calculatorId);
    },
  });

  if (!outcome.ok) throw new Error('Invalid estimated-cost draft.');
  return outcome.value;
}
