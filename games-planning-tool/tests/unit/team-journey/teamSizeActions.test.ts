// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MOCK_DISCIPLINES,
  MOCK_TEAM_SIZE,
} from '@/features/team-size/lib/mockData';

// fake prisma objct the tests never touch a real database
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    teamSizeEstimate: { upsert: vi.fn(), findUnique: vi.fn() },
    disciplineBreakdown: { upsert: vi.fn() },
    gameNso: { findUnique: vi.fn() },
  },
}));
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

import { saveTeamSize } from '@/features/team-size/actions/teamSizeActions';
import { getTeamSize } from '@/features/team-size/lib/teamSizeDb';

const GAME_ID = '1';
const NSO_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.$transaction.mockResolvedValue([]);
  // by default the NSO takes part in the game
  prismaMock.gameNso.findUnique.mockResolvedValue({ id: 'link' });
});

describe('saveTeamSize', () => {
  it('saves the estimate and the 4 disciplines together', async () => {
    const result = await saveTeamSize(
      GAME_ID,
      NSO_ID,
      MOCK_TEAM_SIZE,
      MOCK_DISCIPLINES,
    );

    expect(result).toEqual({ ok: true });
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.teamSizeEstimate.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { nsoId_gameId: { gameId: 1, nsoId: NSO_ID } },
      }),
    );
    expect(prismaMock.disciplineBreakdown.upsert).toHaveBeenCalledTimes(4);
  });

  it('does not save with the fake ids from the mock data', async () => {
    const result = await saveTeamSize(
      'game_id_1',
      'nso_1',
      MOCK_TEAM_SIZE,
      MOCK_DISCIPLINES,
    );

    expect(result).toEqual({ ok: false });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('does not save broken or invalid data', async () => {
    const lowAboveHigh = { ...MOCK_TEAM_SIZE, projectedMedalsLow: '9' };

    expect(
      await saveTeamSize(GAME_ID, NSO_ID, lowAboveHigh, MOCK_DISCIPLINES),
    ).toEqual({ ok: false });
    expect(
      await saveTeamSize(
        GAME_ID,
        NSO_ID,
        {} as typeof MOCK_TEAM_SIZE,
        MOCK_DISCIPLINES,
      ),
    ).toEqual({ ok: false });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('does not save when the NSO is not part of that game', async () => {
    prismaMock.gameNso.findUnique.mockResolvedValue(null);

    const result = await saveTeamSize(
      GAME_ID,
      NSO_ID,
      MOCK_TEAM_SIZE,
      MOCK_DISCIPLINES,
    );

    expect(result).toEqual({ ok: false });
    expect(prismaMock.gameNso.findUnique).toHaveBeenCalledWith({
      where: { gameId_nsoId: { gameId: 1, nsoId: NSO_ID } },
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});

describe('getTeamSize', () => {
  it('returns null for the fake ids without asking the database', async () => {
    expect(await getTeamSize('game_id_1', 'nso_1')).toBeNull();
    expect(prismaMock.teamSizeEstimate.findUnique).not.toHaveBeenCalled();
  });

  it('gives an empty page when nothing is saved yet', async () => {
    prismaMock.teamSizeEstimate.findUnique.mockResolvedValue(null);

    const saved = await getTeamSize(GAME_ID, NSO_ID);

    expect(saved?.teamSize.athletes.male.low).toBe('');
    expect(saved?.disciplines.rows).toHaveLength(4);
    expect(saved?.disciplines.notes).toBe('');
  });

  it('turns the saved rows into page data', async () => {
    prismaMock.teamSizeEstimate.findUnique.mockResolvedValue({
      lowFemale: 10,
      bestGuessFemale: 13,
      highFemale: 13,
      lowMale: 11,
      bestGuessMale: 12,
      highMale: 16,
      notes: 'saved',
      disciplineBreakdownNotes: 'discipline note',
      lowMedals: 2,
      highMedals: 5,
      disciplineBreakdowns: [
        {
          discipline: 'hp',
          bestFemale: 4,
          bestMale: 3,
          lowFemale: 3,
          lowMale: 3,
        },
      ],
    });

    const saved = await getTeamSize(GAME_ID, NSO_ID);

    expect(saved?.teamSize.athletes.male.low).toBe('11');
    expect(saved?.teamSize.notes).toBe('saved');
    expect(saved?.disciplines.notes).toBe('discipline note');
    expect(saved?.disciplines.rows[0].bestF).toBe(4);
  });
});
