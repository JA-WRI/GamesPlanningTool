// No AI code
'use client';

import { Box } from '@mui/material';
import CalculatorContent from './CalculatorContent';

export default function CalculatorClient({
  gameName,
  children,
}: {
  readonly gameName: string;
  readonly children?: React.ReactNode;
}) {
  return (
    <Box component="main" className="min-h-full px-4 py-5">
      <CalculatorContent calculatorId={1} gameName={gameName}>
        {children}
      </CalculatorContent>
    </Box>
  );
}
