// 70% ai generated code
'use server';

import { prisma } from '@/lib/prisma';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TravelerInput = {
  id: string;
  category: string;
  numberOfTeamMembers: number;
  days: number;
  travelBudget: number;
  accommodationBudget: number;
  mealsBudget: number;
  insuranceBudget: number;
};

function toCents(value: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error('Invalid budget amount');
  }

  const cents = Math.round(value * 100);
  if (!Number.isSafeInteger(cents) || cents > 2147483647) {
    throw new Error('Budget amount is too large');
  }

  return cents;
}

function toNonNegativeInteger(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('Invalid traveler count or days');
  }

  return value;
}

export async function saveTravelers(
  gameId: number,
  nsoId: string,
  rows: TravelerInput[],
) {
  // keep writes local until auth is implemented
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Calculator saving is not enabled in this environment');
  }

  if (
    !Number.isSafeInteger(gameId) ||
    gameId <= 0 ||
    typeof nsoId !== 'string' ||
    !uuidPattern.test(nsoId) ||
    !Array.isArray(rows) ||
    rows.length > 100
  ) {
    throw new Error('Invalid calculator request');
  }

  return prisma.$transaction(async (tx) => {
    const gameNso = await tx.gameNso.findUnique({
      where: { gameId_nsoId: { gameId, nsoId } },
    });

    if (!gameNso) throw new Error('Game or NSO not found');

    const categories = await tx.travelerCategory.findMany();
    const categoryIds = new Map(categories.map((c) => [c.name, c.id]));

    const existing = await tx.traveler.findMany({
      where: { gameId, nsoId },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((row) => row.id));
    const savedIds = new Set<number>();
    const submittedIds = new Set<string>();

    for (const row of rows) {
      if (
        !row ||
        typeof row.id !== 'string' ||
        submittedIds.has(row.id.toLowerCase())
      ) {
        throw new Error('Invalid traveler row');
      }
      submittedIds.add(row.id.toLowerCase());

      const travelerCategoryId = categoryIds.get(row.category);
      if (travelerCategoryId === undefined) {
        throw new Error('Unknown traveler category');
      }

      const days = toNonNegativeInteger(row.days);

      const data = {
        travelerCategoryId,
        numberOfTeamMembers: toNonNegativeInteger(row.numberOfTeamMembers),
        days,
        travelCostInCents: toCents(row.travelBudget),
        accommodationCostInCents: toCents(row.accommodationBudget),
        mealsCostInCents: toCents(row.mealsBudget),
        insuranceCostInCents: toCents(row.insuranceBudget),
      };

      if (/^[1-9]\d*$/.test(row.id)) {
        const id = Number(row.id);

        if (!existingIds.has(id) || savedIds.has(id)) {
          throw new Error('Invalid or duplicate traveler ID');
        }

        await tx.traveler.update({ where: { id }, data });
        savedIds.add(id);
      } else {
        if (!uuidPattern.test(row.id)) {
          throw new Error('Invalid new traveler ID');
        }

        const created = await tx.traveler.create({
          data: { ...data, gameId, nsoId },
        });

        savedIds.add(created.id);
      }
    }

    await tx.traveler.deleteMany({
      where: {
        gameId,
        nsoId,
        id: { notIn: [...savedIds] },
      },
    });

    return tx.traveler.findMany({
      where: { gameId, nsoId },
      include: { travelerCategory: true },
      orderBy: { id: 'asc' },
    });
  });
}

export type EstimatedCostInput = {
  id: string;
  category: string;
  amount: number;
  unitOfMeasure: string;
  notes: string;
};

function costToCents(amount: number): number {
  if (
    typeof amount !== 'number' ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !Number.isSafeInteger(Math.round(amount * 100)) ||
    Math.round(amount * 100) > 2147483647
  ) {
    throw new Error('Invalid estimated cost');
  }

  return Math.round(amount * 100);
}

export async function saveEstimatedCosts(
  gameId: number,
  nsoId: string,
  rows: EstimatedCostInput[],
) {
  // Until authorization is implemented
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Calculator saving is unavailable');
  }

  if (
    !Number.isSafeInteger(gameId) ||
    gameId <= 0 ||
    typeof nsoId !== 'string' ||
    !uuidPattern.test(nsoId) ||
    !Array.isArray(rows) ||
    rows.length > 100
  ) {
    throw new Error('Invalid calculator request');
  }

  return prisma.$transaction(async (tx) => {
    const gameNso = await tx.gameNso.findUnique({
      where: { gameId_nsoId: { gameId, nsoId } },
    });

    if (!gameNso) {
      throw new Error('Invalid game or NSO');
    }

    const existing = await tx.estimatedCostItem.findMany({
      where: { gameNsoId: gameNso.id },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((item) => item.id));
    const savedIds = new Set<number>();
    const submittedIds = new Set<string>();

    for (const row of rows) {
      if (
        !row ||
        typeof row.id !== 'string' ||
        submittedIds.has(row.id.toLowerCase()) ||
        typeof row.category !== 'string' ||
        !row.category.trim() ||
        row.category.length > 200 ||
        typeof row.unitOfMeasure !== 'string' ||
        !/^CAD(?:\/[a-zA-Z]+)?$/.test(row.unitOfMeasure) ||
        typeof row.notes !== 'string' ||
        row.notes.length > 2000
      ) {
        throw new Error('Invalid or duplicate cost item');
      }

      submittedIds.add(row.id.toLowerCase());

      const data = {
        name: row.category.trim(),
        costInCents: costToCents(row.amount),
        unitOfMeasure: row.unitOfMeasure,
        notes: row.notes,
      };

      if (/^[1-9]\d*$/.test(row.id)) {
        const id = Number(row.id);

        if (!Number.isSafeInteger(id) || !existingIds.has(id)) {
          throw new Error('Cost item does not belong to this calculator');
        }

        await tx.estimatedCostItem.update({
          where: { id },
          data,
        });

        savedIds.add(id);
      } else {
        if (!uuidPattern.test(row.id)) {
          throw new Error('Invalid new cost item ID');
        }

        const created = await tx.estimatedCostItem.create({
          data: {
            ...data,
            gameNsoId: gameNso.id,
          },
        });

        savedIds.add(created.id);
      }
    }

    await tx.estimatedCostItem.deleteMany({
      where: {
        gameNsoId: gameNso.id,
        id: { notIn: [...savedIds] },
      },
    });

    return tx.estimatedCostItem.findMany({
      where: { gameNsoId: gameNso.id },
      orderBy: { id: 'asc' },
    });
  });
}
