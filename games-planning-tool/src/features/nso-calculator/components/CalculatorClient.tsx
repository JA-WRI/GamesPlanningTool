// No AI code
'use client';

import { Box } from '@mui/material';
import CalculatorContent from './CalculatorContent';
import EstimatedCosts from './EstimatedCosts';
import type { CalculatorRow } from './CalculatorContent';
import type { EstimatedCostRow } from './EstimatedCosts';
import { useState } from 'react';
import { type Currency } from './ConversionRates';

export default function CalculatorClient({
  calculatorId,
  initialTravelers,
  initialEstimatedCosts,
  onSaveTravelers,
  onSaveEstimatedCosts,
}: {
  readonly calculatorId: number;
  readonly initialTravelers?: CalculatorRow[];
  readonly initialEstimatedCosts?: EstimatedCostRow[];
  readonly onSaveTravelers?: (
    calculatorId: number,
    rows: CalculatorRow[],
  ) => Promise<CalculatorRow[]>;
  readonly onSaveEstimatedCosts?: (
    calculatorId: number,
    rows: EstimatedCostRow[],
  ) => Promise<EstimatedCostRow[]>;
}) {
  const [currency, setCurrency] = useState<Currency>('CAD');

  return (
    <Box component="main" className="min-h-full px-4 py-5 space-y-10">
      <CalculatorContent
        calculatorId={calculatorId}
        initialItems={initialTravelers}
        onSaveAction={(id, rows) =>
          onSaveTravelers ? onSaveTravelers(id, rows) : Promise.resolve(rows)
        }
      />
      <EstimatedCosts
        calculatorId={calculatorId}
        initialItems={initialEstimatedCosts}
        onSaveAction={(id, rows) =>
          onSaveEstimatedCosts
            ? onSaveEstimatedCosts(id, rows)
            : Promise.resolve(rows)
        }
        currency={currency}
        onCurrencyChange={setCurrency}
      />
    </Box>
  );
}
