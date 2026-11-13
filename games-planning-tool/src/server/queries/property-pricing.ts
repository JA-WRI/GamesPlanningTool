//AI usage: over 50%
import 'server-only';
import { prisma } from '@/lib/prisma';

export type PropertyPricingColumn = {
  code: string;
  label: string;
};

export type PropertyPricingRow = {
  id: string; // GameProperty id
  name: string; // property name
  prices: Record<string, string>; // occupancy code -> "375.00"; missing key = not offered
};

export type PropertyPricingTable = {
  clusterId: string;
  clusterName: string;
  columns: PropertyPricingColumn[];
  rows: PropertyPricingRow[];
};

export async function getPropertyPricing(
  gameId: number,
): Promise<PropertyPricingTable[]> {
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
          cluster: { select: { id: true, name: true } },
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

  // Group by cluster, keeping the order in which clusters first appear
  const tables = new Map<
    string,
    {
      clusterId: string;
      clusterName: string;
      columns: Map<string, PropertyPricingColumn & { sortOrder: number }>;
      rows: PropertyPricingRow[];
    }
  >();

  for (const gp of gameProperties) {
    const { cluster, name, prices } = gp.property;

    let table = tables.get(cluster.id);
    if (!table) {
      table = {
        clusterId: cluster.id,
        clusterName: cluster.name,
        columns: new Map(),
        rows: [],
      };
      tables.set(cluster.id, table);
    }

    // A column exists if at least one property in the cluster has that occupancy
    for (const { occupancyType } of prices) {
      table.columns.set(occupancyType.code, occupancyType);
    }

    table.rows.push({
      id: gp.id,
      name,
      prices: Object.fromEntries(
        prices.map(({ occupancyType, price }) => [
          occupancyType.code,
          price.toFixed(2),
        ]),
      ),
    });
  }

  return [...tables.values()].map(({ columns, ...table }) => ({
    ...table,
    columns: [...columns.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ code, label }) => ({ code, label })),
  }));
}
