// No Substantial AI contribution
'use server';

import { prisma } from '@/lib/prisma';
import { genericSave } from '@/lib/db-helpers';

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

export async function saveTravelerItems(calculatorId: number, rows: any[]) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const payload = safeRows.map((row) => ({
    id: row.id,
    calculatorId,
    category: row.category ?? '',
    numberOfTeamMembers: Number(row.numberOfTeamMembers) || 0,
    days: Number(row.days) || 0,
    travelBudget: Number(row.travelBudget) || 0,
    checkIn: row.checkIn || null,
    checkOut: row.checkOut || null,
    accommodationBudget: Number(row.accommodationBudget) || 0,
    mealsBudget: Number(row.mealsBudget) || 0,
    insuranceBudget: Number(row.insuranceBudget) || 0,
    totalCostPerTeamMember: Number(row.totalCostPerTeamMember) || 0,
  }));

  await genericSave(prisma.calculatorTravelerItem, payload);
  return getTravelerItems(calculatorId);
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
  rows: any[],
) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const keepIds = safeRows.map((row) => row.id).filter(Boolean);

  await prisma.$transaction([
    // removing rows
    prisma.calculatorEstimatedCostItem.deleteMany({
      where: { calculatorId, id: { notIn: keepIds } },
    }),
    ...safeRows.map((row) =>
      prisma.calculatorEstimatedCostItem.upsert({
        where: { id: row.id || '' },
        update: {
          category: row.category ?? '',
          amount: Number(row.amount) || 0,
          unitOfMeasure: row.unitOfMeasure ?? 'CAD',
          notes: row.notes || null,
        },
        create: {
          id: row.id || undefined,
          calculatorId,
          category: row.category ?? '',
          amount: Number(row.amount) || 0,
          unitOfMeasure: row.unitOfMeasure ?? 'CAD',
          notes: row.notes || null,
        },
      }),
    ),
  ]);

  return getEstimatedCostItems(calculatorId);
}
