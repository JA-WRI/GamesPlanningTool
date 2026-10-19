// 60% AI generated code:
// The following was AI generated:
// - Original calculator layout, and component organization
// - Temporary calculator-specific state used beforedb is connected
// - css converted to tailwind
// The table fields and calculator requirements were reviewed and modified manually
// The grid component was implemented manually
'use client';

import { useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useParams } from 'next/navigation';
import { Games } from '@/lib/data';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import { type Currency, CONVERSION_RATES } from './conversionrates';
import EstimatedCosts from './estimatedcosts';
// these will be added later
//import CostSummary from './costsummary';
//import HotelDetails from './hoteldetails';

// these categories are now hard-coded values until we connect to the db
const TRAVEL_CATEGORIES = [
  {
    id: 1,
    title: 'Travelling Accredited Alternate Athletes @ partial NSO cost (Ap)',
  },
  {
    id: 2,
    title: 'Travelling Non-accredited Alternate Athletes @ full NSO cost',
  },
  { id: 3, title: 'Support staff @ partial NSO cost (e.g., partial Ao)' },
  { id: 4, title: 'Support staff @ full NSO cost (incl. non-accredited)' },
] as const;

type CalculatorRow = Record<string, unknown> & {
  id: string;
  category: string;
  numberOfTeamMembers: number;
  days: number;
  travelBudget: number;
  checkIn: string;
  checkOut: string;
  accommodationBudget: number;
  mealsBudget: number;
  insuranceBudget: number;
  totalCostPerTeamMember: number;
};

function createTraveler(
  id: string,
  category: string = TRAVEL_CATEGORIES[0].title,
): CalculatorRow {
  return {
    id,
    category,
    numberOfTeamMembers: 0,
    days: 0,
    travelBudget: 0,
    checkIn: '',
    checkOut: '',
    accommodationBudget: 0,
    mealsBudget: 0,
    insuranceBudget: 0,
    totalCostPerTeamMember: 0,
  };
}

const columns: ColumnDefinition<CalculatorRow>[] = [
  {
    field: 'category',
    label: 'Access and Priviledges',
    type: 'select',
    width: 430,
    options: TRAVEL_CATEGORIES.map(({ title }) => ({
      label: title,
      value: title,
    })),
  },
  {
    field: 'numberOfTeamMembers',
    label: 'Number of Team Members',
    type: 'number',
    min: 0,
    step: 1,
    width: 150,
    align: 'center',
  },
  {
    field: 'days',
    label: 'Days on Site',
    type: 'number',
    min: 0,
    step: 1,
    width: 125,
    align: 'center',
  },
  {
    field: 'travelBudget',
    label: 'Travel Budget',
    type: 'number',
    min: 0,
    width: 155,
    align: 'center',
  },
  {
    field: 'checkIn',
    label: 'Check-in Date',
    type: 'text',
    placeholder: 'YYYY-MM-DD',
    width: 155,
    align: 'center',
  },
  {
    field: 'checkOut',
    label: 'Check-out Date',
    type: 'text',
    placeholder: 'YYYY-MM-DD',
    width: 155,
    align: 'center',
  },
  {
    field: 'accommodationBudget',
    label: 'Accommodation Budget',
    type: 'number',
    min: 0,
    width: 175,
    align: 'center',
  },
  {
    field: 'mealsBudget',
    label: 'Meals Budget',
    type: 'number',
    min: 0,
    width: 150,
    align: 'center',
  },
  {
    field: 'insuranceBudget',
    label: 'Insurance Budget',
    type: 'number',
    min: 0,
    width: 150,
    align: 'center',
  },
  {
    field: 'totalCostPerTeamMember',
    label: 'Total Cost / Member',
    type: 'number',
    min: 0,
    width: 175,
    align: 'center',
  },
];
const BUDGET_FIELDS = [
  'travelBudget',
  'accommodationBudget',
  'mealsBudget',
  'insuranceBudget',
  'totalCostPerTeamMember',
] as const;
const INITIAL_ROWS = TRAVEL_CATEGORIES.map(({ id, title }) =>
  createTraveler(String(id), title),
);
function convertRows(
  rows: CalculatorRow[],
  currency: Currency,
): CalculatorRow[] {
  return rows.map((row) => {
    const result = { ...row };
    for (const field of BUDGET_FIELDS)
      result[field] = Number(
        (row[field] / CONVERSION_RATES[currency]).toFixed(2),
      );
    return result;
  });
}

