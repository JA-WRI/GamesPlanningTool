// 70% ai generated code
import { prisma } from '@/lib/prisma';

export async function getCalculatorData(gameId: number, nsoId: string) {
  // Make sure this NSO participates in the selected game
  const gameNso = await prisma.gameNso.findUnique({
    where: {
      gameId_nsoId: {
        gameId,
        nsoId,
      },
    },
  });

  if (!gameNso) {
    return null;
  }

  // Fetch calculator data
  const [categories, travelers, estimatedCosts, conversionRates] =
    await Promise.all([
      prisma.travelerCategory.findMany({
        orderBy: { id: 'asc' },
      }),

      prisma.traveler.findMany({
        where: { gameId, nsoId },
        include: { travelerCategory: true },
        orderBy: { id: 'asc' },
      }),

      prisma.estimatedCostItem.findMany({
        orderBy: { id: 'asc' },
      }),

      prisma.conversionRate.findMany(),
    ]);

  return {
    categories,
    travelers,
    estimatedCosts,
    conversionRates: conversionRates.map((conversion) => ({
      ...conversion,
      rate: Number(conversion.rate),
    })),
  };
}
