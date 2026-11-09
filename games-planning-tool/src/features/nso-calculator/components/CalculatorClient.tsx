// No AI code
'use client';

import { Box } from '@mui/material';
import CalculatorContent from './CalculatorContent';
import EstimatedCosts from './EstimatedCosts';
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
  readonly initialTravelers?: any[];
  readonly initialEstimatedCosts?: any[];
  readonly onSaveTravelers?: (
    calculatorId: number,
    rows: any[],
  ) => Promise<any[]>;
  readonly onSaveEstimatedCosts?: (
    calculatorId: number,
    rows: any[],
  ) => Promise<any[]>;
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
        currency={currency}
        onCurrencyChange={setCurrency}
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
