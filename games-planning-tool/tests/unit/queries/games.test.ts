// @vitest-environment node
//More than 50% AI generated: Test cases were made with AI to test the games query mapping and Prisma arguments
import { describe, it, expect, beforeEach, vi } from 'vitest';

// The real package throws outside Next's server environment.
vi.mock('server-only', () => ({}));

// No database connection in unit tests.
vi.mock('@/lib/prisma', () => ({
  prisma: { game: { findMany: vi.fn() } },
}));

import { prisma } from '@/lib/prisma';
import { getGamesWithNsos } from '@/queries/games';

const findMany = vi.mocked(prisma.game.findMany);

// Shape Prisma returns for the select in getGamesWithNsos.
type Row = {
  id: number;
  name: string;
  gameNsos: { nso: { id: string; name: string } }[];
};

function mockRows(rows: Row[]) {
  findMany.mockResolvedValue(rows as never);
}

describe('getGamesWithNsos', () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it('maps Prisma rows to games with a flat nsos list', async () => {
    mockRows([
      {
        id: 2,
        name: 'Winter Games 2030',
        gameNsos: [
          { nso: { id: 'nso-a', name: 'Alpine Canada' } },
          { nso: { id: 'nso-b', name: 'Hockey Canada' } },
        ],
      },
      {
        id: 1,
        name: 'Summer Games 2028',
        gameNsos: [{ nso: { id: 'nso-c', name: 'Swimming Canada' } }],
      },
    ]);

    const games = await getGamesWithNsos();

    expect(games).toEqual([
      {
        id: 2,
        name: 'Winter Games 2030',
        nsos: [
          { id: 'nso-a', name: 'Alpine Canada' },
          { id: 'nso-b', name: 'Hockey Canada' },
        ],
      },
      {
        id: 1,
        name: 'Summer Games 2028',
        nsos: [{ id: 'nso-c', name: 'Swimming Canada' }],
      },
    ]);
    expect(typeof games[0].id).toBe('number');
  });

  it('only requests active games and active NSOs, in the expected order', async () => {
    mockRows([]);

    await getGamesWithNsos();

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
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
  });

  it('returns an empty nsos list for a game with no NSOs', async () => {
    mockRows([{ id: 3, name: 'Youth Games 2029', gameNsos: [] }]);

    expect(await getGamesWithNsos()).toEqual([
      { id: 3, name: 'Youth Games 2029', nsos: [] },
    ]);
  });

  it('returns an empty list when there are no active games', async () => {
    mockRows([]);

    expect(await getGamesWithNsos()).toEqual([]);
  });
});
