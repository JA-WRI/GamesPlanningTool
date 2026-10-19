// 60% AI generated code:
// The following was AI generated:
// - Original estimated cost component structure and MUI inputs
// - css converted to tailwind
// - used to help for the original currency logic
// The layout, cost categories, values, and styling were modified to match the wanted calculator design.
// The reusable grid component was impleted manually

'use client';

import { Box } from '@mui/material';
import { useState } from 'react';
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
  unitOfMeasure: string;
  notes: string;
};

type EstimatedCostsProps = {
  readonly currency: Currency;
  readonly onCurrencyChange: (currency: Currency) => void;
};

const INITIAL_COST_ROWS: EstimatedCostRow[] = [
  {
    id: 'travelEconomyFare',
    category: 'Travel Economy Fare',
    amount: 2400,
    unitOfMeasure: 'CAD',
    notes: 'To be Confirmed',
  },
  {
    id: 'athleteInsurance',
    category: 'Athlete Insurance',
    amount: 50,
    unitOfMeasure: 'CAD',
    notes: '',
  },
  {
    id: 'supportStaffInsurance',
    category: 'Support Staff Insurance',
    amount: 28,
    unitOfMeasure: 'CAD',
    notes: '',
  },
  {
    id: 'cellphone',
    category: 'Cellphone (local plan)',
    amount: 108,
    unitOfMeasure: 'CAD/day',
    notes: '',
  },
  {
    id: 'mealsPerDay',
    category: 'Meals',
    amount: 118,
    unitOfMeasure: 'CAD/meal',
    notes: '(outside of Village, breakfast incl at most accommodation)',
  },
  {
    id: 'villageMealVoucher',
    category: 'Village Meal Voucher',
    amount: 57,
    unitOfMeasure: 'CAD',
    notes: '',
  },
  {
    id: 'knifeAndFork',
    category: 'Knife & Fork for Ap',
    amount: 2279,
    unitOfMeasure: 'CAD',
    notes: '',
  },
  {
    id: 'clothingPackage',
    category: 'Clothing Package',
    amount: 3200,
    unitOfMeasure: 'CAD',
    notes: '',
  },
];

// keep the amounts in CAD and only convert the values shown in the table
function displayCosts(
  rows: EstimatedCostRow[],
  currency: Currency,
): EstimatedCostRow[] {
  return rows.map((row) => ({
    ...row,
    amount: Number((row.amount / CONVERSION_RATES[currency]).toFixed(2)),
    unitOfMeasure: row.unitOfMeasure.replace(/^(CAD|USD|EUR)/, currency),
  }));
}

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
  // Keep saved amounts in CAD, even while another currency is displayed.
  const [savedCAD, setSavedCAD] = useState(() =>
    INITIAL_COST_ROWS.map((row) => ({ ...row })),
  );

  const columns: ColumnDefinition<EstimatedCostRow>[] = [
    { field: 'category', label: 'Cost Item', type: 'text', width: '30%' },
    {
      field: 'amount',
      label: 'Amount',
      type: 'number',
      min: 0,
      step: 0.01,
      width: '15%',
    },
    {
      field: 'unitOfMeasure',
      label: 'Unit of Measure',
      type: 'text',
      width: '16%',
    },
    { field: 'notes', label: 'Notes', type: 'text', width: '39%' },
  ];

  const handleSave = (rows: EstimatedCostRow[]) => {
    setSavedCAD(
      rows.map((row) => ({
        ...row,
        amount: Number(row.amount) * CONVERSION_RATES[currency],
        unitOfMeasure: row.unitOfMeasure.replace(/^(CAD|USD|EUR)/, 'CAD'),
      })),
    );
  };

  return (
    <Box className="mt-10 min-w-0 ">
      <BaseGridPage<EstimatedCostRow>
        key={currency}
        title="ESTIMATED COSTS"
        initialData={displayCosts(savedCAD, currency)}
        columns={columns}
        createEmptyRow={() => ({
          id: crypto.randomUUID(),
          category: '',
          amount: 0,
          unitOfMeasure: currency,
          notes: '',
        })}
        addButtonLabel="Add New Cost"
        showSearch={false}
        allowAddRow={true}
        allowDelete={true}
        fitWidth={true}
        onSave={handleSave}
      />
      <Box className="mt-3">
        <ConversionRates
          currency={currency}
          onCurrencyChange={onCurrencyChange}
        />
      </Box>
    </Box>
  );
}
