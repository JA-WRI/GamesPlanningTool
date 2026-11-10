// 60% AI generated code:
// The following was AI generated:
// - Original calculator layout, and component organization
// - Temporary calculator-specific state used beforedb is connected
// - css converted to tailwind
// The table fields and calculator requirements were reviewed and modified manually
// The grid component was implemented manually
'use client';

import { useCallback, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useParams } from 'next/navigation';
import { Games } from '@/lib/data';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import type { Currency, CurrencyRates } from './ConversionRates';
import EstimatedCosts from './EstimatedCosts';
import type { CalculatorData } from './CalculatorClient';
import { saveTravelers } from '../action';
import { calculateDaysOnSite, calculateTotalCostPerMember } from '../utils/calculations';

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

function createTraveler(id: string, category: string): CalculatorRow {
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
  return calculateTravelerRow({
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
  });
}


function calculateTravelerRow(row: CalculatorRow): CalculatorRow {
  const days = calculateDaysOnSite(row.checkIn, row.checkOut);

  return {
    ...row,
    days,
    totalCostPerTeamMember: calculateTotalCostPerMember(
      row.travelBudget,
      row.accommodationBudget,
      days,
      row.mealsBudget,
      row.insuranceBudget,
    ),
  };
}


function displayDaysOnSite(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;

  try {
    return calculateDaysOnSite(checkIn, checkOut);
  } catch {
    return 0;
  }
}



function displayTotalCostPerMember(row: CalculatorRow): number {
  const travel = Number(row.travelBudget);
  const accommodation = Number(row.accommodationBudget);
  const meals = Number(row.mealsBudget);
  const insurance = Number(row.insuranceBudget);

  const values = [travel, accommodation, meals, insurance];

  // Keep the grid from crashing while editing
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    return 0;
  }

  return calculateTotalCostPerMember(
    travel,
    accommodation,
    displayDaysOnSite(row.checkIn, row.checkOut),
    meals,
    insurance,
  );
}

