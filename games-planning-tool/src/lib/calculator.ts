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
    include: {
        game: {
            select: {
                name: true,
            },
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
        where: {
            gameNsoId: gameNso.id,
        },
        orderBy: { id: 'asc' },
      }),

      prisma.conversionRate.findMany(),
    ]);

    
const usdRate = conversionRates.find(
  (item) => item.fromCurrency === 'USD' && item.toCurrency === 'CAD',
);

const eurRate = conversionRates.find(
  (item) => item.fromCurrency === 'EUR' && item.toCurrency === 'CAD',
);

if (!usdRate || !eurRate) {
  throw new Error('Required conversion rates are missing from the database');
}

const rates = {
  CAD: 1,
  USD: Number(usdRate.rate),
  EUR: Number(eurRate.rate),
};

if (Object.values(rates).some((rate) => !Number.isFinite(rate) || rate <= 0)) {
  throw new Error('Invalid conversion rates in the database');
}


  return {
    gameId,
    nsoId,
    gameName: gameNso.game.name,
    categories,
    travelers,
    estimatedCosts,
    rates,
  };
}
