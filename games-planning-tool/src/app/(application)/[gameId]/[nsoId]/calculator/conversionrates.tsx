// 80% AI generated code:
// The following was AI generated:
// - Currency selector component structure
// - css converted to tailwind
// The options and layout were reviewed and modified to match the calculator requirements.

'use client';

import { useState } from 'react';
import { Box, MenuItem, Paper, TextField, Typography } from '@mui/material';

const CURRENCIES = ['EUR', 'USD', 'CAD'] as const;

export default function ConversionRates() {
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>('CAD');

  return (
    <Paper
      className="calculator-content-panel calculator-rates"
      variant="outlined"
    >
      <Box className="calculator-content-section-heading">
        <Typography>Currency</Typography>
      </Box>

      <Box className="calculator-rates-grid">
        <TextField
          className="calculator-rate-currency"
          select
          size="small"
          value={currency}
          onChange={(event) =>
            setCurrency(event.target.value as (typeof CURRENCIES)[number])
          }
          slotProps={{ select: { 'aria-label': 'Select currency' } }}
        >
          {CURRENCIES.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Paper>
  );
}
