// AI contributed to the hotel pricing table and placeholder data.

'use client';

import { Box } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';

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
}: {
  readonly occupancyTypes?: readonly string[];
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

  const rows: HotelPricingRow[] = HOTELS.map(({ id, hotel, prices }) => ({
    id,
    hotel,
    ...Object.fromEntries(
      Object.entries(prices).map(([occupancy, price]) => [
        `price_${occupancy}`,
        price,
      ]),
    ),
  }));

  return (
    <Box className="mt-10 min-w-0 [&_.MuiTableCell-root]:h-[70px]">
      <BaseGridPage<HotelPricingRow>
        title="HOTEL PRICING"
        initialData={rows}
        columns={columns}
        createEmptyRow={() => ({ id: crypto.randomUUID(), hotel: '' })}
        readOnly
        showSearch={false}
        minWidth={420 + occupancyTypes.length * 160}
      />
    </Box>
  );
}
