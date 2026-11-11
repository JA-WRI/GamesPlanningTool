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

export default async function CalculatorPage() {
  const calculatorId = 1;
  const [
    initialTravelers,
    initialEstimatedCosts,
    initialTravelerDraft,
    initialEstimatedCostsDraft,
  ] = await Promise.all([
    getTravelerItems(calculatorId),
    getEstimatedCostItems(calculatorId),
    getDraftDocument(
      draftKeys.calculatorTravelers(calculatorId),
      DRAFT_SCHEMA_VERSION,
    ),
    getDraftDocument(
      draftKeys.calculatorEstimatedCosts(calculatorId),
      DRAFT_SCHEMA_VERSION,
    ),
  ]);

  return (
    <CalculatorClient
      calculatorId={calculatorId}
      initialTravelers={initialTravelers}
      initialTravelerDraft={initialTravelerDraft}
      initialEstimatedCosts={initialEstimatedCosts}
      initialEstimatedCostsDraft={initialEstimatedCostsDraft}
      onSaveTravelers={saveTravelerItems}
      onSaveEstimatedCosts={saveEstimatedCostItems}
    />
  );
}
