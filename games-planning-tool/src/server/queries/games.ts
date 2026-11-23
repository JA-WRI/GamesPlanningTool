//no substantial AI generated code
import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { GameWithNsos } from '@/lib/types';

export const getGamesWithNsos = cache(async (): Promise<GameWithNsos[]> => {
  await connection();
  const rows = await prisma.game.findMany({
    where: { isActive: true },
    orderBy: { startDate: 'desc' },
    select: {
      id: true,
      name: true,
      gameNsos: {
        where: { nso: { isActive: true } },
        select: { nso: { select: { id: true, name: true } } },
        orderBy: { nso: { name: 'asc' } },
      },
    },
  });
  return rows.map(({ id, name, gameNsos }) => ({
    id,
    name,
    nsos: gameNsos.map((gn) => gn.nso),
  }));
});

export type GameSummary = {
  id: number;
  name: string;
  country: string;
  city: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  planningPeriodStart: string | null;
  planningPeriodEnd: string | null;
};

export const getGamesByStatus = cache(
  async (): Promise<{ active: GameSummary[]; archived: GameSummary[] }> => {
    await connection();
    const rows = await prisma.game.findMany({
      orderBy: [{ startDate: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
      select: {
        id: true,
        name: true,
        country: true,
        city: true,
        isActive: true,
        startDate: true,
        endDate: true,
        planningPeriodStart: true,
        planningPeriodEnd: true,
      },
    });

    const games: GameSummary[] = rows.map((g) => ({
      ...g,
      startDate: g.startDate?.toISOString() ?? null,
      endDate: g.endDate?.toISOString() ?? null,
      planningPeriodStart: g.planningPeriodStart?.toISOString() ?? null,
      planningPeriodEnd: g.planningPeriodEnd?.toISOString() ?? null,
    }));

    return {
      active: games.filter((g) => g.isActive),
      archived: games.filter((g) => !g.isActive),
    };
  },
);

// Writes are not wrapped in cache(): they must run every time.
export async function insertGame(data: {
  name: string;
  country: string;
  city: string;
}) {
  return prisma.game.create({ data, select: { id: true } });
}

export async function removeGame(id: number) {
  return prisma.game.delete({ where: { id }, select: { id: true } });
}

export async function updateGameActive(id: number, isActive: boolean) {
  return prisma.game.update({
    where: { id },
    data: { isActive },
    select: { id: true },
  });
}
