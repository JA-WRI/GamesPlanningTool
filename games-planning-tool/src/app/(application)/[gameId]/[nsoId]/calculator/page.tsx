// 30% AI generated
import { getCalculatorData } from '@/lib/calculator';
import { dbTravelerToRow } from '@/features/nso-calculator/lib/canonicalMapping';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import {
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
  const [calculatorData, initialTravelerDraft, initialEstimatedCostsDraft] =
    await Promise.all([
      getCalculatorData(game.id, nsoId),
      getDraftDocument(travelerDraftKey, DRAFT_SCHEMA_VERSION),
      getDraftDocument(estimatedCostsDraftKey, DRAFT_SCHEMA_VERSION),
    ]);

  if (!calculatorData) notFound();

  return (
    <CalculatorClient
      key={`${gameId}:${nsoId}:${calculatorId}`}
      calculatorId={calculatorId}
      travelerDraftKey={travelerDraftKey}
      estimatedCostsDraftKey={estimatedCostsDraftKey}
      rates={calculatorData.rates}
      categories={calculatorData.categories}
      initialTravelers={calculatorData.travelers.map(dbTravelerToRow)}
      initialTravelerDraft={initialTravelerDraft}
      initialEstimatedCosts={calculatorData.estimatedCosts.map((cost) => ({
        id: String(cost.id),
        category: cost.name,
        amount: cost.costInCents / 100,
        unitOfMeasure: cost.unitOfMeasure,
        notes: cost.notes ?? '',
      }))}
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
