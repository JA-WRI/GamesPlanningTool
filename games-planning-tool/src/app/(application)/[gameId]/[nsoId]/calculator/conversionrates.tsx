// 50% AI generated code:
// The following was AI generated:
// - Currency selector component structure
// - css converted to tailwind
// - ai used for styling
// The options and layout were reviewed and modified to match the calculator requirements.

'use client';

import { Box, Button, Typography } from '@mui/material';

export type Currency = 'CAD' | 'USD' | 'EUR';

// TO DELETE: will be connected to db to update teh conversion rates
export const CONVERSION_RATES: Record<Currency, number> = {
  CAD: 1,
  USD: 1.38,
  EUR: 1.48,
};

type ConversionRatesProps = {
  readonly currency: Currency;
  readonly onCurrencyChange: (currency: Currency) => void;
};

export default function ConversionRates({currency, onCurrencyChange,}: Readonly<ConversionRatesProps>) {

  return (
    <Box className="flex flex-wrap items-center justify-between gap-4 border-t px-4 py-3">
            <Box className="flex flex-wrap items-center gap-3">
        <Typography className="text-[11px]! font-semibold! tracking-wide! text-[#777]!">
          CONVERSIONS
        </Typography>

        <Box className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
          <Typography className="text-[12px]!">
            USD → CAD{' '}
            <span className="font-semibold">
              {CONVERSION_RATES.USD.toFixed(2)}
            </span>
          </Typography>
        </Box>

        <Box className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2">
          <Typography className="text-[12px]!">
            EUR → CAD{' '}
            <span className="font-semibold">
              {CONVERSION_RATES.EUR.toFixed(2)}
            </span>
          </Typography>
        </Box>
      </Box>

      <Box
        role="group"
        aria-label="Select calculator currency"
        className="flex items-center gap-1 rounded-full border border-gray-300 p-1"
      >
        {(['CAD', 'USD', 'EUR'] as const).map((option) => (
          <Button
            key={option}
            size="small"
            aria-pressed={currency === option}
            onClick={() => onCurrencyChange(option)}
            className={`min-w-[52px]! rounded-full! px-3! normal-case! ${
              currency === option
                ? 'bg-[#252b37]! text-white!'
                : 'text-[#252b37]!'
            }`}
          >
            {option}
          </Button>
        ))}
      </Box>
    </Box>
   
  );
}
