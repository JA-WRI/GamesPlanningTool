// 60% AI generated code:
// The following was AI generated:
// - Original calculator layout, and component organization
// - Temporary calculator-specific state used beforedb is connected
// - css converted to tailwind
// The table fields and calculator requirements were reviewed and modified manually
// The grid component was implemented manually
'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Box } from '@mui/material';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
import { asDraftRows } from '@/lib/draft-keys';
import { amountToCAD, displayAmount, type Currency } from './ConversionRates';
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

const budgetFields = [
  'travelBudget',
  'accommodationBudget',
  'mealsBudget',
  'insuranceBudget',
  'totalCostPerTeamMember',
] as const;

function convertRows(rows: CalculatorRow[], currency: Currency, toCAD = false) {
  return rows.map((row) => {
    const result = { ...row };
    for (const field of budgetFields) {
      result[field] = toCAD
        ? amountToCAD(row[field], currency)
        : displayAmount(row[field], currency);
    }
    return result;
  });
}

export type CalculatorContentHandle = {
  prepareCurrencyChange: () => void;
};

type CalculatorContentProps = {
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
  const [savedCAD, setSavedCAD] = useState<CalculatorRow[]>(() =>
    initialItems && initialItems.length > 0
      ? initialItems
      : TRAVEL_CATEGORIES.map(({ title }) => createTraveler(title)),
  );
  const [draftPayload, setDraftPayload] = useState(initialDraft);
  const [isEditing, setIsEditing] = useState(false);
  const restoreDraft = (value: unknown) => {
    const rows = asDraftRows<CalculatorRow>(value);
    return rows ? convertRows(rows, currency) : undefined;
  };
  const latestRowsRef = useRef(
    restoreDraft(draftPayload) ?? convertRows(savedCAD, currency),
  );

  useImperativeHandle(ref, () => ({
    prepareCurrencyChange: () => {
      if (!isEditing) return;
      const currentRows = latestRowsRef.current;
      const hasEdits =
        JSON.stringify(currentRows) !==
        JSON.stringify(convertRows(savedCAD, currency));
      setDraftPayload(
        draftPayload !== undefined || hasEdits
          ? convertRows(currentRows, currency, true)
          : undefined,
      );
      setIsEditing(false);
    },
  }));

  const handleSave = async (updatedRows: CalculatorRow[]) => {
    const rowsCAD = convertRows(updatedRows, currency, true);
    const saved = await onSaveAction(calculatorId, rowsCAD);
    setSavedCAD(saved);
    setDraftPayload(undefined);
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
          initialData={convertRows(savedCAD, currency)}
          initialDraft={draftPayload}
          restoreDraft={restoreDraft}
          serializeDraft={(rows) => convertRows(rows, currency, true)}
          draftKey={draftKey}
          columns={columns}
          createEmptyRow={() => createTraveler(TRAVEL_CATEGORIES[0].title)}
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
