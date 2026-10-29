// I used AI to accelerate the process and fill hardcoded data (50%)

'use client';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import ConversionRates, {
  CONVERSION_RATES,
  type Currency,
} from './ConversionRates';

// Replace this configuration and the placeholder prices with admin data later.
export const OCCUPANCY_TYPES: readonly string[] = [
  'single',
  'double',
  'triple',
];

export type HotelPricingRow = Record<string, unknown> & {
  id: string;
  hotel: string;
};

export const HOTELS = [
  {
    id: 'una-mediterraneo',
    hotel: 'Milano - UNA Mediterraneo',
    prices: { single: 750, double: 375, triple: 900 },
  },
  {
    id: 'nh-congress-centre',
    hotel: 'Milano - NH Milano Congress Centre',
    prices: { single: 750, double: 375 },
  },
  {
    id: 'nh-fiera',
    hotel: 'Milano - NH Milano Fiera',
    prices: { single: 750, double: 375 },
  },
] satisfies { id: string; hotel: string; prices: Record<string, number> }[];

export default function HotelPricingTable({
  occupancyTypes = OCCUPANCY_TYPES,
  onSavedRowsChange,
}: {
  readonly occupancyTypes?: readonly string[];
  readonly onSavedRowsChange?: (rows: HotelPricingRow[]) => void;
}) {
  const columns: ColumnDefinition<HotelPricingRow>[] = [
    { field: 'hotel', label: 'Hotel', width: '45%' },
    ...occupancyTypes.map((occupancy): ColumnDefinition<HotelPricingRow> => ({
      field: `price_${occupancy}`,
      label: `Price for ${occupancy}`,
      type: 'number',
      min: 0,
      step: 0.01,
      allowedTextValues: ['-'],
      align: 'center',
    })),
  ];

  const [currency, setCurrency] = useState<Currency>('CAD');
  const [savedCAD, setSavedCAD] = useState<HotelPricingRow[]>(() =>
    HOTELS.map(({ id, hotel, prices }) => ({
      id,
      hotel,
      ...Object.fromEntries(
        Object.entries(prices).map(([occupancy, price]) => [
          `price_${occupancy}`,
          price,
        ]),
      ),
    })),
  );

  useEffect(() => {
    onSavedRowsChange?.(savedCAD);
  }, [savedCAD, onSavedRowsChange]);

  const convertPrices = (
    rows: HotelPricingRow[],
    multiplier: number,
  ): HotelPricingRow[] =>
    rows.map((row) => ({
      ...row,
      ...Object.fromEntries(
        Object.entries(row)
          .filter(([field]) => field.startsWith('price_'))
          .map(([field, value]) => [
            field,
            value !== '' && value !== '-' && Number.isFinite(Number(value))
              ? Number((Number(value) * multiplier).toFixed(2))
              : value,
          ]),
      ),
    }));

  return (
    <Box className="mt-10 min-w-0 [&_.MuiTableCell-root]:h-[70px] [&>div:first-child]:rounded-b-none [&>div:first-child]:border-b-0">
      <BaseGridPage<HotelPricingRow>
        key={currency}
        title="HOTEL PRICING"
        initialData={convertPrices(savedCAD, 1 / CONVERSION_RATES[currency])}
        columns={columns}
        createEmptyRow={() => ({ id: crypto.randomUUID(), hotel: '' })}
        addButtonLabel="Add New Hotel"
        showSearch={false}
        minWidth={420 + occupancyTypes.length * 160}
        onSave={(rows) =>
          setSavedCAD(convertPrices(rows, CONVERSION_RATES[currency]))
        }
      />
      <Box className="rounded-b-lg border-x border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <ConversionRates currency={currency} onCurrencyChange={setCurrency} />
      </Box>
    </Box>
  );
}
