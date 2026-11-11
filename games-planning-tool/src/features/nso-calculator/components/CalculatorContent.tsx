// 60% AI generated code:
// The following was AI generated:
// - Original calculator layout, and component organization
// - Temporary calculator-specific state used beforedb is connected
// - css converted to tailwind
// The table fields and calculator requirements were reviewed and modified manually
// The grid component was implemented manually
'use client';

import { Box } from '@mui/material';
import { useParams } from 'next/navigation';
import { Games } from '@/lib/data';
import BaseGridPage from '@/components/commons/BaseGridPage';
import type { ColumnDefinition } from '@/components/commons/Grid';
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

export default function CalculatorContent({
  calculatorId,
  initialItems = [],
  initialDraft,
  draftKey,
  onSaveAction,
}: {
  readonly calculatorId: number;
  readonly initialItems?: CalculatorRow[];
  readonly initialDraft?: unknown;
  readonly draftKey: string;
  readonly onSaveAction?: (
    calculatorId: number,
    rows: CalculatorRow[],
  ) => Promise<CalculatorRow[]>;
}) {
  const params = useParams<{ gameId?: string }>();
  const selectedGame = Games.find((game) => game.id === params.gameId);

  const handleSave = async (updatedRows: CalculatorRow[]) => {
    if (onSaveAction) {
      await onSaveAction(calculatorId, updatedRows);
    }
  };
  // Totals remain placeholders until the calculator's business calculations are connected
  // const summary = [
  //   { label: 'Accommodation:', value: 0 },
  //   { label: 'Travel:', value: 0 },
  //   { label: 'Food:', value: 0 },
  //   { label: 'Insurance:', value: 0 },
  //   { label: 'SIM card:', value: 0 },
  // ];

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
          title={selectedGame?.title ?? 'SELECT A GAME'}
          initialData={initialItems}
          initialDraft={initialDraft}
          draftKey={draftKey}
          columns={columns}
          createEmptyRow={() => ({
            id: crypto.randomUUID(),
            category: TRAVEL_CATEGORIES[0].title,
            numberOfTeamMembers: 0,
            days: 0,
            travelBudget: 0,
            checkIn: '',
            checkOut: '',
            accommodationBudget: 0,
            mealsBudget: 0,
            insuranceBudget: 0,
            totalCostPerTeamMember: 0,
          })}
          addButtonLabel="Add New Traveler"
          showSearch={false}
          allowAddRow={true}
          allowDelete={true}
          onSave={handleSave}
        />
      </Box>
      {/* <EstimatedCosts
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      /> */}
      {/* will be implemented later 
      <HotelDetails />
      <CostSummary summary={summary} estimatedTotal={0} />
      */}
    </Box>
  );
}
