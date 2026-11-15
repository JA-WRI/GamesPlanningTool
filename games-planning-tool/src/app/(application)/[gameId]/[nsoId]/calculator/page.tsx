// 30% AI generated
import { getCalculatorData } from '@/lib/calculator';
import {
  dbEstimatedCostToRow,
  dbTravelerToRow,
} from '@/features/nso-calculator/lib/canonicalMapping';
import { ConversionRatesError } from '@/lib/calculator-errors';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import {
  saveTravelerItems,
  saveEstimatedCostItems,
} from '@/features/nso-calculator/components/calculator-actions';
import { getDraftDocument } from '@/lib/draft-actions';
import { DRAFT_SCHEMA_VERSION, draftKeys } from '@/lib/draft-keys';
import PropertyPricingSection from '@/features/nso-calculator/components/PropertyPricingSection';
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
      getCalculatorData(game.id, nsoId).catch((error: unknown) => {
        if (!(error instanceof ConversionRatesError)) throw error;
        console.error(
          'Unable to load calculator conversion rates:',
          error.message,
        );
        return 'rates-unavailable' as const;
      }),
      getDraftDocument(travelerDraftKey, DRAFT_SCHEMA_VERSION),
      getDraftDocument(estimatedCostsDraftKey, DRAFT_SCHEMA_VERSION),
    ]);

  if (!calculatorData) notFound();
  if (calculatorData === 'rates-unavailable') {
    return (
      <section role="alert" className="p-6">
        Calculator unavailable: currency conversion rates are missing or
        invalid. Please contact an administrator.
      </section>
    );
  }

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
      initialEstimatedCosts={calculatorData.estimatedCosts.map(
        dbEstimatedCostToRow,
      )}
      initialEstimatedCostsDraft={initialEstimatedCostsDraft}
      onSaveTravelers={saveTravelerItems.bind(null, nsoId, gameId)}
      onSaveEstimatedCosts={saveEstimatedCostItems.bind(null, nsoId, gameId)}
      gameName={game.name}
    >
      <Suspense
        key={game.id}
        fallback={
          <p role="status" className="mt-10 p-6">
            Loading property pricing…
          </p>
        }
      >
        <PropertyPricingSection gameId={game.id} />
      </Suspense>
    </CalculatorClient>
  );
}