export default function CalculatorContent({
  calculatorId,
}: {
  readonly calculatorId: number;
}) {
  const params = useParams<{ gameId?: string }>();
  const selectedGame = Games.find((game) => game.id === params.gameId);
  const [currency, setCurrency] = useState<Currency>('CAD');
  const [gridVersion, setGridVersion] = useState(0);
  const [renderRowsCAD, setRenderRowsCAD] = useState<CalculatorRow[]>(() =>
    INITIAL_ROWS.map((row) => ({ ...row })),
  );
  const savedCAD = useRef<CalculatorRow[]>(
    INITIAL_ROWS.map((row) => ({ ...row })),
  );
  const draftCAD = useRef<CalculatorRow[]>(
    INITIAL_ROWS.map((row) => ({ ...row })),
  );

  // keeping budget values in CAD when switching currencies
  const handleInputCapture = (event: React.FormEvent<HTMLDivElement>) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const cell = input.closest('td');
    const row = input.closest('tr');
    if (!cell || !row) return;
    const field = columns[cell.cellIndex]?.field;
    if (!field || !BUDGET_FIELDS.some((budgetField) => budgetField === field))
      return;
    const index = Array.from(row.parentElement?.children ?? []).indexOf(row);
    if (index < 0 || !draftCAD.current[index]) return;
    const amount = Number(input.value);
    if (!Number.isFinite(amount) || amount < 0) return;
    draftCAD.current[index] = {
      ...draftCAD.current[index],
      [field]: amount * CONVERSION_RATES[currency],
    };
  };

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest('button');
    if (!button) return;
    const action = button.textContent?.trim();
    if (action === 'Save')
      savedCAD.current = draftCAD.current.map((row) => ({ ...row }));
    else if (action === 'Cancel')
      draftCAD.current = savedCAD.current.map((row) => ({ ...row }));
  };

  const handleCurrencyChange = (nextCurrency: Currency) => {
    if (nextCurrency === currency) return;
    setRenderRowsCAD(draftCAD.current.map((row) => ({ ...row })));
    setCurrency(nextCurrency);
    setGridVersion((version) => version + 1);
  };

  // Totals remain placeholders until the calculator's business calculations are connected
  const summary = [
    { label: 'Accommodation:', value: 0 },
    { label: 'Travel:', value: 0 },
    { label: 'Food:', value: 0 },
    { label: 'Insurance:', value: 0 },
    { label: 'SIM card:', value: 0 },
  ];

  return (
    <Box className="w-full min-w-0" data-calculator-id={calculatorId}>
      {/* Keep column widths stable between Edit and Preview */}
      <Box
        onInputCapture={handleInputCapture}
        onChangeCapture={handleInputCapture}
        onClickCapture={handleClickCapture}
        className="
          relative min-w-0 p-2
          [&_.MuiTable-root]:table-fixed
          [&_.MuiTable-root]:min-w-[2000px]
          [&_.MuiTableCell-root]:box-border
          [&_.MuiTableCell-root]:h-[70px]
          [&_.MuiTableCell-root]:overflow-hidden
          [&_.MuiTableCell-root]:align-middle
          [&_.MuiTableCell-root_.MuiFormControl-root]:min-w-0!
          [&_.MuiTableCell-root_.MuiFormControl-root]:w-full
          [&_.MuiTableCell-root_.MuiTextField-root]:min-w-0!
          [&_.MuiTableCell-root_.MuiTextField-root]:w-full
        "
      >
        <BaseGridPage<CalculatorRow>
          key={gridVersion}
          title={selectedGame?.title ?? 'SELECT A GAME'}
          initialData={convertRows(renderRowsCAD, currency)}
          columns={columns}
          createEmptyRow={() => createTraveler(crypto.randomUUID())}
          addButtonLabel="Add New Traveler"
          showSearch={false}
        />
      </Box>

      <EstimatedCosts
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />
      {/* will be implemented later 
      <HotelDetails />
      <CostSummary summary={summary} estimatedTotal={0} />
      */}
    </Box>
  );
}
