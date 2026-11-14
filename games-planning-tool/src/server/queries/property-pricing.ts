//AI usage: over 50%
import 'server-only';
import { prisma } from '@/lib/prisma';
import type {
  PropertyPricingColumn,
  PropertyPricingRow,
  PropertyPricingTable,
} from '@/features/nso-calculator/property-pricing';

export async function getPropertyPricing(
  gameId: number,
): Promise<PropertyPricingTable> {
  if (!Number.isSafeInteger(gameId) || gameId <= 0 || gameId > 2147483647) {
    throw new Error('Invalid game ID');
  }

  const gameProperties = await prisma.gameProperty.findMany({
    where: { gameId },
    orderBy: [
      { displayOrder: 'asc' },
      { property: { name: 'asc' } },
      { id: 'asc' },
    ],
    select: {
      id: true,
      property: {
        select: {
          name: true,
          cluster: { select: { name: true } },
          prices: {
            select: {
              price: true,
              occupancyType: {
                select: { code: true, label: true, sortOrder: true },
              },
            },
          },
        },
      },
    },
  });

  // One column per occupancy type offered by at least one property in the game
  const columns = new Map<
    string,
    PropertyPricingColumn & { sortOrder: number }
  >();
  const rows: PropertyPricingRow[] = [];

  for (const { id, property } of gameProperties) {
    for (const { occupancyType } of property.prices) {
      columns.set(occupancyType.code, occupancyType);
    }
    rows.push({
      id,
      clusterName: property.cluster.name,
      name: property.name,
      prices: Object.fromEntries(
        property.prices.map(({ occupancyType, price }) => [
          occupancyType.code,
          price.toFixed(2),
        ]),
      ),
    });
  }

  return {
    columns: [...columns.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ code, label }) => ({ code, label })),
    rows,
  };
}
