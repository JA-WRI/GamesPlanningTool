// @vitest-environment node
// Tests for the games query used by the header, selectors and layouts.
// Prisma is mocked: we check what each query asks the DB for and how rows are mapped.
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { prisma } = vi.hoisted(() => ({
  prisma: {
    game: { findMany: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({ prisma }));

import { getGamesWithNsos } from '@/lib/queries/games';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getGamesWithNsos', () => {
  it('only asks for active games and active NSOs, newest game first', async () => {
    prisma.game.findMany.mockResolvedValue([]);
    await getGamesWithNsos();

    const args = prisma.game.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ isActive: true });
    expect(args.orderBy).toEqual({ startDate: 'desc' });
    expect(args.select.gameNsos.where).toEqual({ nso: { isActive: true } });
    expect(args.select.gameNsos.orderBy).toEqual({ nso: { name: 'asc' } });
  });

  it('flattens each game’s gameNsos into a plain nsos list', async () => {
    prisma.game.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'LA 2028',
        gameNsos: [
          { nso: { id: 'a', name: 'Athletics' } },
          { nso: { id: 's', name: 'Swimming' } },
        ],
      },
      { id: 2, name: 'Milan 2026', gameNsos: [] },
    ]);

    await expect(getGamesWithNsos()).resolves.toEqual([
      {
        id: 1,
        name: 'LA 2028',
        nsos: [
          { id: 'a', name: 'Athletics' },
          { id: 's', name: 'Swimming' },
        ],
      },
      { id: 2, name: 'Milan 2026', nsos: [] },
    ]);
  });
});
