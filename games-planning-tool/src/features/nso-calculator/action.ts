// 40% ai generated code 
'use server';

import { prisma } from '@/lib/prisma';

export type TravelerInput = {
  id: string;
  category: string;
  numberOfTeamMembers: number;
  days: number;
  checkIn: string;
  checkOut: string;
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

function toDate(value: string): Date | null {
  if (value === '') return null;

  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Invalid date format');
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value) {
    throw new Error('Invalid date');
  }

  return date;
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

  if (!Number.isSafeInteger(gameId) || gameId <= 0 ||
      !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(nsoId) ||
      !Array.isArray(rows) || rows.length > 100) {
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

    for (const row of rows) {
      if (!row || typeof row.id !== 'string') {
        throw new Error('Invalid traveler row');
      }

      const travelerCategoryId = categoryIds.get(row.category);
      if (travelerCategoryId === undefined) {
        throw new Error('Unknown traveler category');
      }

      const checkInDate = toDate(row.checkIn);
      const checkOutDate = toDate(row.checkOut);

      if (checkInDate && checkOutDate && checkOutDate < checkInDate) {
        throw new Error('Check-out cannot be before check-in');
      }

      const data = {
        travelerCategoryId,
        numberOfTeamMembers: toNonNegativeInteger(row.numberOfTeamMembers),
        days: toNonNegativeInteger(row.days),
        checkInDate,
        checkOutDate,
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
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.id)) {
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
