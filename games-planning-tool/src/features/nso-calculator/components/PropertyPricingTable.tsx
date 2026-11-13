//AI usage: over 50%
'use client';

import { Box } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';

import type { PropertyPricingTable as PropertyPricingTableData } from '../property-pricing';

type PropertyGridRow = Record<string, unknown> & {
  id: string;
  name: string;
};

export default function PropertyPricingTable({
  table,
}: {
  readonly table: PropertyPricingTableData;
}) {
  const columns: ColumnDefinition<PropertyGridRow>[] = [
    { field: 'name', label: 'Property', width: '45%' },
    ...table.columns.map(
      ({ code, label }): ColumnDefinition<PropertyGridRow> => ({
        field: `price_${code}`,
        label,
        type: 'number',
        min: 0,
        step: 0.01,
        allowedTextValues: ['-'],
        align: 'center',
      }),
    ),
  ];

  const rows: PropertyGridRow[] = table.rows.map(
    ({ id, clusterName, name, prices }) => ({
      id,
      name: `${clusterName} - ${name}`,
      ...Object.fromEntries(
        table.columns.map(({ code }) => [`price_${code}`, prices[code] ?? '-']),
      ),
    }),
  );

  return (
    <Box className="mt-10 min-w-0 [&_.MuiTableCell-root]:h-[70px]">
      <BaseGridPage<PropertyGridRow>
        key={JSON.stringify(rows)}
        title="PROPERTY PRICING"
        description="Prices per room, per night."
        initialData={rows}
        columns={columns}
        createEmptyRow={() => ({ id: crypto.randomUUID(), name: '' })}
        readOnly
        showSearch={false}
        minWidth={420 + table.columns.length * 160}
      />
      {table.rows.length === 0 && (
        <p role="status">No property pricing configured for this game.</p>
      )}
    </Box>
  );
}
