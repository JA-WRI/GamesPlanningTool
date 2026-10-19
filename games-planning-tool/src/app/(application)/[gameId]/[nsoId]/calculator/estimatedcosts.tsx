// 60% AI generated code:
// The following was AI generated:
// - Original estimated cost component structure and MUI inputs
// - css converted to tailwind
// - used to help for the original currency logic
// The layout, cost categories, values, and styling were modified to match the wanted calculator design.
// The reusable grid component was impleted manually

'use client';

import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import ConversionRates, {
  type Currency,
  CONVERSION_RATES,
} from './conversionrates';

export type EstimatedCostsData = {
  clothingPackage: number;
  travelEconomyFare: number;
  athleteInsurance: number;
  supportStaffInsurance: number;
  cellphone: number;
  mealsPerDay: number;
  villageMealVoucher: number;
  knifeAndFork: number;
};

type EstimatedCostRow = Record<string, unknown> & {
  id: string;
  category: string;
  amount: number;
};

type EstimatedCostsProps = {
  readonly currency: Currency;
  readonly onCurrencyChange: (currency: Currency) => void;
};

const INITIAL_COST_ROWS: EstimatedCostRow[] = [
  { id: 'travelEconomyFare', category: 'Travel Economy Fare', amount: 2400 },
  { id: 'athleteInsurance', category: 'Athlete Insurance', amount: 50 },
  {
    id: 'supportStaffInsurance',
    category: 'Support Staff Insurance',
    amount: 28,
  },
  { id: 'cellphone', category: 'Cellphone (local plan)', amount: 108 },
  { id: 'mealsPerDay', category: 'Meals', amount: 118 },
  { id: 'villageMealVoucher', category: 'Village Meal Voucher', amount: 57 },
  { id: 'knifeAndFork', category: 'Knife & Fork for Ap', amount: 2279 },
  { id: 'clothingPackage', category: 'Clothing Package', amount: 3200 },
];

const columns: ColumnDefinition<EstimatedCostRow>[] = [
  { field: 'category', label: 'Estimated Cost', type: 'text', width: 300 },
  {
    field: 'amount',
    label: 'Amount (CAD)',
    type: 'number',
    min: 0,
    step: 0.01,
    width: 180,
  },
];

export default function EstimatedCosts({
  currency,
  onCurrencyChange,
}: Readonly<EstimatedCostsProps>) {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Keep saved amounts in CAD, even while another currency is displayed.
  const [savedCAD, setSavedCAD] = useState(() =>
    INITIAL_COST_ROWS.map((row) => ({ ...row })),
  );
  const draftCAD = useRef(savedCAD.map((row) => ({ ...row })));
  const [gridVersion, setGridVersion] = useState(0);
  const [renderRowsCAD, setRenderRowsCAD] = useState<EstimatedCostRow[]>(() =>
    INITIAL_COST_ROWS.map((row) => ({ ...row })),
  );

  const handleCurrencyChange = (nextCurrency: Currency) => {
    if (nextCurrency === currency) return;
    // Rebuild the grid using the current draft amounts converted from CAD.
    // The shared BaseGridPage does not expose its internal row state.
    setRenderRowsCAD(draftCAD.current.map((row) => ({ ...row })));
    setGridVersion((version) => version + 1);
    onCurrencyChange(nextCurrency);
  };

  const handleInputCapture = (event: React.FormEvent<HTMLDivElement>) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const cell = input.closest('td');
    const row = input.closest('tr');
    if (!cell || !row || cell.cellIndex !== 1) return;
    const index = Array.from(row.parentElement?.children ?? []).indexOf(row);
    if (index < 0 || !draftCAD.current[index]) return;
    const number = Number(input.value);
    if (!Number.isFinite(number) || number < 0) return;
    draftCAD.current[index] = {
      ...draftCAD.current[index],
      amount: number * CONVERSION_RATES[currency],
    };
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest('button');
    if (!button) return;
    const action = button.textContent?.trim();
    if (action === 'Save') {
      setSavedCAD(draftCAD.current.map((row) => ({ ...row })));
    } else if (action === 'Cancel') {
      draftCAD.current = savedCAD.map((row) => ({ ...row }));
    } else if (action === 'Edit') {
      draftCAD.current = savedCAD.map((row) => ({ ...row }));
    }
  };
  // BaseGridPage initializes its rows only on mount. A currency switch remounts
  // the grid with amounts displayed in the selected currency.
  const displayRows = renderRowsCAD.map((row) => ({
    ...row,
    amount: Number((row.amount / CONVERSION_RATES[currency]).toFixed(2)),
  }));

  // BaseGridPage currently has no read-only column option. Keep category
  // inputs non-editable without changing the shared component.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const lockCategoryInputs = () => {
      root
        .querySelectorAll<HTMLInputElement>(
          '.MuiTableBody-root > .MuiTableRow-root > .MuiTableCell-root:first-child input',
        )
        .forEach((input) => {
          input.readOnly = true;
          input.tabIndex = -1;
        });
    };

    lockCategoryInputs();
    const observer = new MutationObserver(lockCategoryInputs);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const currencySymbol =
    currency === 'EUR' ? '€' : currency === 'USD' ? 'US$' : 'CA$';

  return (
    <Box
      ref={sectionRef}
      onInputCapture={handleInputCapture}
      onClickCapture={handleClickCapture}
      className="mt-10 min-w-0 overflow-hidden rounded-[4px] border border-[#e5e7eb]"
    >
      <Box
        style={
          { '--cost-symbol': `"${currencySymbol}"` } as React.CSSProperties
        }
      >
        <BaseGridPage<EstimatedCostRow>
          key={`${currency}-${gridVersion}`}
          title="ESTIMATED COSTS"
          initialData={displayRows}
          columns={columns}
          createEmptyRow={() => ({
            id: crypto.randomUUID(),
            category: '',
            amount: 0,
          })}
          addButtonLabel="Add Estimated Cost"
          showSearch={false}
          allowDelete={false}
        />
      </Box>
      <Box className="border-t border-[#e5e7eb]">
        <ConversionRates
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
        />
      </Box>
    </Box>
  );
}
