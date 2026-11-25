// @vitest-environment node
// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi, beforeEach } from 'vitest';

// fake prisma object, the tests never touch a real database
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    task: { findMany: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
// server-only throws outside the server, so the tests turn it off
vi.mock('server-only', () => ({}));

import { getJourneyStepStatuses } from '@/server/queries/journeyStepsDb';

const GAME_ID = '1';
const NSO_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getJourneyStepStatuses', () => {
  it('returns nothing for the fake ids without asking the database', async () => {
    expect(await getJourneyStepStatuses('game_id_1', 'nso_1')).toEqual({});
    expect(prismaMock.task.findMany).not.toHaveBeenCalled();
  });

  it('asks only for the stepper tasks of this NSO in this game', async () => {
    prismaMock.task.findMany.mockResolvedValue([]);

    await getJourneyStepStatuses(GAME_ID, NSO_ID);

    expect(prismaMock.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          gameNso: { gameId: 1, nsoId: NSO_ID },
          stepKey: { in: ['teamSize', 'accreditation'] },
        },
      }),
    );
  });

  it('sorts by id so the result never changes between loads', async () => {
    prismaMock.task.findMany.mockResolvedValue([]);

    await getJourneyStepStatuses(GAME_ID, NSO_ID);

    expect(prismaMock.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { id: 'asc' } }),
    );
  });

  it('turns the tasks into a status per step', async () => {
    prismaMock.task.findMany.mockResolvedValue([
      { stepKey: 'teamSize', status: 'COMPLETE' },
      { stepKey: 'accreditation', status: 'IN_PROGRESS' },
    ]);

    expect(await getJourneyStepStatuses(GAME_ID, NSO_ID)).toEqual({
      teamSize: 'COMPLETE',
      accreditation: 'IN_PROGRESS',
    });
  });
});
