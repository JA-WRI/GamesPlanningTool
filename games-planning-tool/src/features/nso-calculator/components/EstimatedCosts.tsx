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
  type CurrencyRates,
} from './ConversionRates';
import { saveEstimatedCosts } from '../action';

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
  readonly rates: CurrencyRates;
  readonly initialRows?: EstimatedCostRow[];
  readonly gameId?: number;
  readonly nsoId?: string;
};

// keep the amounts in CAD and only convert the values shown in the table
function displayCosts(
  rows: EstimatedCostRow[],
  currency: Currency,
  rates: CurrencyRates,
): EstimatedCostRow[] {
  return rows.map((row) => ({
    ...row,
    amount: Number((row.amount / rates[currency]).toFixed(2)),
    unitOfMeasure: row.unitOfMeasure.replace(/^(CAD|USD|EUR)/, currency),
  }));
}

export default function EstimatedCosts({
  currency,
  onCurrencyChange,
  initialRows,
  gameId,
  nsoId,
  rates,
}: Readonly<EstimatedCostsProps>) {
  const [savedCAD, setSavedCAD] = useState<EstimatedCostRow[]>(
    () => (initialRows ?? []).map((row) => ({ ...row })),
  );

  const [saveError, setSaveError] = useState<string | null>(null);
  const [gridVersion, setGridVersion] = useState(0);

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

  
const handleSave = async (rows: EstimatedCostRow[]) => {
  setSaveError(null);

  const rowsCAD = rows.map((row) => ({
    ...row,
    amount: Number(row.amount) * rates[currency],
    unitOfMeasure: row.unitOfMeasure.replace(
      /^(CAD|USD|EUR)/,
      'CAD',
    ),
  }));

  try {
    if (!gameId || !nsoId) {
      setSaveError('A valid game and NSO are required to save');
      return;
    }

    const saved = await saveEstimatedCosts(
      gameId,
      nsoId,
      rowsCAD,
    );

    setSavedCAD(
      saved.map((cost) => ({
        id: String(cost.id),
        category: cost.name,
        amount: cost.costInCents / 100,
        unitOfMeasure: cost.unitOfMeasure,
        notes: cost.notes ?? '',
      })),
    );

    setGridVersion((version) => version + 1);
  } catch (error) {
    console.error('Failed to save estimated costs', error);
    setSaveError('Could not save estimated costs');
  }
};


  return (
    <Box className="mt-10 min-w-0 [&>div>div:first-child]:rounded-b-none! [&>div>div:first-child]:border-b-0!">
      <Box className="rounded-lg shadow-sm">
        <BaseGridPage<EstimatedCostRow>
          key={`${currency}-${gridVersion}`}
          title="ESTIMATED COSTS"
          initialData={displayCosts(savedCAD, currency, rates)}
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
        {/* display error message*/}
        {saveError && (
  <Box role="alert" className="px-4 py-2 text-red-600">
    {saveError}
  </Box>
)}

        <Box className="border-x border-b border-gray-200 rounded-b-lg bg-white px-6 py-3">
          <ConversionRates
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            rates={rates}
          />
        </Box>
      </Box>
    </Box>
  );
}
