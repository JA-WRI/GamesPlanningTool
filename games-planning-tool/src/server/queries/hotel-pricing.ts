import 'server-only';
import { prisma } from '@/lib/prisma';
import {
  OCCUPANCY_TYPES,
  type HotelPricingData,
} from '@/features/nso-calculator/hotel-pricing';

export async function getHotelPricing(
  gameId: number,
): Promise<HotelPricingData[]> {
  if (!Number.isSafeInteger(gameId) || gameId <= 0 || gameId > 2147483647) {
    throw new Error('Invalid game ID');
  }
  const hotels = await prisma.gameHotel.findMany({
    where: { gameId },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      rates: { select: { occupancy: true, amount: true } },
    },
  });
  return hotels.map(({ id, name, rates }) => ({
    id,
    hotel: name,
    prices: Object.fromEntries(
      rates
        .filter(({ occupancy }) =>
          OCCUPANCY_TYPES.some((value) => value === occupancy),
        )
        .map(({ occupancy, amount }) => [occupancy, amount.toFixed(2)]),
    ),
  }));
}
