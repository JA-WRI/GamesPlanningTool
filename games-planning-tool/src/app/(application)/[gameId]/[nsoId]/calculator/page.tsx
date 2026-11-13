import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import HotelPricingSection from '@/features/nso-calculator/components/HotelPricingSection';
import { getGamesWithNsos } from '@/server/queries/games';
import { getSession } from '@/lib/data';
import { findGame, gamesForUser } from '@/lib/routing/Navigation';

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const [{ gameId, nsoId }, games, session] = await Promise.all([
    params,
    getGamesWithNsos(),
    getSession(),
  ]);
  const game = findGame(
    gamesForUser(games, session.user.role, session.user.nsoId),
    gameId,
  );
  if (
    !game ||
    !game.nsos.some((nso) => nso.id === nsoId) ||
    (session.user.role === 'nso' && session.user.nsoId !== nsoId)
  )
    notFound();

  return (
    <CalculatorClient gameName={game.name}>
      <Suspense
        key={game.id}
        fallback={
          <p role="status" className="mt-10 p-6">
            Loading hotel pricing…
          </p>
        }
      >
        <HotelPricingSection gameId={game.id} />
      </Suspense>
    </CalculatorClient>
  );
}
