// Hotel pricing UI adapted from PR #64; database integration assisted by AI.

'use client';

import { Box } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';

import { OCCUPANCY_TYPES, type HotelPricingData } from '../hotel-pricing';

export type HotelPricingRow = Record<string, unknown> & {
  id: string;
  hotel: string;
};

export default function HotelPricingTable({
  hotels,
}: {
  readonly hotels: HotelPricingData[];
}) {
  const occupancyTypes = OCCUPANCY_TYPES;
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

  const rows: HotelPricingRow[] = hotels.map(({ id, hotel, prices }) => ({
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
        key={JSON.stringify(rows)}
        title="HOTEL PRICING"
        description="Prices per room, per night."
        initialData={rows}
        columns={columns}
        createEmptyRow={() => ({ id: crypto.randomUUID(), hotel: '' })}
        readOnly
        showSearch={false}
        minWidth={420 + occupancyTypes.length * 160}
      />
      {hotels.length === 0 && (
        <p role="status">No hotel pricing configured for this game.</p>
      )}
    </Box>
  );
}
