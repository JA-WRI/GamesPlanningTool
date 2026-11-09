// No AI code
'use client';

import { Box } from '@mui/material';
import CalculatorContent from './CalculatorContent';
import type { getCalculatorData } from '@/lib/calculator';

export type CalculatorData = NonNullable<
  Awaited<ReturnType<typeof getCalculatorData>>
>;

type CalculatorClientProps = {
  readonly initialData?: CalculatorData;
};

export default function CalculatorClient({ initialData }: CalculatorClientProps) {
  return (
    <Box component="main" className="min-h-full px-4 py-5">
      <CalculatorContent calculatorId={1} initialData={initialData} />
    </Box>
  );
}
