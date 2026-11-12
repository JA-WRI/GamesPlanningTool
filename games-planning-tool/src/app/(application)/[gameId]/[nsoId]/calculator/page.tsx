// No AI usage
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import {
  getTravelerItems,
  getEstimatedCostItems,
  saveTravelerItems,
  saveEstimatedCostItems,
} from '@/features/nso-calculator/components/calculator-actions';
import { getDraftDocument } from '@/lib/draft-actions';
import { DRAFT_SCHEMA_VERSION, draftKeys } from '@/lib/draft-keys';

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;
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
      calculatorId={calculatorId}
      travelerDraftKey={travelerDraftKey}
      estimatedCostsDraftKey={estimatedCostsDraftKey}
      initialTravelers={initialTravelers}
      initialTravelerDraft={initialTravelerDraft}
      initialEstimatedCosts={initialEstimatedCosts}
      initialEstimatedCostsDraft={initialEstimatedCostsDraft}
      onSaveTravelers={saveTravelerItems.bind(null, nsoId, gameId)}
      onSaveEstimatedCosts={saveEstimatedCostItems.bind(null, nsoId, gameId)}
    />
  );
}
