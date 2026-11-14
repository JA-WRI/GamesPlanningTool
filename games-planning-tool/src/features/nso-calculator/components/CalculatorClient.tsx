// 20% AI for fixing integration due to merge conflict
'use client';

import { Box } from '@mui/material';
import CalculatorContent, {
  type CalculatorContentHandle,
} from './CalculatorContent';
import EstimatedCosts from './EstimatedCosts';
import type { CalculatorRow } from './CalculatorContent';
import type { EstimatedCostRow } from './EstimatedCosts';
import { useRef, useState } from 'react';
import { type Currency, type CurrencyRates } from './ConversionRates';

export default function CalculatorClient({
  rates,
  categories,
  calculatorId,
  travelerDraftKey,
  estimatedCostsDraftKey,
  initialTravelers,
  initialTravelerDraft,
  initialEstimatedCosts,
  initialEstimatedCostsDraft,
  onSaveTravelers,
  onSaveEstimatedCosts,
  gameName,
  children,
}: {
  readonly rates: CurrencyRates;
  readonly categories: { name: string }[];
  readonly calculatorId: number;
  readonly gameName: string;
  readonly children?: React.ReactNode;
  readonly travelerDraftKey: string;
  readonly estimatedCostsDraftKey: string;
  readonly initialTravelers?: CalculatorRow[];
  readonly initialTravelerDraft?: unknown;
  readonly initialEstimatedCosts?: EstimatedCostRow[];
  readonly initialEstimatedCostsDraft?: unknown;
  readonly onSaveTravelers: (
    calculatorId: number,
    rows: CalculatorRow[],
  ) => Promise<CalculatorRow[]>;
  readonly onSaveEstimatedCosts: (
    calculatorId: number,
    rows: EstimatedCostRow[],
  ) => Promise<EstimatedCostRow[]>;
}) {
  const [currency, setCurrency] = useState<Currency>('CAD');
  const travelerGrid = useRef<CalculatorContentHandle>(null);

  return (
    <Box component="main" className="min-h-full px-4 py-5 space-y-10">
      <CalculatorContent
        rates={rates}
        categories={categories}
        ref={travelerGrid}
        calculatorId={calculatorId}
        gameName={gameName}
        currency={currency}
        initialItems={initialTravelers}
        initialDraft={initialTravelerDraft}
        draftKey={travelerDraftKey}
        onSaveAction={onSaveTravelers}
      />
      <EstimatedCosts
        rates={rates}
        calculatorId={calculatorId}
        initialItems={initialEstimatedCosts}
        initialDraft={initialEstimatedCostsDraft}
        draftKey={estimatedCostsDraftKey}
        onSaveAction={onSaveEstimatedCosts}
        currency={currency}
        onCurrencyChange={(nextCurrency) => {
          travelerGrid.current?.prepareCurrencyChange();
          setCurrency(nextCurrency);
        }}
      />
      {children}
    </Box>
  );
}
