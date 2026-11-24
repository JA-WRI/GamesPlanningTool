// @vitest-environment node
// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi, beforeEach } from 'vitest';

// fake prisma and login check, the tests never touch a real database
const { prismaMock, canEditNso } = vi.hoisted(() => {
  const prismaMock = {
    gameMember: { findFirst: vi.fn() },
    gameProperty: { findUnique: vi.fn() },
    game: { findUnique: vi.fn() },
    accreditationPeriod: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { prismaMock, canEditNso: vi.fn() };
});
vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/features/team-size/actions/canEditNso', () => ({ canEditNso }));

import {
  createAccreditationPeriod,
  deleteAccreditationPeriod,
  updateAccreditationPeriod,
} from '@/features/accreditation/actions/accreditationPeriodActions';

const GAME_ID = '1';
const NSO_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';
const MEMBER_ID = '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b';
const HOTEL_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
const PERIOD_ID = '16fd2706-8baf-433b-82eb-8c7fada847da';
const day = (value: string) => new Date(`${value}T00:00:00Z`);

const INPUT = {
  gameMemberId: MEMBER_ID,
  propertyId: HOTEL_ID,
  startDate: '2028-07-21',
  endDate: '2028-07-30',
  status: 'CONFIRMED',
};
const SCOPE = { gameMember: { gameId: 1, member: { nsoId: NSO_ID } } };

beforeEach(() => {
  vi.resetAllMocks();
  // the transaction just runs the callback with the fake prisma
  prismaMock.$transaction.mockImplementation((save) => save(prismaMock));
  canEditNso.mockResolvedValue(true);
  // by default: the person and hotel are fine, the Games are 14 to 30 July
  prismaMock.gameMember.findFirst.mockResolvedValue({
    gameArrival: null,
    gameDeparture: null,
  });
  prismaMock.gameProperty.findUnique.mockResolvedValue({ id: 'link' });
  prismaMock.game.findUnique.mockResolvedValue({
    startDate: day('2028-07-14'),
    endDate: day('2028-07-30'),
  });
  prismaMock.accreditationPeriod.findMany.mockResolvedValue([]);
});

describe('createAccreditationPeriod', () => {
  it('saves a valid period', async () => {
    expect(await createAccreditationPeriod(GAME_ID, NSO_ID, INPUT)).toEqual({
      ok: true,
    });
    expect(prismaMock.accreditationPeriod.create).toHaveBeenCalledWith({
      data: {
        gameMemberId: MEMBER_ID,
        propertyId: HOTEL_ID,
        startDate: day('2028-07-21'),
        endDate: day('2028-07-30'),
        status: 'CONFIRMED',
      },
    });
    // checks and save run together so two saves can't overlap
    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });

  it('refuses fake url ids without asking the database', async () => {
    const result = await createAccreditationPeriod('game_id_1', 'nso_1', INPUT);
    expect(result).toEqual({
      ok: false,
      error: 'Some details are missing or invalid.',
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('refuses a user who cannot edit this NSO', async () => {
    canEditNso.mockResolvedValue(false);
    expect(await createAccreditationPeriod(GAME_ID, NSO_ID, INPUT)).toEqual({
      ok: false,
      error: 'You are not allowed to change this NSO.',
    });
    expect(prismaMock.accreditationPeriod.create).not.toHaveBeenCalled();
  });

  it('refuses missing or invalid details', async () => {
    const result = await createAccreditationPeriod(GAME_ID, NSO_ID, {
      ...INPUT,
      startDate: 'soon',
    });
    expect(result).toEqual({
      ok: false,
      error: 'Some details are missing or invalid.',
    });
  });

  it('refuses a person from another NSO or game', async () => {
    prismaMock.gameMember.findFirst.mockResolvedValue(null);
    expect(await createAccreditationPeriod(GAME_ID, NSO_ID, INPUT)).toEqual({
      ok: false,
      error: 'This person is not part of this NSO for this Game.',
    });
    expect(prismaMock.gameMember.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: MEMBER_ID, gameId: 1, member: { nsoId: NSO_ID } },
      }),
    );
    expect(prismaMock.accreditationPeriod.create).not.toHaveBeenCalled();
  });

  it('refuses a hotel not linked to the game', async () => {
    prismaMock.gameProperty.findUnique.mockResolvedValue(null);
    expect(await createAccreditationPeriod(GAME_ID, NSO_ID, INPUT)).toEqual({
      ok: false,
      error: 'This hotel is not linked to this Game.',
    });
  });

  it('refuses an end date before the start date', async () => {
    const result = await createAccreditationPeriod(GAME_ID, NSO_ID, {
      ...INPUT,
      startDate: '2028-07-25',
      endDate: '2028-07-20',
    });
    expect(result).toEqual({
      ok: false,
      error: 'The end date must be on or after the start date.',
    });
  });

  it('refuses dates outside the Games', async () => {
    const result = await createAccreditationPeriod(GAME_ID, NSO_ID, {
      ...INPUT,
      endDate: '2028-08-02',
    });
    expect(result).toEqual({
      ok: false,
      error: 'The dates must be between 2028-07-14 and 2028-07-30.',
    });
  });

  it('allows days before the Games when the person arrives early', async () => {
    prismaMock.gameMember.findFirst.mockResolvedValue({
      gameArrival: day('2028-07-11'),
      gameDeparture: day('2028-07-31'),
    });
    const result = await createAccreditationPeriod(GAME_ID, NSO_ID, {
      ...INPUT,
      startDate: '2028-07-11',
      endDate: '2028-07-31',
    });
    expect(result).toEqual({ ok: true });
  });

  it('refuses a period that overlaps another one of the same person', async () => {
    prismaMock.accreditationPeriod.findMany.mockResolvedValue([
      { startDate: day('2028-07-14'), endDate: day('2028-07-21') },
    ]);
    expect(await createAccreditationPeriod(GAME_ID, NSO_ID, INPUT)).toEqual({
      ok: false,
      error: 'This period overlaps another period for the same person.',
    });
    expect(prismaMock.accreditationPeriod.create).not.toHaveBeenCalled();
  });

  it('allows a period right after another one, like a hotel change', async () => {
    prismaMock.accreditationPeriod.findMany.mockResolvedValue([
      { startDate: day('2028-07-14'), endDate: day('2028-07-20') },
    ]);
    expect(await createAccreditationPeriod(GAME_ID, NSO_ID, INPUT)).toEqual({
      ok: true,
    });
  });

  it('shows a simple message when the database fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.$transaction.mockRejectedValue(new Error('connection lost'));
    expect(await createAccreditationPeriod(GAME_ID, NSO_ID, INPUT)).toEqual({
      ok: false,
      error: 'The period could not be saved. Please try again.',
    });
  });
});

describe('updateAccreditationPeriod', () => {
  it('only edits a period of this NSO and game', async () => {
    prismaMock.accreditationPeriod.count.mockResolvedValue(0);
    const result = await updateAccreditationPeriod(
      GAME_ID,
      NSO_ID,
      PERIOD_ID,
      INPUT,
    );
    expect(result).toEqual({ ok: false, error: 'This period was not found.' });
    expect(prismaMock.accreditationPeriod.count).toHaveBeenCalledWith({
      where: { id: PERIOD_ID, ...SCOPE },
    });
    expect(prismaMock.accreditationPeriod.update).not.toHaveBeenCalled();
  });

  it('saves the new dates without comparing the period to itself', async () => {
    prismaMock.accreditationPeriod.count.mockResolvedValue(1);
    const result = await updateAccreditationPeriod(
      GAME_ID,
      NSO_ID,
      PERIOD_ID,
      INPUT,
    );
    expect(result).toEqual({ ok: true });
    expect(prismaMock.accreditationPeriod.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { gameMemberId: MEMBER_ID, id: { not: PERIOD_ID } },
      }),
    );
    expect(prismaMock.accreditationPeriod.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: PERIOD_ID } }),
    );
  });

  it('refuses an invalid period id', async () => {
    const result = await updateAccreditationPeriod(
      GAME_ID,
      NSO_ID,
      'abc',
      INPUT,
    );
    expect(result).toEqual({
      ok: false,
      error: 'Some details are missing or invalid.',
    });
  });
});

