// about 50% ai 
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveEstimatedCosts } from '@/features/nso-calculator/action';

// Mock the real Prisma client, not saveEstimatedCosts.
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  gameNso: { findUnique: vi.fn(), findFirst: vi.fn() },
  estimatedCostItem: {
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
const newId = 'aca08969-dd97-428c-ad4c-1fb3a136d480';

const storedCost = {
  id: 101,
  name: 'Travel Economy Fare',
  costInCents: 240000,
  unitOfMeasure: 'CAD',
  notes: 'To be confirmed',
  isCoveredByCOC: false,
  travelerCategoryId: null,
  gameNsoId,
};

type CostInput = {
  id: string;
  category: string;
  amount: number;
  unitOfMeasure: string;
  notes: string;
};

function costRow(overrides: Partial<CostInput> = {}): CostInput {
  return {
    id: newId,
    category: 'Travel Economy Fare',
    amount: 2400,
    unitOfMeasure: 'CAD',
    notes: 'To be confirmed',
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NODE_ENV', 'development');

  db.$transaction.mockImplementation(async (operation: unknown) => {
    if (typeof operation === 'function') {
      return (operation as (tx: typeof db) => Promise<unknown>)(db);
    }
    return Promise.all(operation as Promise<unknown>[]);
  });

  db.gameNso.findUnique.mockResolvedValue({ id: gameNsoId, gameId, nsoId });
  db.gameNso.findFirst.mockResolvedValue({ id: gameNsoId, gameId, nsoId });
  db.estimatedCostItem.findMany.mockResolvedValue([]);
  db.estimatedCostItem.findUnique.mockResolvedValue(null);
  db.estimatedCostItem.findFirst.mockResolvedValue(null);
  db.estimatedCostItem.create.mockResolvedValue(storedCost);
  db.estimatedCostItem.update.mockResolvedValue(storedCost);
  db.estimatedCostItem.deleteMany.mockResolvedValue({ count: 0 });
});

afterEach(() => vi.unstubAllEnvs());

describe('saveEstimatedCosts — server action', () => {
  it('creates a cost item associated with the current game-NSO pair', async () => {
    await saveEstimatedCosts(gameId, nsoId, [costRow()]);

    expect(db.estimatedCostItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          gameNsoId,
          name: 'Travel Economy Fare',
          costInCents: 240000,
          unitOfMeasure: 'CAD',
        }),
      }),
    );
  });

  it('stores decimal amounts as cents', async () => {
    await saveEstimatedCosts(gameId, nsoId, [
      costRow({ amount: 108.25, unitOfMeasure: 'CAD/day' }),
    ]);

    expect(db.estimatedCostItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          costInCents: 10825,
          unitOfMeasure: 'CAD/day',
        }),
      }),
    );
  });

  it('updates an owned cost item instead of duplicating it', async () => {
    db.estimatedCostItem.findMany.mockResolvedValue([storedCost]);
    db.estimatedCostItem.findUnique.mockResolvedValue(storedCost);
    db.estimatedCostItem.findFirst.mockResolvedValue(storedCost);

    await saveEstimatedCosts(gameId, nsoId, [
      costRow({ id: '101', amount: 2500, notes: 'Updated estimate' }),
    ]);

    expect(db.estimatedCostItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 101 }),
        data: expect.objectContaining({
          costInCents: 250000,
          notes: 'Updated estimate',
        }),
      }),
    );
    expect(db.estimatedCostItem.create).not.toHaveBeenCalled();
  });

  it('deletes removed costs in the selected game-NSO scope', async () => {
    db.estimatedCostItem.findMany.mockResolvedValue([storedCost]);

    await saveEstimatedCosts(gameId, nsoId, []);

    expect(db.estimatedCostItem.deleteMany).toHaveBeenCalled();
    expect(db.estimatedCostItem.deleteMany.mock.calls[0][0]).toHaveProperty('where');
  });

  it('rejects an ID owned by another game/NSO', async () => {
    // The selected NSO owns no existing rows, but input tries to update ID 101.
    db.estimatedCostItem.findMany.mockResolvedValue([]);
    db.estimatedCostItem.findUnique.mockResolvedValue({
      ...storedCost,
      gameNsoId: 'different-game-nso-id',
    });
    db.estimatedCostItem.findFirst.mockResolvedValue(null);

    await expect(
      saveEstimatedCosts(gameId, nsoId, [costRow({ id: '101' })]),
    ).rejects.toThrow();

    expect(db.estimatedCostItem.update).not.toHaveBeenCalled();
  });

  it('rejects negative amounts', async () => {
    await expect(
      saveEstimatedCosts(gameId, nsoId, [costRow({ amount: -0.01 })]),
    ).rejects.toThrow();

    expect(db.estimatedCostItem.create).not.toHaveBeenCalled();
  });

  it('rejects non-finite amounts', async () => {
    await expect(
      saveEstimatedCosts(gameId, nsoId, [costRow({ amount: Number.NaN })]),
    ).rejects.toThrow();
  });

  it('rejects blank cost names', async () => {
    await expect(
      saveEstimatedCosts(gameId, nsoId, [costRow({ category: '   ' })]),
    ).rejects.toThrow();
  });

  it('rejects blank unit-of-measure values', async () => {
    await expect(
      saveEstimatedCosts(gameId, nsoId, [costRow({ unitOfMeasure: '' })]),
    ).rejects.toThrow();
  });

  it('rejects missing game-NSO associations', async () => {
    db.gameNso.findUnique.mockResolvedValue(null);
    db.gameNso.findFirst.mockResolvedValue(null);

    await expect(saveEstimatedCosts(gameId, nsoId, [costRow()])).rejects.toThrow();
    expect(db.estimatedCostItem.create).not.toHaveBeenCalled();
  });

  it('surfaces a Prisma write error', async () => {
    db.estimatedCostItem.create.mockRejectedValue(new Error('DB write failed'));

    await expect(saveEstimatedCosts(gameId, nsoId, [costRow()])).rejects.toThrow(
      /DB write failed/,
    );
  });
});
