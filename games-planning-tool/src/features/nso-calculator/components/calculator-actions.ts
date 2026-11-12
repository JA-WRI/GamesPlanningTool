// No Substantial AI contribution
'use server';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import {
  hasUniqueRowIds,
  replaceCollection,
  runDraftSave,
} from '@/lib/db-helpers';
import {
  estimatedCostItemsToDb,
  travelerItemsToDb,
} from '../lib/calculatorDbMapping';

export async function getTravelerItems(
  nsoId: string,
  gameId: string,
  calculatorId: number,
) {
  const records = await prisma.calculatorTravelerItem.findMany({
    where: { nsoId, gameId, calculatorId },
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

export async function saveTravelerItems(
  nsoId: string,
  gameId: string,
  calculatorId: number,
  rows: unknown[],
) {
  const outcome = await runDraftSave(rows, {
    validate: hasUniqueRowIds,
    map: (draft) => travelerItemsToDb(nsoId, gameId, calculatorId, draft),
    persist: async (mappedRows) => {
      await replaceCollection(
        (operation) => prisma.$transaction(operation),
        (tx: Prisma.TransactionClient) => tx.calculatorTravelerItem,
        { nsoId, gameId, calculatorId },
        mappedRows,
      );
      return getTravelerItems(nsoId, gameId, calculatorId);
    },
  });

  if (!outcome.ok) throw new Error('Invalid traveler-item draft.');
  return outcome.value;
}

export async function getEstimatedCostItems(
  nsoId: string,
  gameId: string,
  calculatorId: number,
) {
  const records = await prisma.calculatorEstimatedCostItem.findMany({
    where: { nsoId, gameId, calculatorId },
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
  nsoId: string,
  gameId: string,
  calculatorId: number,
  rows: unknown[],
) {
  const outcome = await runDraftSave(rows, {
    validate: hasUniqueRowIds,
    map: (draft) => estimatedCostItemsToDb(nsoId, gameId, calculatorId, draft),
    persist: async (mappedRows) => {
      await replaceCollection(
        (operation) => prisma.$transaction(operation),
        (tx: Prisma.TransactionClient) => tx.calculatorEstimatedCostItem,
        { nsoId, gameId, calculatorId },
        mappedRows,
      );
      return getEstimatedCostItems(nsoId, gameId, calculatorId);
    },
  });

  if (!outcome.ok) throw new Error('Invalid estimated-cost draft.');
  return outcome.value;
}
