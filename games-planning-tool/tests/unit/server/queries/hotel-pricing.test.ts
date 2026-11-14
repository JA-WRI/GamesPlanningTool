// AI-assisted tests; reviewed for calculator and hotel pricing requirements.
// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/prisma', () => ({
  prisma: { gameHotel: { findMany: vi.fn() } },
}));
import { prisma } from '@/lib/prisma';
import { getHotelPricing } from '@/server/queries/hotel-pricing';
const findMany = vi.mocked(prisma.gameHotel.findMany);
describe('hotel pricing query', () => {
  beforeEach(() => {
    findMany.mockReset();
  });
  it('filters each request by game and serializes decimals without filling missing rates', async () => {
    findMany.mockResolvedValue([
      {
        id: 'hotel-a',
        name: 'Hotel A',
        rates: [
          { occupancy: 'single', amount: { toFixed: () => '125.50' } },
          { occupancy: 'double', amount: { toFixed: () => '0.00' } },
        ],
      },
    ] as never);
    expect(await getHotelPricing(7)).toEqual([
      {
        id: 'hotel-a',
        hotel: 'Hotel A',
        prices: { single: '125.50', double: '0.00' },
      },
    ]);
    expect(findMany.mock.calls[0][0]?.where).toEqual({ gameId: 7 });
    findMany.mockResolvedValue([]);
    expect(await getHotelPricing(8)).toEqual([]);
    expect(findMany.mock.calls[1][0]?.where).toEqual({ gameId: 8 });
  });
  it.each([0, -1, NaN, 1.5, 2147483648])(
    'rejects invalid game ID %s before querying',
    async (id) => {
      await expect(getHotelPricing(id)).rejects.toThrow('Invalid game ID');
      expect(findMany).not.toHaveBeenCalled();
    },
  );
  it('propagates failures for the section to handle', async () => {
    findMany.mockRejectedValue(new Error('database unavailable'));
    await expect(getHotelPricing(1)).rejects.toThrow('database unavailable');
  });
});
