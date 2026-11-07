import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { Game } from '@/lib/types';

export const getGames = cache(async (): Promise<Game[]> => {
  return prisma.game.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { startDate: 'desc' },
  });
});
