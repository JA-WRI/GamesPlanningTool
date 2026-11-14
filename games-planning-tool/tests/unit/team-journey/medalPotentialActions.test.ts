// @vitest-environment node
// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi, beforeEach } from 'vitest';

// fake prisma object, the tests never touch a real database
const { prismaMock, getSession } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    gameMember: { count: vi.fn(), update: vi.fn() },
  },
  getSession: vi.fn(),
}));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/data', () => ({ getSession }));

import { saveMedalRows } from '@/features/team-size/actions/medalPotentialActions';

const GAME_ID = '1';
const NSO_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';

const ROW = {
  id: '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b',
  firstName: 'Alex',
  lastName: 'Martin',
  event: '400m',
  medalPotential: 'MP' as const,
  notes: '',
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockResolvedValue([]);
  // by default every row is an athlete of this NSO
  prismaMock.gameMember.count.mockResolvedValue(1);
  // by default the user is an admin
  getSession.mockResolvedValue({ user: { role: 'admin', gameId: GAME_ID } });
});

describe('saveMedalRows', () => {
  it('saves event, medal and notes only', async () => {
    const result = await saveMedalRows(GAME_ID, NSO_ID, [ROW]);

    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.gameMember.update).toHaveBeenCalledWith({
      where: { id: ROW.id },
      data: { event: '400m', medal: 'MP', medalNotes: null },
    });
  });

  it('checks the athletes belong to this NSO and game', async () => {
    await saveMedalRows(GAME_ID, NSO_ID, [ROW]);

    expect(prismaMock.gameMember.count).toHaveBeenCalledWith({
      where: {
        id: { in: [ROW.id] },
        gameId: 1,
        member: { nsoId: NSO_ID, type: 'Athlete' },
      },
    });
  });

  it('does not save an athlete from another team', async () => {
    prismaMock.gameMember.count.mockResolvedValue(0);

    const result = await saveMedalRows(GAME_ID, NSO_ID, [ROW]);

    expect(result).toEqual({ ok: false });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('does not let an NSO user save for another NSO', async () => {
    getSession.mockResolvedValue({
      user: { role: 'nso', gameId: GAME_ID, nsoId: 'another-nso' },
    });

    const result = await saveMedalRows(GAME_ID, NSO_ID, [ROW]);

    expect(result).toEqual({ ok: false });
    expect(prismaMock.gameMember.count).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('lets an NSO user save their own NSO', async () => {
    getSession.mockResolvedValue({
      user: { role: 'nso', gameId: GAME_ID, nsoId: NSO_ID },
    });

    expect(await saveMedalRows(GAME_ID, NSO_ID, [ROW])).toEqual({ ok: true });
  });

  it('does not save with fake ids, broken rows or the same athlete twice', async () => {
    const badMedal = {
      ...ROW,
      medalPotential: 'Gold',
    } as unknown as typeof ROW;

    expect(await saveMedalRows('game_id_1', 'nso_1', [ROW])).toEqual({
      ok: false,
    });
    expect(await saveMedalRows(GAME_ID, NSO_ID, [badMedal])).toEqual({
      ok: false,
    });
    expect(await saveMedalRows(GAME_ID, NSO_ID, [ROW, ROW])).toEqual({
      ok: false,
    });
    expect(prismaMock.gameMember.count).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
