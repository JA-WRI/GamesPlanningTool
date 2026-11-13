// about 50% ai 
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveTravelers } from '@/features/nso-calculator/action';

const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  gameNso: { findUnique: vi.fn(), findFirst: vi.fn() },
  travelerCategory: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn() },
  traveler: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: db }));

const gameId = 5;
const nsoId = '50ee531d-93b7-4d73-9ece-35b6c052ae2d';
const gameNsoId = '48e4c0d8-8c34-4126-876a-7d12dd4cd313';
const newRowId = '7ff6867c-c65a-4997-94f8-7d8af87edbb9';

const storedTraveler = {
  id: 11,
  gameId,
  nsoId,
  travelerCategoryId: 1,
  travelerCategory: { id: 1, name: 'Athletes' },
  numberOfTeamMembers: 1,
  days: 2,
  travelCostInCents: 240000,
  accommodationCostInCents: 15000,
  mealsCostInCents: 10000,
  insuranceCostInCents: 5000,
  extraCostsInCents: 0,
  checkInDate: new Date('2027-06-15T00:00:00Z'),
  checkOutDate: new Date('2027-06-17T00:00:00Z'),
};

type TravelerInput = {
  id: string;
  category: string;
  numberOfTeamMembers: number;
  days: number;
  travelBudget: number;
  checkIn: string;
  checkOut: string;
  accommodationBudget: number;
  mealsBudget: number;
  insuranceBudget: number;
  totalCostPerTeamMember: number;
};

function travelerRow(overrides: Partial<TravelerInput> = {}): TravelerInput {
  return {
    id: newRowId,
    category: 'Athletes',
    numberOfTeamMembers: 2,
    days: 2,
    travelBudget: 2400,
    checkIn: '2027-06-15',
    checkOut: '2027-06-17',
    accommodationBudget: 150,
    mealsBudget: 100,
    insuranceBudget: 50,
    totalCostPerTeamMember: 2850,
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NODE_ENV', 'development'); // Some actions are dev-only until auth is implemented.

  // Support a transaction callback, which is how the implementation was designed.
  db.$transaction.mockImplementation(async (operation: unknown) => {
    if (typeof operation === 'function') {
      return (operation as (tx: typeof db) => Promise<unknown>)(db);
    }
    return Promise.all(operation as Promise<unknown>[]);
  });

  db.gameNso.findUnique.mockResolvedValue({ id: gameNsoId, gameId, nsoId });
  db.gameNso.findFirst.mockResolvedValue({ id: gameNsoId, gameId, nsoId });
  db.travelerCategory.findMany.mockResolvedValue([{ id: 1, name: 'Athletes' }]);
  db.travelerCategory.findUnique.mockResolvedValue({ id: 1, name: 'Athletes' });
  db.travelerCategory.findFirst.mockResolvedValue({ id: 1, name: 'Athletes' });
  db.traveler.findMany.mockResolvedValue([]);
  db.traveler.findUnique.mockResolvedValue(null);
  db.traveler.findFirst.mockResolvedValue(null);
  db.traveler.create.mockResolvedValue(storedTraveler);
  db.traveler.update.mockResolvedValue(storedTraveler);
  db.traveler.deleteMany.mockResolvedValue({ count: 0 });
});

afterEach(() => vi.unstubAllEnvs());

describe('saveTravelers — server action', () => {
  it('creates a new traveler under the requested game and NSO', async () => {
    await saveTravelers(gameId, nsoId, [travelerRow()]);

    expect(db.traveler.create).toHaveBeenCalled();
    expect(db.traveler.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          gameId,
          nsoId,
          travelerCategoryId: 1,
          numberOfTeamMembers: 2,
        }),
      }),
    );
  });

  it('converts the entered dollar budgets into integer cents', async () => {
    await saveTravelers(gameId, nsoId, [
      travelerRow({ travelBudget: 2400.75, accommodationBudget: 150.25 }),
    ]);

    expect(db.traveler.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          travelCostInCents: 240075,
          accommodationCostInCents: 15025,
          mealsCostInCents: 10000,
          insuranceCostInCents: 5000,
        }),
      }),
    );
  });

  it('updates an existing traveler instead of creating another one', async () => {
    db.traveler.findMany.mockResolvedValue([storedTraveler]);
    db.traveler.findUnique.mockResolvedValue(storedTraveler);
    db.traveler.findFirst.mockResolvedValue(storedTraveler);

    await saveTravelers(gameId, nsoId, [
      travelerRow({ id: '11', travelBudget: 2600 }),
    ]);

    expect(db.traveler.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 11 }),
        data: expect.objectContaining({ travelCostInCents: 260000 }),
      }),
    );
    expect(db.traveler.create).not.toHaveBeenCalled();
  });

  it('deletes omitted travelers for the selected game and NSO', async () => {
    db.traveler.findMany.mockResolvedValue([storedTraveler]);

    await saveTravelers(gameId, nsoId, []);

    expect(db.traveler.deleteMany).toHaveBeenCalled();
    const allDeleteCalls = db.traveler.deleteMany.mock.calls;
    const deleteInput = allDeleteCalls[0]?.[0];
    expect(deleteInput).toHaveProperty('where');
  });

  it('does not allow an existing ID belonging to another NSO', async () => {
    // The current NSO owns no existing IDs; ID 11 belongs elsewhere.
    db.traveler.findMany.mockResolvedValue([]);
    db.traveler.findUnique.mockResolvedValue({ ...storedTraveler, nsoId: 'other-nso' });
    db.traveler.findFirst.mockResolvedValue(null);

    await expect(
      saveTravelers(gameId, nsoId, [travelerRow({ id: '11' })]),
    ).rejects.toThrow();

    expect(db.traveler.update).not.toHaveBeenCalled();
  });

  it('rejects negative monetary amounts', async () => {
    await expect(
      saveTravelers(gameId, nsoId, [travelerRow({ travelBudget: -1 })]),
    ).rejects.toThrow();

    expect(db.traveler.create).not.toHaveBeenCalled();
    expect(db.traveler.update).not.toHaveBeenCalled();
  });

  it('rejects negative team member counts', async () => {
    await expect(
      saveTravelers(gameId, nsoId, [travelerRow({ numberOfTeamMembers: -1 })]),
    ).rejects.toThrow();
  });

  it('rejects malformed date ranges before writing', async () => {
    await expect(
      saveTravelers(gameId, nsoId, [
        travelerRow({ checkIn: '2027-06-20', checkOut: '2027-06-18' }),
      ]),
    ).rejects.toThrow();

    expect(db.traveler.create).not.toHaveBeenCalled();
  });

  it('rejects an unknown traveler category', async () => {
    await expect(
      saveTravelers(gameId, nsoId, [travelerRow({ category: 'Unknown category' })]),
    ).rejects.toThrow();
  });

  it('rejects a nonexistent game-NSO association', async () => {
    db.gameNso.findUnique.mockResolvedValue(null);
    db.gameNso.findFirst.mockResolvedValue(null);

    await expect(saveTravelers(gameId, nsoId, [travelerRow()])).rejects.toThrow();
    expect(db.traveler.create).not.toHaveBeenCalled();
  });

  it('propagates a Prisma failure rather than claiming Save succeeded', async () => {
    db.traveler.create.mockRejectedValue(new Error('Database unavailable'));

    await expect(saveTravelers(gameId, nsoId, [travelerRow()])).rejects.toThrow(
      /Database unavailable/,
    );
  });
});
