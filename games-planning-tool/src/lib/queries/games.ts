import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { Game, GameWithNsos } from '@/lib/types';

export const getGames = cache(async (): Promise<Game[]> => {
  return prisma.game.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { startDate: 'desc' },
  });
});

// All active games with the active NSOs participating in each.
// Cached per request, so layouts, pages and the header share one query.
export const getGamesWithNsos = cache(async (): Promise<GameWithNsos[]> => {
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
