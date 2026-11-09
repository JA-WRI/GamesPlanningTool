// No AI usage
import CalculatorClient from '@/features/nso-calculator/components/CalculatorClient';
import {
  getTravelerItems,
  getEstimatedCostItems,
  saveTravelerItems,
  saveEstimatedCostItems,
} from '@/features/nso-calculator/components/calculator-actions';

export default async function CalculatorPage() {
  const calculatorId = 1;
  const initialTravelers = await getTravelerItems(calculatorId);
  const initialEstimatedCosts = await getEstimatedCostItems(calculatorId);

  return (
    <CalculatorClient
      calculatorId={calculatorId}
      initialTravelers={initialTravelers}
      initialEstimatedCosts={initialEstimatedCosts}
      onSaveTravelers={saveTravelerItems}
      onSaveEstimatedCosts={saveEstimatedCostItems}
    />
  );
}
