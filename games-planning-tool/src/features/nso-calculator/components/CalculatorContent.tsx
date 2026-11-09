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
import { type Currency, CONVERSION_RATES } from './ConversionRates';
import EstimatedCosts from './EstimatedCosts';
import type { CalculatorData } from './CalculatorClient';
import {saveTravelers} from '../action';

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
  category: string,
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

// gets data from db and converts it to a row for the grid
function dbTravelerToRow(
  traveler: CalculatorData['travelers'][number],
): CalculatorRow {
  return {
    id: String(traveler.id),
    category: traveler.travelerCategory.name,
    numberOfTeamMembers: traveler.numberOfTeamMembers,
    days: traveler.days,
    travelBudget: traveler.travelCostInCents / 100,
    checkIn: traveler.checkInDate
      ? new Date(traveler.checkInDate).toISOString().slice(0, 10)
      : '',
    checkOut: traveler.checkOutDate
      ? new Date(traveler.checkOutDate).toISOString().slice(0, 10)
      : '',
    accommodationBudget: traveler.accommodationCostInCents / 100,
    mealsBudget: traveler.mealsCostInCents / 100,
    insuranceBudget: traveler.insuranceCostInCents / 100,
    totalCostPerTeamMember: 0,
  };
}


const columns: ColumnDefinition<CalculatorRow>[] = [
  {
    field: 'category',
    label: 'Access and Priviledges',
    type: 'select',
    width: 430,
    options: [],
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
  initialData,
}: {
  readonly calculatorId: number;
  readonly initialData?: CalculatorData;
}) {
  const params = useParams<{ gameId?: string }>();
  const selectedGame = Games.find((game) => game.id === params.gameId);
  
  // Get traveler categories from the database
  const categoryOptions = (initialData?.categories ?? []).map(
    (category) => ({
      label: category.name,
      value: category.name,
    }),
  );

  // Use database categories in the dropdown
  const calculatorColumns: ColumnDefinition<CalculatorRow>[] =
    columns.map((column) =>
      column.field === 'category'
        ? { ...column, options: categoryOptions }
        : column,
    );


  const initialTravelerRows: CalculatorRow[] = initialData?.travelers.map(dbTravelerToRow) ?? [];

  const [currency, setCurrency] = useState<Currency>('CAD');
  const [gridVersion, setGridVersion] = useState(0);

  const [renderRowsCAD, setRenderRowsCAD] = useState<CalculatorRow[]>(
    () => initialTravelerRows.map((row) => ({ ...row })),
  );
  
  const savedCAD = useRef<CalculatorRow[]>(
    initialTravelerRows.map((row) => ({ ...row })),
  );
  
  const draftCAD = useRef<CalculatorRow[]>(
    initialTravelerRows.map((row) => ({ ...row })),
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

  
const [saveError, setSaveError] = useState<string | null>(null);

const handleSave = async (rows: CalculatorRow[]) => {
  setSaveError(null);

  // Convert displayed amounts back to CAD before saving
  const toCAD = (value: number) =>
    Number((value * CONVERSION_RATES[currency]).toFixed(2));

  const rowsCAD = rows.map((row) => ({
    ...row,
    travelBudget: toCAD(row.travelBudget),
    accommodationBudget: toCAD(row.accommodationBudget),
    mealsBudget: toCAD(row.mealsBudget),
    insuranceBudget: toCAD(row.insuranceBudget),
    totalCostPerTeamMember: toCAD(row.totalCostPerTeamMember),
  }));

  try {
    const updatedRows = initialData
      ? (
          await saveTravelers(
            initialData.gameId,
            initialData.nsoId,
            rowsCAD,
          )
        ).map(dbTravelerToRow)
      : rowsCAD;

    savedCAD.current = updatedRows.map((row) => ({ ...row }));
    draftCAD.current = updatedRows.map((row) => ({ ...row }));

    setRenderRowsCAD(updatedRows);
    setGridVersion((version) => version + 1);
  } catch (error) {
    console.error('Failed to save calculator', error);
    setSaveError('Could not save calculator changes');
  }
};


  const handleCurrencyChange = (nextCurrency: Currency) => {
    if (nextCurrency === currency) return;
    setRenderRowsCAD(draftCAD.current.map((row) => ({ ...row })));
    setCurrency(nextCurrency);
    setGridVersion((version) => version + 1);
  };

  return (
    <Box className="w-full min-w-0" data-calculator-id={calculatorId}>
      {/* Keep column widths stable between Edit and Preview */}
      <Box
        onInputCapture={handleInputCapture}
        onChangeCapture={handleInputCapture}
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
          title={initialData?.gameName ?? selectedGame?.title ?? 'SELECT A GAME'}
          initialData={convertRows(renderRowsCAD, currency)}
          columns={calculatorColumns}
          createEmptyRow={() =>
            createTraveler(
              crypto.randomUUID(),
              initialData?.categories[0]?.name ?? '',
            )
          }
          addButtonLabel="Add New Traveler"
          showSearch={false}
          onSave={handleSave}
        />
        {/* to display the save error message, if any */}
        {saveError && (
  <Box role="alert" className="px-2 text-red-600">
    {saveError}
  </Box>
)}
      </Box>

      <EstimatedCosts
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        initialRows={initialData?.estimatedCosts.map((cost) => ({
          id: String(cost.id),
          category: cost.name,
          amount: cost.costInCents / 100,
          unitOfMeasure: cost.unitOfMeasure,
          notes: cost.notes ?? '',
        }))}
      />
      
    </Box>
  );
}