describe('deleteAccreditationPeriod', () => {
  it('deletes only a period of this NSO and game', async () => {
    prismaMock.accreditationPeriod.deleteMany.mockResolvedValue({ count: 1 });
    expect(await deleteAccreditationPeriod(GAME_ID, NSO_ID, PERIOD_ID)).toEqual(
      { ok: true },
    );
    expect(prismaMock.accreditationPeriod.deleteMany).toHaveBeenCalledWith({
      where: { id: PERIOD_ID, ...SCOPE },
    });
  });

  it('says not found when the period is not in this NSO and game', async () => {
    prismaMock.accreditationPeriod.deleteMany.mockResolvedValue({ count: 0 });
    expect(await deleteAccreditationPeriod(GAME_ID, NSO_ID, PERIOD_ID)).toEqual(
      { ok: false, error: 'This period was not found.' },
    );
  });

  it('shows a simple message when the database fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.accreditationPeriod.deleteMany.mockRejectedValue(
      new Error('connection lost'),
    );
    expect(await deleteAccreditationPeriod(GAME_ID, NSO_ID, PERIOD_ID)).toEqual(
      {
        ok: false,
        error: 'The period could not be deleted. Please try again.',
      },
    );
  });

  it('refuses a user who cannot edit this NSO', async () => {
    canEditNso.mockResolvedValue(false);
    expect(await deleteAccreditationPeriod(GAME_ID, NSO_ID, PERIOD_ID)).toEqual(
      { ok: false, error: 'You are not allowed to change this NSO.' },
    );
    expect(prismaMock.accreditationPeriod.deleteMany).not.toHaveBeenCalled();
  });
});
