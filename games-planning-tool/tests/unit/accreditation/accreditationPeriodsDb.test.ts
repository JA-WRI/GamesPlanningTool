// @vitest-environment node
// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi, beforeEach } from 'vitest';

// fake prisma object, the tests never touch a real database
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { accreditationPeriod: { findMany: vi.fn() } },
}));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
// server-only throws outside the server, so the tests turn it off
vi.mock('server-only', () => ({}));

import { listAccreditationPeriods } from '@/server/queries/accreditationPeriodsDb';

const NSO_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listAccreditationPeriods', () => {
  it('returns null for the fake ids without asking the database', async () => {
    expect(await listAccreditationPeriods('game_id_1', 'nso_1')).toBeNull();
    expect(prismaMock.accreditationPeriod.findMany).not.toHaveBeenCalled();
  });

  it('asks only for the periods of this NSO in this game, always in the same order', async () => {
    prismaMock.accreditationPeriod.findMany.mockResolvedValue([]);

    await listAccreditationPeriods('1', NSO_ID);

    expect(prismaMock.accreditationPeriod.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { gameMember: { gameId: 1, member: { nsoId: NSO_ID } } },
        orderBy: [{ gameMemberId: 'asc' }, { startDate: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('turns the dates into YYYY-MM-DD', async () => {
    prismaMock.accreditationPeriod.findMany.mockResolvedValue([
      {
        id: 'period-1',
        gameMemberId: 'member-1',
        propertyId: 'hotel-1',
        startDate: new Date('2028-07-14T00:00:00Z'),
        endDate: new Date('2028-07-20T00:00:00Z'),
        status: 'CONFIRMED',
      },
    ]);

    expect(await listAccreditationPeriods('1', NSO_ID)).toEqual([
      {
        id: 'period-1',
        gameMemberId: 'member-1',
        propertyId: 'hotel-1',
        startDate: '2028-07-14',
        endDate: '2028-07-20',
        status: 'CONFIRMED',
      },
    ]);
  });
});
