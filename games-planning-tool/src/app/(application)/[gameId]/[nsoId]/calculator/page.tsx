import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import {
  getTravelerItems,
  getEstimatedCostItems,
  saveTravelerItems,
  saveEstimatedCostItems,
} from '@/features/nso-calculator/components/calculator-actions';
import { getDraftDocument } from '@/lib/draft-actions';
import { DRAFT_SCHEMA_VERSION, draftKeys } from '@/lib/draft-keys';
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

  const calculatorId = 1;
  const travelerDraftKey = draftKeys.calculatorTravelers(
    calculatorId,
    gameId,
    nsoId,
  );
  const estimatedCostsDraftKey = draftKeys.calculatorEstimatedCosts(
    calculatorId,
    gameId,
    nsoId,
  );
  const [
    initialTravelers,
    initialEstimatedCosts,
    initialTravelerDraft,
    initialEstimatedCostsDraft,
  ] = await Promise.all([
    getTravelerItems(nsoId, gameId, calculatorId),
    getEstimatedCostItems(nsoId, gameId, calculatorId),
    getDraftDocument(travelerDraftKey, DRAFT_SCHEMA_VERSION),
    getDraftDocument(estimatedCostsDraftKey, DRAFT_SCHEMA_VERSION),
  ]);

  return (
    <CalculatorClient
      key={`${gameId}:${nsoId}:${calculatorId}`}
      calculatorId={calculatorId}
      travelerDraftKey={travelerDraftKey}
      estimatedCostsDraftKey={estimatedCostsDraftKey}
      initialTravelers={initialTravelers}
      initialTravelerDraft={initialTravelerDraft}
      initialEstimatedCosts={initialEstimatedCosts}
      initialEstimatedCostsDraft={initialEstimatedCostsDraft}
      onSaveTravelers={saveTravelerItems.bind(null, nsoId, gameId)}
      onSaveEstimatedCosts={saveEstimatedCostItems.bind(null, nsoId, gameId)}
      gameName={game.name}
    >
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