function getLocalToday(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
    field: 'days',
    label: 'Days on Site',
    type: 'calculated',
    width: 125,
    align: 'center',
    formula: {
      evaluate: (row) => displayDaysOnSite(row.checkIn, row.checkOut),
    },
  },
  {
    field: 'accommodationBudget',
    label: 'Accommodation Budget / Day on Site',
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
    type: 'calculated',
    min: 0,
    width: 175,
    align: 'center',
    formula: {
      evaluate: (row) =>
        displayTotalCostPerMember(row),
    },
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
  rates: CurrencyRates,
): CalculatorRow[] {
  return rows.map((row) => {
    const result = { ...row };
    for (const field of BUDGET_FIELDS)
      result[field] = Number((row[field] / rates[currency]).toFixed(2));
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
  const rates = initialData?.rates;

  // Get traveler categories from the database
  const categoryOptions = (initialData?.categories ?? []).map((category) => ({
    label: category.name,
    value: category.name,
  }));

  // Use database categories in the dropdown
  const calculatorColumns: ColumnDefinition<CalculatorRow>[] = columns.map(
    (column) =>
      column.field === 'category'
        ? { ...column, options: categoryOptions }
        : column,
  );

  const initialTravelerRows: CalculatorRow[] =
    initialData?.travelers.map(dbTravelerToRow) ?? [];

  const [currency, setCurrency] = useState<Currency>('CAD');
  const [gridVersion, setGridVersion] = useState(0);

  const [renderRowsCAD, setRenderRowsCAD] = useState<CalculatorRow[]>(() =>
    initialTravelerRows.map((row) => ({ ...row })),
  );

  const savedCAD = useRef<CalculatorRow[]>(
    initialTravelerRows.map((row) => ({ ...row })),
  );

  const draftCAD = useRef<CalculatorRow[]>(
    initialTravelerRows.map((row) => ({ ...row })),
  );
  
  
  const handleRowsChange = useCallback(
    (rows: CalculatorRow[]) => {
      if (!rates) return;
  
      // the Grid currently contains values in the selected currency
      // store a complete copy of every row in cad
      draftCAD.current = rows.map((row) => ({
        ...row,
        travelBudget: Number(row.travelBudget) * rates[currency],
        accommodationBudget:
          Number(row.accommodationBudget) * rates[currency],
        mealsBudget: Number(row.mealsBudget) * rates[currency],
        insuranceBudget:
          Number(row.insuranceBudget) * rates[currency],
      }));
    },
    [currency, rates],
  );
  
  
  const [saveError, setSaveError] = useState<string | null>(null);

  
  
const validateTravelerDates = (rows: CalculatorRow[]) => {
  const today = getLocalToday();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;

    // Both empty is allowed
    if (!row.checkIn && !row.checkOut) return;

    // Give specific error messages
    if (!row.checkIn) {
      throw new Error(
        `Row ${rowNumber}: Please select a check-in date.`,
      );
    }

    if (!row.checkOut) {
      throw new Error(
        `Row ${rowNumber}: Please select a check-out date.`,
      );
    }

    const previous = savedCAD.current.find(
      (savedRow) => savedRow.id === row.id,
    );

    const datesChanged =
      !previous ||
      previous.checkIn !== row.checkIn ||
      previous.checkOut !== row.checkOut;

    try {
      calculateDaysOnSite(
        row.checkIn,
        row.checkOut,
        datesChanged ? today : undefined,
      );
    } catch (error) {
      const reason =
        error instanceof Error
          ? error.message
          : 'Invalid date range';

      throw new Error(`Row ${rowNumber}: ${reason}`);
    }
  });
};

const getDateValidationError = (
  rows: CalculatorRow[],
): string | null => {
  try {
    validateTravelerDates(rows);
    return null;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : 'Please correct the dates.';
  }
};

  

  
  const handleSave = async (rows: CalculatorRow[]) => {
    setSaveError(null);

    try {
      if (!rates) {
        throw new Error('Conversion rates unavailable');
      }

      // validate the dates before saving to db
      validateTravelerDates(rows);

      //convert displayed currency back to CAD
      const toCAD = (value: number) =>
        Number((value * rates[currency]).toFixed(2));

      // calculate days and total cost for every traveler
      const rowsCAD = rows.map((row) =>
        calculateTravelerRow({
          ...row,
          travelBudget: toCAD(row.travelBudget),
          accommodationBudget: toCAD(row.accommodationBudget),
          mealsBudget: toCAD(row.mealsBudget),
          insuranceBudget: toCAD(row.insuranceBudget),
        }),
      );

      // save to PostgreSQL
      const updatedRows = initialData
        ? (
            await saveTravelers(
              initialData.gameId,
              initialData.nsoId,
              rowsCAD,
            )
          ).map(dbTravelerToRow)
        : rowsCAD;

      // update the saved and draft data
      savedCAD.current = updatedRows.map((row) => ({ ...row }));
      draftCAD.current = updatedRows.map((row) => ({ ...row }));

      // refresh the grid
      setRenderRowsCAD(updatedRows);
      setGridVersion((version) => version + 1);

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not save calculator changes';
    
      setSaveError(message);
    
    }
  };

  const handleCurrencyChange = (nextCurrency: Currency) => {
    if (nextCurrency === currency) return;
    if (!rates?.[nextCurrency]) return;

    setRenderRowsCAD(draftCAD.current.map((row) => ({ ...row })));
    setCurrency(nextCurrency);
    setGridVersion((version) => version + 1);
  };

  
  const handleSaveClickCapture = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const target = event.target;
  
    if (!(target instanceof HTMLElement)) return;
  
    const button = target.closest('button');
  
    // only intercept the main calculator's save button
    if (button?.textContent?.trim().toLowerCase() !== 'save') {
      return;
    }
  
    const error = getDateValidationError(draftCAD.current);
  
    if (error) {
      event.preventDefault();
      event.stopPropagation();
  
      setSaveError(error);
    }
  };
  

  return (
    <Box onClickCapture={handleSaveClickCapture} className="w-full min-w-0" data-calculator-id={calculatorId}>
      {/* Keep column widths stable between Edit and Preview */}
      <Box
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
          title={
            initialData?.gameName ?? selectedGame?.title ?? 'SELECT A GAME'
          }
          initialData={
            rates ? convertRows(renderRowsCAD, currency, rates) : renderRowsCAD
          }
          columns={calculatorColumns}
          createEmptyRow={() =>
            createTraveler(
              crypto.randomUUID(),
              initialData?.categories[0]?.name ?? '',
            )
          }
          addButtonLabel="Add New Traveler"
          showSearch={false}
          onRowsChange={handleRowsChange}
          onSave={handleSave}
          isValid={(rows) => getDateValidationError(rows) === null}
        />
        {/* to display the save error message, if any */}
        {saveError && (
          <Box role="alert" 
          className="mt-2 inline-flex max-w-md items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 shadow-sm">
            <span>⚠</span>
            <span>{saveError}</span>
          </Box>
        )}
      </Box>

      {rates ? (
        <EstimatedCosts
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          rates={rates}
          gameId={initialData?.gameId}
          nsoId={initialData?.nsoId}
          initialRows={initialData?.estimatedCosts.map((cost) => ({
            id: String(cost.id),
            category: cost.name,
            amount: cost.costInCents / 100,
            unitOfMeasure: cost.unitOfMeasure,
            notes: cost.notes ?? '',
          }))}
        />
      ) : (
        <Box role="alert" className="px-2 text-red-600">
          Conversion rates not available
        </Box>
      )}
    </Box>
  );
}
