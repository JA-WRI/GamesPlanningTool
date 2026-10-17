// 60% AI generated code:
// The following was AI generated:
// - Original calculator layout, and component organization
// - Temporary calculator-specific state used beforedb is connected
// - css converted to tailwind
// The table fields and calculator requirements were reviewed and modified manually
// The grid component was implemented manually 
'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
} from '@mui/material';
import ConversionRates from './conversionrates';
import CostSummary from './costsummary';
import EstimatedCosts, { EstimatedCostsData } from './estimatedcosts';
import HotelDetails from './hoteldetails';
import Grid, {type ColumnDefinition} from '@/components/commons/Grid';

// these categories are now hard-coded values until we connect to the db
const TRAVEL_CATEGORIES = [
  { id: 1, title: 'Travelling Accredited Alternate Athletes @ partial NSO cost (Ap)',},
  { id: 2, title: 'Travelling Non-accredited Alternate Athletes @ full NSO cost', },
  { id: 3, title: 'Support staff @ partial NSO cost (e.g., partial Ao)', },
  { id: 4, title: 'Support staff @ full NSO cost (incl. non-accredited)', },
] as const;

type CalculatorRow = Record<string, unknown> & {
  id: number;
  category: string, 
  numberOfTeamMembers: number,
  days: number,
  travelBudget: number, // make it COC or $
  checkIn: string,
  checkOut: string,
  accommodationBudget: number,
  mealsBudget: number,
  insuranceBudget: number,
  totalCostPerTeamMember: number
};

type CalculatorData = {
  rows: CalculatorRow[];
  estimatedCosts: EstimatedCostsData;
};

type CalculatorContentProps = {
  readonly calculatorId: number;
};

// these will be changed later on when we connnect to db (just default values)
const INITIAL_ESTIMATED_COSTS = (): EstimatedCostsData => ({
  clothingPackage: 3200,
  travelEconomyFare: 2400,
  athleteInsurance: 50,
  supportStaffInsurance: 28,
  cellphone: 108,
  mealsPerDay: 118,
  villageMealVoucher: 57,
  knifeAndFork: 2279,
  accommodation: 0,
});

function createTraveler(id: number, category: string = TRAVEL_CATEGORIES[0].title): CalculatorRow {
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


function createInitialCalculatorData(): CalculatorData {
  return {
    rows: TRAVEL_CATEGORIES.map((category) => createTraveler(category.id, category.title)),
    estimatedCosts: INITIAL_ESTIMATED_COSTS(),
  };
}
 
function getStayDuration(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return { days: 0, nights: 0 };

  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return { days: 0, nights: 0 };
  }

  const nights = Math.round((end - start) / 86400000);
  return { days: nights + 1, nights };
}

const columns: ColumnDefinition<CalculatorRow>[] = [
  {
    field: 'category',
    label: 'Access and Priviledges',
    type: 'select',
    width: 430,
    options: TRAVEL_CATEGORIES.map(({ title }) => ({ label: title, value: title })),
  },
  { field: 'numberOfTeamMembers', label: 'Number of Team Members', type: 'number', min: 0, step: 1, width: 150, align: 'center' },
  { field: 'days', label: 'Days on Site', type: 'number', min: 0, step: 1, width: 125, align: 'center' },
  { field: 'travelBudget', label: 'Travel Budget', type: 'number', min: 0, width: 155, align: 'center' },
  { field: 'checkIn', label: 'Check-in Date', type: 'text', placeholder: 'YYYY-MM-DD', width: 155, align: 'center' },
  { field: 'checkOut', label: 'Check-out Date', type: 'text', placeholder: 'YYYY-MM-DD', width: 155, align: 'center' },
  { field: 'accommodationBudget', label: 'Accommodation Budget', type: 'number', min: 0, width: 175, align: 'center' },
  { field: 'mealsBudget', label: 'Meals Budget', type: 'number', min: 0, width: 150, align: 'center' },
  { field: 'insuranceBudget', label: 'Insurance Budget', type: 'number', min: 0, width: 150, align: 'center' },
  { field: 'totalCostPerTeamMember', label: 'Total Cost / Member', type: 'number', min: 0, width: 175, align: 'center' },
];

