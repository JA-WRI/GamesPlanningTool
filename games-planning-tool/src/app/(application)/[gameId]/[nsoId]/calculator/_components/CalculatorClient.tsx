// No AI code
'use client';

import { Box } from '@mui/material';
import CalculatorContent from './CalculatorContent';

export default function CalculatorClient() {
  return (
    <Box component="main" className="min-h-full px-4 py-5">
      <CalculatorContent calculatorId={1} />
    </Box>
  );
}
