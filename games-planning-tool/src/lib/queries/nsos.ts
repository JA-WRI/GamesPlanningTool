import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { Nso } from '@/lib/types';

export const getNsos = cache(async (): Promise<Nso[]> => {
  return prisma.nso.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
});

export const getNsosForGame = cache(async (gameId: number): Promise<Nso[]> => {
  const rows = await prisma.gameNso.findMany({
    where: { gameId, nso: { isActive: true } },
    select: { nso: { select: { id: true, name: true } } },
    orderBy: { nso: { name: 'asc' } },
  });
  return rows.map((r) => r.nso);
});
