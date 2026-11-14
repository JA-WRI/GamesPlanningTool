// about 50% ai coverage
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { getCalculatorData } from '@/lib/calculator';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    gameNso: { findUnique: vi.fn() },
    travelerCategory: { findMany: vi.fn() },
    traveler: { findMany: vi.fn() },
    estimatedCostItem: { findMany: vi.fn() },
    conversionRate: { findMany: vi.fn() },
  },
}));

const gameId = 1;
const nsoId = '550e8400-e29b-41d4-a716-446655440000';
const gameNsoId = 'a6f17f9c-5e3e-4bd1-8c1d-24abac44b123';

describe('getCalculatorData', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(prisma.gameNso.findUnique).mockResolvedValue({
      id: gameNsoId,
      game: { name: 'Summer Games 2028' },
    } as never);

    vi.mocked(prisma.travelerCategory.findMany)
      .mockResolvedValue([{ id: 1, name: 'Athletes' }] as never);

    vi.mocked(prisma.traveler.findMany)
      .mockResolvedValue([] as never);

    vi.mocked(prisma.estimatedCostItem.findMany)
      .mockResolvedValue([] as never);

    vi.mocked(prisma.conversionRate.findMany).mockResolvedValue([
      { fromCurrency: 'USD', toCurrency: 'CAD', rate: '1.38' },
      { fromCurrency: 'EUR', toCurrency: 'CAD', rate: '1.48' },
    ] as never);
  });

  it('returns null for a game-NSO pair that does not exist', async () => {
    vi.mocked(prisma.gameNso.findUnique).mockResolvedValue(null);

    expect(await getCalculatorData(gameId, nsoId)).toBeNull();
    expect(prisma.traveler.findMany).not.toHaveBeenCalled();
  });

  it('fetches the game title', async () => {
    const data = await getCalculatorData(gameId, nsoId);

    expect(data?.gameName).toBe('Summer Games 2028');
  });

  it('fetches travelers for only the selected game and NSO', async () => {
    await getCalculatorData(gameId, nsoId);

    expect(prisma.traveler.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { gameId, nsoId },
      }),
    );
  });

  it('fetches Estimated Costs for only the selected game-NSO pair', async () => {
    await getCalculatorData(gameId, nsoId);

    expect(prisma.estimatedCostItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { gameNsoId },
      }),
    );
  });

  it('uses exchange rates fetched from Prisma', async () => {
    const data = await getCalculatorData(gameId, nsoId);

    expect(data?.rates).toEqual({
      CAD: 1,
      USD: 1.38,
      EUR: 1.48,
    });
  });

  it('rejects missing required exchange rates', async () => {
    vi.mocked(prisma.conversionRate.findMany).mockResolvedValue(
      [{ fromCurrency: 'USD', toCurrency: 'CAD', rate: '1.38' }] as never,
    );

    await expect(getCalculatorData(gameId, nsoId)).rejects.toThrow();
  });

  it('rejects invalid exchange rates', async () => {
    vi.mocked(prisma.conversionRate.findMany).mockResolvedValue([
      { fromCurrency: 'USD', toCurrency: 'CAD', rate: '0' },
      { fromCurrency: 'EUR', toCurrency: 'CAD', rate: '1.48' },
    ] as never);

    await expect(getCalculatorData(gameId, nsoId)).rejects.toThrow();
  });
});
