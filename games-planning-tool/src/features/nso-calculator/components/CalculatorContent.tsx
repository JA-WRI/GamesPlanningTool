// 70% AI generated code
'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Box } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import { asDraftRows } from '@/lib/draft-keys';
import {
  amountToCAD,
  displayAmount,
  type Currency,
  type CurrencyRates,
} from './ConversionRates';
import {
  calculateDaysOnSite,
  calculateTotalCostPerMember,
} from '../utils/calculations';

export type CalculatorRow = Record<string, unknown> & {
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

function createTraveler(category: string): CalculatorRow {
  return {
    id: crypto.randomUUID(),
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
      evaluate: (row) => displayTotalCostPerMember(row),
    },
  },
];
const budgetFields = [
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
  toCAD = false,
) {
  return rows.map((row) => {
    const result = { ...row };
    for (const field of budgetFields) {
      result[field] = toCAD
        ? amountToCAD(row[field], currency, rates)
        : displayAmount(row[field], currency, rates);
    }
    return result;
  });
}

export type CalculatorContentHandle = {
  prepareCurrencyChange: () => void;
};

type CalculatorContentProps = {
  readonly rates: CurrencyRates;
  readonly categories: { name: string }[];
  readonly calculatorId: number;
  readonly initialItems?: CalculatorRow[];
  readonly initialDraft?: unknown;
  readonly draftKey: string;
  readonly currency: Currency;
  readonly gameName: string;
  readonly onSaveAction: (
    calculatorId: number,
    rows: CalculatorRow[],
  ) => Promise<CalculatorRow[]>;
};

const CalculatorContent = forwardRef<
  CalculatorContentHandle,
  CalculatorContentProps
>(function CalculatorContent(
  {
    rates,
    categories,
    calculatorId,
    initialItems,
    initialDraft,
    draftKey,
    currency,
    gameName,
    onSaveAction,
  },
  ref,
) {
  const [savedCAD, setSavedCAD] = useState<CalculatorRow[]>(
    () => initialItems ?? [],
  );
  const [draftPayload, setDraftPayload] = useState(initialDraft);
  const [isEditing, setIsEditing] = useState(false);
  const restoreDraft = (value: unknown) => {
    const rows = asDraftRows<CalculatorRow>(value);
    return rows ? convertRows(rows, currency, rates) : undefined;
  };
  const latestRowsRef = useRef(
    restoreDraft(draftPayload) ?? convertRows(savedCAD, currency, rates),
  );

  useImperativeHandle(ref, () => ({
    prepareCurrencyChange: () => {
      if (!isEditing) return;
      const currentRows = latestRowsRef.current;
      const hasEdits =
        JSON.stringify(currentRows) !==
        JSON.stringify(convertRows(savedCAD, currency, rates));
      setDraftPayload(
        draftPayload !== undefined || hasEdits
          ? convertRows(currentRows, currency, rates, true)
          : undefined,
      );
      setIsEditing(false);
    },
  }));

  const validateTravelerDates = (rows: CalculatorRow[]) => {
    const today = getLocalToday();

    rows.forEach((row, index) => {
      const rowNumber = index + 1;

      // Both empty is allowed
      if (!row.checkIn && !row.checkOut) return;

      // Give specific error messages
      if (!row.checkIn) {
        throw new Error(`Row ${rowNumber}: Please select a check-in date.`);
      }

      if (!row.checkOut) {
        throw new Error(`Row ${rowNumber}: Please select a check-out date.`);
      }

      const previous = savedCAD.find((savedRow) => savedRow.id === row.id);

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
          error instanceof Error ? error.message : 'Invalid date range';

        throw new Error(`Row ${rowNumber}: ${reason}`);
      }
    });
  };

  const getDateValidationError = (rows: CalculatorRow[]): string | null => {
    try {
      validateTravelerDates(rows);
      return null;
    } catch (error) {
      return error instanceof Error
        ? error.message
        : 'Please correct the dates.';
    }
  };

  const handleSave = async (updatedRows: CalculatorRow[]) => {
    validateTravelerDates(updatedRows);
    const rowsCAD = convertRows(updatedRows, currency, rates, true).map(
      calculateTravelerRow,
    );
    const saved = await onSaveAction(calculatorId, rowsCAD);
    setSavedCAD(saved);
    setDraftPayload(undefined);
    return convertRows(saved, currency, rates);
  };

  return (
    <Box className="w-full min-w-0" data-calculator-id={calculatorId}>
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
          key={currency}
          title={gameName}
          initialData={convertRows(savedCAD, currency, rates)}
          initialDraft={draftPayload}
          restoreDraft={restoreDraft}
          serializeDraft={(rows) => convertRows(rows, currency, rates, true)}
          draftKey={draftKey}
          columns={columns.map((column) =>
            column.field === 'category'
              ? {
                  ...column,
                  options: categories.map(({ name }) => ({
                    label: name,
                    value: name,
                  })),
                }
              : column,
          )}
          isValid={(rows) => getDateValidationError(rows) === null}
          createEmptyRow={() => createTraveler(categories[0]?.name ?? '')}
          addButtonLabel="Add New Traveler"
          showSearch={false}
          allowAddRow={true}
          allowDelete={true}
          onRowsChange={(rows) => {
            latestRowsRef.current = rows;
          }}
          onEditingChange={setIsEditing}
          onDraftCleared={() => setDraftPayload(undefined)}
          onSave={handleSave}
        />
      </Box>
    </Box>
  );
});

export default CalculatorContent;
