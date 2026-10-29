// I used AI to accelerate the process and fill hardcoded data (50%)

'use client';

import { Box, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import { CONVERSION_RATES, type Currency } from './ConversionRates';

export type CostSummaryData = {
  accommodation: number;
  travel: number;
  food: number;
  insurance: number;
  cellphone: number;
  clothingPerTraveler: number;
  travelers: number;
  bedNights: number;
  properties?: number;
};

type SummaryRow = Record<string, unknown> & {
  id: string;
  category: string;
  amount: string;
};

const columns: ColumnDefinition<SummaryRow>[] = [
  { field: 'category', label: 'Cost category', width: '65%' },
  { field: 'amount', label: 'Total cost', align: 'right' },
];

export default function CostSummary({
  data,
  currency = 'CAD',
  onSave,
  onExport,
  onDuplicate,
}: {
  readonly data: CostSummaryData;
  readonly currency?: Currency;
  readonly onSave?: () => void;
  readonly onExport?: () => void;
  readonly onDuplicate?: () => void;
}) {
  const money = (amount: number) =>
    new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount / CONVERSION_RATES[currency]);
  const categories = [
    ['accommodation', 'Accommodation', data.accommodation],
    ['travel', 'Travel', data.travel],
    ['food', 'Food & Meals', data.food],
    ['insurance', 'Insurance', data.insurance],
    ['cellphone', 'SIM / Cell', data.cellphone],
  ] as const;
  const rows: SummaryRow[] = categories.map(([id, category, amount]) => ({
    id,
    category,
    amount: money(amount),
  }));
  const total = categories.reduce((sum, [, , amount]) => sum + amount, 0);

  return (
    <Box
      component="section"
      aria-label="Cost summary"
      className="relative mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-burgundy"
    >
      <Box className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-widest text-muted">
          COST SUMMARY
        </h2>
      </Box>
      <Box className="grid min-w-0 gap-8 lg:grid-cols-2">
        <Box className="min-w-0">
          <Box className="[&>div]:border-0 [&>div]:p-0 [&>div]:shadow-none [&>div>div:first-child]:sr-only [&_.MuiTableContainer-root]:border-0 [&_.MuiTableContainer-root]:rounded-none [&_.MuiTableHead-root]:sr-only [&_.MuiTableCell-root]:h-12 [&_.MuiTableCell-root]:px-0 [&_td:first-child_span]:text-muted [&_td:last-child_span]:font-semibold [&_td:last-child_span]:tabular-nums">
            <BaseGridPage<SummaryRow>
              key={JSON.stringify(rows)}
              title="Cost breakdown"
              initialData={rows}
              columns={columns}
              createEmptyRow={() => ({ id: '', category: '', amount: '' })}
              readOnly
              showSearch={false}
              fitWidth
            />
          </Box>
          <Box className="mt-3 flex items-start gap-2 rounded-xl border border-gray-100 bg-stone-50 p-4 text-xs leading-5 text-muted">
            <CalculateOutlinedIcon fontSize="small" />
            <p>
              Totals use saved per-person calculator budgets multiplied by team
              members. SIM / Cell uses estimated cost per day and days on site.
              Clothing is shown separately.
            </p>
          </Box>
        </Box>
        <Box className="min-w-0">
          <Box className="rounded-2xl border border-gray-200 bg-stone-50 p-6">
            <h3 className="text-xs font-semibold text-muted">
              ESTIMATED TOTAL
            </h3>
            <p
              className="mt-2 text-4xl font-bold text-burgundy"
              aria-label="Estimated total"
            >
              {money(total)}
            </p>
            <p className="mt-2 text-xs italic text-muted">
              Excludes clothing packages (individual need)
            </p>
            <Box className="mt-6 border-t border-gray-200 pt-5">
              <Box className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-muted">Clothing if applicable</span>
                <span className="font-semibold tabular-nums">
                  {money(data.travelers * data.clothingPerTraveler)}{' '}
                  <span className="ml-1 text-xs font-normal text-muted">
                    ({data.travelers} × {money(data.clothingPerTraveler)})
                  </span>
                </span>
              </Box>
              <p className="mt-4 text-xs text-muted">
                {data.travelers} travelers • {data.bedNights} total
                traveler-days
                {data.properties !== undefined &&
                  ` • ${data.properties} properties selected`}
              </p>
            </Box>
          </Box>
          <Box className="mt-6 flex flex-wrap gap-3 [&_.MuiButton-root]:normal-case [&_.MuiButton-root]:text-xs">
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={onSave}
              disabled={!onSave}
              className="rounded-full! bg-burgundy! px-5! py-3! text-white! disabled:opacity-50"
            >
              Save • View Final Sheet
            </Button>
            <Button variant="outlined" onClick={onExport} disabled={!onExport}>
              Export to Reconciliation Tracker
            </Button>
            <Button
              variant="outlined"
              onClick={onDuplicate}
              disabled={!onDuplicate}
            >
              Duplicate Estimator
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
