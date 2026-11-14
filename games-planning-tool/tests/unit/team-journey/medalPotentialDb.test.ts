// @vitest-environment node
// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi, beforeEach } from 'vitest';

// fake prisma object, the tests never touch a real database
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    gameMember: { findMany: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
// server-only throws outside the server, so the tests turn it off
vi.mock('server-only', () => ({}));

import { getMedalRows } from '@/server/queries/medalPotentialDb';

const GAME_ID = '1';
const NSO_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getMedalRows', () => {
  it('returns null for the fake ids without asking the database', async () => {
    expect(await getMedalRows('game_id_1', 'nso_1')).toBeNull();
    expect(prismaMock.gameMember.findMany).not.toHaveBeenCalled();
  });

  it('asks only for the athletes of this NSO in this game', async () => {
    prismaMock.gameMember.findMany.mockResolvedValue([]);

    await getMedalRows(GAME_ID, NSO_ID);

    expect(prismaMock.gameMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { gameId: 1, member: { nsoId: NSO_ID, type: 'Athlete' } },
      }),
    );
  });

  it('sorts by last name, first name, then id so the order never changes', async () => {
    prismaMock.gameMember.findMany.mockResolvedValue([]);

    await getMedalRows(GAME_ID, NSO_ID);

    expect(prismaMock.gameMember.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { member: { lastName: 'asc' } },
          { member: { firstName: 'asc' } },
          { id: 'asc' },
        ],
      }),
    );
  });

  it('turns the athletes into table rows', async () => {
    prismaMock.gameMember.findMany.mockResolvedValue([
      {
        id: '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b',
        event: '400m',
        medal: 'SP',
        medalNotes: null,
        member: { firstName: 'Alex', lastName: 'Martin' },
      },
    ]);

    const rows = await getMedalRows(GAME_ID, NSO_ID);

    expect(rows).toEqual([
      {
        id: '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b',
        firstName: 'Alex',
        lastName: 'Martin',
        event: '400m',
        medalPotential: 'SP',
        notes: '',
      },
    ]);
  });
});
