// 60% AI generated code

'use client';

import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import { asDraftRows } from '@/lib/draft-keys';
import { flushActiveDrafts } from '@/lib/draft-navigation';
import ConversionRates, {
  type Currency,
  type CurrencyRates,
  amountToCAD,
  displayAmount,
} from './ConversionRates';

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

export type EstimatedCostRow = Record<string, unknown> & {
  id: string;
  category: string;
  amount: number;
  unitOfMeasure: string;
  notes: string;
};

type EstimatedCostsProps = {
  readonly rates: CurrencyRates;
  readonly calculatorId: number;
  readonly initialItems?: EstimatedCostRow[];
  readonly initialDraft?: unknown;
  readonly draftKey: string;
  readonly onSaveAction: (
    calculatorId: number,
    rows: EstimatedCostRow[],
  ) => Promise<EstimatedCostRow[]>;
  readonly currency: Currency;
  readonly onCurrencyChange: (currency: Currency) => void | Promise<void>;
  readonly onSavedRowsChange?: (rows: EstimatedCostRow[]) => void;
};

export const INITIAL_COST_ROWS: EstimatedCostRow[] = [
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
  rates: CurrencyRates,
): EstimatedCostRow[] {
  return rows.map((row) => ({
    ...row,
    amount: displayAmount(row.amount, currency, rates),
    unitOfMeasure: row.unitOfMeasure.replace(/^(CAD|USD|EUR)/, currency),
  }));
}

function costsToCAD(
  rows: EstimatedCostRow[],
  currency: Currency,
  rates: CurrencyRates,
): EstimatedCostRow[] {
  return rows.map((row) => ({
    ...row,
    amount: amountToCAD(row.amount, currency, rates),
    unitOfMeasure: row.unitOfMeasure.replace(/^(CAD|USD|EUR)/, 'CAD'),
  }));
}

export default function EstimatedCosts({
  rates,
  calculatorId,
  initialItems,
  initialDraft,
  draftKey,
  onSaveAction,
  currency,
  onCurrencyChange,
  onSavedRowsChange,
}: Readonly<EstimatedCostsProps>) {
  // Keep saved amounts in CAD, even while another currency is displayed.
  const [savedCAD, setSavedCAD] = useState<EstimatedCostRow[]>(() =>
    (initialItems ?? []).map((row) => ({ ...row })),
  );
  const [draftPayload, setDraftPayload] = useState(initialDraft);
  const [isGridEditing, setIsGridEditing] = useState(false);

  const restoreDraft = (value: unknown) => {
    if (typeof value !== 'object' || value === null || !('rows' in value)) {
      return undefined;
    }
    const cadRows = asDraftRows<EstimatedCostRow>(value.rows);
    if (!cadRows) return undefined;
    return displayCosts(cadRows, currency, rates);
  };

  const startingRows =
    restoreDraft(draftPayload) ?? displayCosts(savedCAD, currency, rates);
  const latestRowsRef = useRef(startingRows);

  useEffect(() => {
    onSavedRowsChange?.(savedCAD);
  }, [savedCAD, onSavedRowsChange]);

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
    const cadRows = costsToCAD(rows, currency, rates);

    const dbSaved = await onSaveAction(calculatorId, cadRows);
    setSavedCAD(dbSaved.map((row) => ({ ...row })));
    setDraftPayload(undefined);
    return displayCosts(dbSaved, currency, rates);
  };

  const serializeDraft = (rows: EstimatedCostRow[]) => ({
    rows: costsToCAD(rows, currency, rates),
  });

  const handleCurrencyChange = async (nextCurrency: Currency) => {
    if (nextCurrency === currency) return;
    try {
      await flushActiveDrafts();
      if (isGridEditing) {
        const currentRows = latestRowsRef.current;
        const canonicalRows = displayCosts(savedCAD, currency, rates);
        const hasEdits =
          JSON.stringify(currentRows) !== JSON.stringify(canonicalRows);
        setDraftPayload(
          draftPayload !== undefined || hasEdits
            ? { rows: costsToCAD(currentRows, currency, rates) }
            : undefined,
        );
      }
      await onCurrencyChange(nextCurrency);
      setIsGridEditing(false);
    } catch {
      alert('Could not save your draft. Currency was not changed.');
    }
  };

  return (
    <Box className="mt-10 min-w-0 [&>div>div:first-child]:rounded-b-none! [&>div>div:first-child]:border-b-0!">
      <Box className="rounded-lg shadow-sm">
        <BaseGridPage<EstimatedCostRow>
          key={currency}
          title="ESTIMATED COSTS"
          initialData={displayCosts(savedCAD, currency, rates)}
          initialDraft={draftPayload}
          restoreDraft={restoreDraft}
          serializeDraft={serializeDraft}
          draftKey={draftKey}
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
          onRowsChange={(rows) => {
            latestRowsRef.current = rows;
          }}
          onEditingChange={setIsGridEditing}
          onDraftCleared={() => setDraftPayload(undefined)}
        />

        <Box className="border-x border-b border-gray-200 rounded-b-lg bg-white px-6 py-3">
          <ConversionRates
            rates={rates}
            currency={currency}
            onCurrencyChange={handleCurrencyChange}
          />
        </Box>
      </Box>
    </Box>
  );
}