export default function CalculatorContent({ calculatorId }: CalculatorContentProps) {
  const [calculatorData, setCalculatorData] = useState< Record<number, CalculatorData>>({});
  const [draftRows, setDraftRows] = useState<Record<number, CalculatorRow[]>>({});
  const [editingByCalculator, setEditingByCalculator] = useState<Record<number, boolean>>({});
  const [previewByCalculator, setPreviewByCalculator] = useState<Record<number, boolean>>({});
  const [validationByCalculator, setValidationByCalculator] = useState<Record<number, boolean>>({});

  const currentData = calculatorData[calculatorId] ?? createInitialCalculatorData();
  const isEditing = editingByCalculator[calculatorId] ?? false;
  const isPreview = previewByCalculator[calculatorId] ?? false;
  const hasValidationError = validationByCalculator[calculatorId] ?? false;
  const rows = draftRows[calculatorId] ?? currentData.rows;

  const updateCurrentCalculator = (update: (data: CalculatorData) => CalculatorData) => {
    setCalculatorData((previous) => {
      const current = previous[calculatorId] ?? createInitialCalculatorData();
      return { ...previous, [calculatorId]: update(current) };
    });
  };

  const updateEstimatedCost = (field: keyof EstimatedCostsData, value: number) => {
    updateCurrentCalculator((data) => ({
      ...data,
      estimatedCosts: { ...data.estimatedCosts, [field]: value },
    }));
  };

  
  const startEditing = () => {
    setDraftRows((previous) => ({ ...previous, [calculatorId]: currentData.rows }));
    setEditingByCalculator((previous) => ({ ...previous, [calculatorId]: true }));
    setPreviewByCalculator((previous) => ({ ...previous, [calculatorId]: false }));
  };

  const cancelEditing = () => {
    setDraftRows((previous) => {
      const next = { ...previous };
      delete next[calculatorId];
      return next;
    });
    setEditingByCalculator((previous) => ({ ...previous, [calculatorId]: false }));
    setPreviewByCalculator((previous) => ({ ...previous, [calculatorId]: false }));
  };

  const saveEditing = () => {
    if (hasValidationError) return;
    updateCurrentCalculator((data) => ({ ...data, rows }));
    setEditingByCalculator((previous) => ({ ...previous, [calculatorId]: false }));
    setPreviewByCalculator((previous) => ({ ...previous, [calculatorId]: false }));
  };

  const handleGridRowsChange = (updatedRows: CalculatorRow[]) => {
    setDraftRows((previous) => ({
      ...previous,
      [calculatorId]: updatedRows.map((row) => ({
        ...row, ...getStayDuration(row.checkIn, row.checkOut),
      })),
    }));
  };
  
  const handleAddRow = () => {
    const nextId = Math.max(0, ...rows.map((row) => row.id)) + 1;
    handleGridRowsChange([...rows, createTraveler(nextId)]);
  };


  const accommodationTotal = 0;
  const travelTotal = 0;
  const foodTotal = 0;
  const insuranceTotal = 0;
  const simTotal = 0;
  const estimatedTotal = 0;

  const summary = [
    { label: 'Accommodation:', value: accommodationTotal },
    { label: 'Travel:', value: travelTotal },
    { label: 'Food:', value: foodTotal },
    { label: 'Insurance:', value: insuranceTotal },
    { label: 'SIM card:', value: simTotal },
  ];

  const handleValidationChange = useCallback(
    (hasError: boolean) => {
      setValidationByCalculator((previous) => {
        if (previous[calculatorId] === hasError) {
          return previous;
        }
  
        return {
          ...previous,
          [calculatorId]: hasError,
        };
      });
    },
    [calculatorId]
  );


  return (
    <Box className="w-full min-w-0" data-calculator-id={calculatorId}>
      <Box className="mb-[14px] flex w-full items-center justify-between gap-4 max-[600px]:items-start">
        
        {/* TO DELETE old placeholder for conversion rates 
        <ConversionRates /> 
        */}
      </Box>
      
      <Paper className="max-w-full overflow-hidden rounded-[4px]" variant="outlined">
        <Box className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Typography>
            2026 OLYMPIC WINTER GAMES - MILANO CORTINA
          </Typography>
          
          <Box className="flex items-center gap-2">
            {!isEditing ? (
              <Button size="small" variant="contained" onClick={startEditing} className="rounded-full! px-4!">
                Edit
              </Button>
            ) : (
              <>
              {/* Sliding edit button*/}
              <Box className={"relative flex h-8 w-[170px] items-center rounded-full border border-[#252b37]"}>
                <Box
                  className={`pointer-events-none absolute top-0 left-0 h-full w-1/2 rounded-full bg-[#252b37] transition-transform duration-300 ease-in-out ${
                  isPreview ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />
                <Button size="small" 
                  onClick={() => 
                    setPreviewByCalculator((prev) => ({ 
                      ...prev, 
                      [calculatorId]: false, 
                    }))
                  }
                  className={`relative z-10 h-full w-1/2 min-w-0! rounded-full! p-0! transition-colors! duration-300! ${
                    !isPreview ? 'text-white!' : 'text-[#252b37]!'
                  }`}>
                  Edit
                </Button>

                <Button
                  size="small"
                  disabled={hasValidationError}
                  onClick={() =>
                    setPreviewByCalculator((prev) => ({
                    ...prev,
                    [calculatorId]: true,
                    }))
                  }
                  className={`relative z-10 h-full w-1/2 min-w-0! rounded-full! p-0! transition-colors! duration-300! ${
                    isPreview ? 'text-white!' : 'text-[#252b37]!' }`}
                  >
                  Preview
                </Button>
              </Box>

              <Button
                size="small"
                onClick={cancelEditing}
                className="rounded-full! px-4!"
              >
                Cancel
              </Button>

              <Button
                size="small"
                variant="contained"
                disabled={hasValidationError}
                onClick={saveEditing}
                className="rounded-full! px-4!"
              >
                Save
              </Button>
            </>
          )}
        </Box>

        </Box>

        {/*These settings are to keep the table column sizes from changing when pressing edit and preview */}
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

            
            ${
              isEditing && !isPreview
                ? `
                  [&_.MuiTableHead_.MuiTableCell-root:nth-child(11)]:w-[120px]
                  [&_.MuiTableHead_.MuiTableCell-root:nth-child(11)]:min-w-[120px]
                  [&_.MuiTableHead_.MuiTableCell-root:nth-child(11)]:text-center
                  [&_.MuiTableBody_.MuiTableCell-root:nth-child(11)]:text-center
                `
                : ''
            }
          `}
            ">
          <Grid
            columns={columns}
            rows={rows}
            isEditing={isEditing}
            isPreview={isPreview}
            onRowsChange={handleGridRowsChange}
            onValidationChange={handleValidationChange}
            onAddRow={handleAddRow}
            addButtonLabel="Add New Traveler"
          />
          
        </Box>
      </Paper>

      <EstimatedCosts 
        costs={currentData.estimatedCosts} 
        onChange={updateEstimatedCost} 
        isEditing={isEditing}
        isPreview={isPreview}
      />
      <HotelDetails />
      <CostSummary summary={summary} estimatedTotal={estimatedTotal} />
    </Box>
  );
}
