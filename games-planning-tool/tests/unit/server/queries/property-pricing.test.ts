//AI usage: over 50%
import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/prisma', () => ({
  prisma: { gameProperty: { findMany: vi.fn() } },
}));
import { prisma } from '@/lib/prisma';
import { getPropertyPricing } from '@/server/queries/property-pricing';

const findMany = vi.mocked(prisma.gameProperty.findMany);

const decimal = (value: string) => ({ toFixed: () => value });
const occupancy = (code: string, sortOrder: number) => ({
  code,
  label: `Price for ${code}`,
  sortOrder,
});

describe('property pricing query', () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it('filters each request by game and serializes decimals without filling missing prices', async () => {
    findMany.mockResolvedValue([
      {
        id: 'gp-a',
        property: {
          name: 'UNA Mediterraneo',
          cluster: { name: 'Milano' },
          prices: [
            { price: decimal('375.00'), occupancyType: occupancy('single', 1) },
            { price: decimal('0.00'), occupancyType: occupancy('double', 2) },
          ],
        },
      },
    ] as never);

    expect(await getPropertyPricing(7)).toEqual({
      columns: [
        { code: 'single', label: 'Price for single' },
        { code: 'double', label: 'Price for double' },
      ],
      rows: [
        {
          id: 'gp-a',
          clusterName: 'Milano',
          name: 'UNA Mediterraneo',
          prices: { single: '375.00', double: '0.00' },
        },
      ],
    });
    expect(findMany.mock.calls[0][0]?.where).toEqual({ gameId: 7 });

    findMany.mockResolvedValue([]);
    expect(await getPropertyPricing(8)).toEqual({ columns: [], rows: [] });
    expect(findMany.mock.calls[1][0]?.where).toEqual({ gameId: 8 });
  });

  it('adds a column when any property offers it, and leaves the others without that price', async () => {
    findMany.mockResolvedValue([
      {
        id: 'gp-a',
        property: {
          name: 'UNA Mediterraneo',
          cluster: { name: 'Milano' },
          prices: [
            { price: decimal('375.00'), occupancyType: occupancy('single', 1) },
            { price: decimal('900.00'), occupancyType: occupancy('triple', 3) },
          ],
        },
      },
      {
        id: 'gp-b',
        property: {
          name: 'NH Milano Fiera',
          cluster: { name: 'Milano' },
          prices: [
            { price: decimal('375.00'), occupancyType: occupancy('single', 1) },
          ],
        },
      },
    ] as never);

    const table = await getPropertyPricing(1);

    expect(table.columns.map((c) => c.code)).toEqual(['single', 'triple']);
    expect(table.rows[0].prices).toEqual({
      single: '375.00',
      triple: '900.00',
    });
    expect(table.rows[1].prices).toEqual({ single: '375.00' });
    expect(table.rows[1].prices).not.toHaveProperty('triple');
  });

  it('orders columns by sortOrder regardless of the order prices are returned in', async () => {
    findMany.mockResolvedValue([
      {
        id: 'gp-a',
        property: {
          name: 'Hotel A',
          cluster: { name: 'Milano' },
          prices: [
            { price: decimal('900.00'), occupancyType: occupancy('triple', 3) },
            { price: decimal('375.00'), occupancyType: occupancy('single', 1) },
            { price: decimal('750.00'), occupancyType: occupancy('double', 2) },
          ],
        },
      },
    ] as never);

    const table = await getPropertyPricing(1);

    expect(table.columns.map((c) => c.code)).toEqual([
      'single',
      'double',
      'triple',
    ]);
  });

  it('keeps properties from different clusters in one table', async () => {
    findMany.mockResolvedValue([
      {
        id: 'gp-a',
        property: {
          name: 'Hotel A',
          cluster: { name: 'Milano' },
          prices: [
            { price: decimal('375.00'), occupancyType: occupancy('single', 1) },
          ],
        },
      },
      {
        id: 'gp-b',
        property: {
          name: 'Hotel B',
          cluster: { name: 'Como' },
          prices: [
            { price: decimal('400.00'), occupancyType: occupancy('single', 1) },
          ],
        },
      },
    ] as never);

    const table = await getPropertyPricing(1);

    expect(table.rows.map((r) => r.clusterName)).toEqual(['Milano', 'Como']);
    expect(table.columns).toHaveLength(1);
  });

  it.each([0, -1, NaN, 1.5, 2147483648])(
    'rejects invalid game ID %s before querying',
    async (id) => {
      await expect(getPropertyPricing(id)).rejects.toThrow('Invalid game ID');
      expect(findMany).not.toHaveBeenCalled();
    },
  );

  it('propagates failures for the section to handle', async () => {
    findMany.mockRejectedValue(new Error('database unavailable'));
    await expect(getPropertyPricing(1)).rejects.toThrow('database unavailable');
  });
});
