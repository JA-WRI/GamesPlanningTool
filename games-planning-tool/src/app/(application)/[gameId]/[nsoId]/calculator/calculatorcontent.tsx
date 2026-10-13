// 80% AI generated code:
// The following was AI generated:
// - Original calculator layout, table/input scaffolding, and component organization
// - Temporary calculator-specific state used before backend persistence is added
// - css converted to tailwind
// The table fields and calculator requirements were reviewed and modified manually.

'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ConversionRates from './conversionrates';
import CostSummary from './costsummary';
import EstimatedCosts, { EstimatedCostsData } from './estimatedcosts';
import HotelDetails from './hoteldetails';

const TRAVEL_CATEGORIES = [
  {
    id: 1,
    title: 'Travelling Accredited Alternate Athletes @ partial NSO cost (Ap)',
  },
  {
    id: 2,
    title: 'Travelling Non-accredited Alternate Athletes @ full NSO cost',
  },
  {
    id: 3,
    title: 'Support staff @ partial NSO cost (e.g., partial Ao)',
  },
  {
    id: 4,
    title: 'Support staff @ full NSO cost (incl. non-accredited)',
  },
] as const;

type CalculatorRow = {
  id: number;
  teamMembers: number;
  travelBudget: number;
  checkIn: string;
  checkOut: string;
  accommodationBudget: number;
  simCardBudget: number;
  mealsBudget: number;
  villageMealsBudget: number;
  insuranceBudget: number;
  totalCostPerTeamMember: number;
};

type CalculatorData = {
  rows: CalculatorRow[];
  estimatedCosts: EstimatedCostsData;
};

type CalculatorContentProps = {
  readonly calculatorId: number;
};

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

function createInitialRows(): CalculatorRow[] {
  return TRAVEL_CATEGORIES.map((category) => ({
    id: category.id,
    teamMembers: 0,
    travelBudget: 0,
    checkIn: '',
    checkOut: '',
    accommodationBudget: 0,
    simCardBudget: 0,
    mealsBudget: 0,
    villageMealsBudget: 0,
    insuranceBudget: 0,
    totalCostPerTeamMember: 0,
  }));
}

function createInitialCalculatorData(): CalculatorData {
  return {
    rows: createInitialRows(),
    estimatedCosts: INITIAL_ESTIMATED_COSTS(),
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
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

export default function CalculatorContent({
  calculatorId,
}: CalculatorContentProps) {
  const [calculatorData, setCalculatorData] = useState<
    Record<number, CalculatorData>
  >({});

  const currentData =
    calculatorData[calculatorId] ?? createInitialCalculatorData();

  const updateCurrentCalculator = (
    update: (data: CalculatorData) => CalculatorData,
  ) => {
    setCalculatorData((previous) => {
      const current = previous[calculatorId] ?? createInitialCalculatorData();
      return { ...previous, [calculatorId]: update(current) };
    });
  };

  const updateRow = (
    rowId: number,
    field: keyof CalculatorRow,
    value: string | number,
  ) => {
    updateCurrentCalculator((data) => ({
      ...data,
      rows: data.rows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
    }));
  };
  const updateEstimatedCost = (
    field: keyof EstimatedCostsData,
    value: number,
  ) => {
    updateCurrentCalculator((data) => ({
      ...data,
      estimatedCosts: {
        ...data.estimatedCosts,
        [field]: value,
      },
    }));
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

  const renderTeamMemberInput = (row: CalculatorRow) => (
    <TextField
      className="w-full rounded-none [&_.MuiInput-root]:min-h-[38px] [&_.MuiInput-root]:rounded-none [&_.MuiInput-root]:bg-white [&_.MuiInput-root]:text-[16px] [&_.MuiInputBase-input]:px-1 [&_.MuiInputBase-input]:pt-[10px] [&_.MuiInputBase-input]:pb-[6px] [&_.MuiInputBase-input]:text-center [&_.MuiInput-root:before]:border-b [&_.MuiInput-root:before]:border-[#ab4c277a] [&_.MuiInput-root:hover:not(.Mui-disabled):not(.Mui-error):before]:border-[#ffb663] [&_.MuiInput-root:after]:border-b-2 [&_.MuiInput-root:after]:border-[#ffb663] [&_input[type=number]]:[appearance:textfield] [&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none max-[1024px]:[&_.MuiInputBase-root]:min-h-[34px] max-[1024px]:[&_.MuiInputBase-root]:text-[11px] max-[1024px]:[&_.MuiInputBase-input]:px-[6px] max-[1024px]:[&_.MuiInputBase-input]:py-[7px] max-[1024px]:[&_.MuiInputBase-input]:text-[11px] max-[768px]:[&_.MuiInputBase-root]:min-h-8 max-[768px]:[&_.MuiInputBase-root]:text-[10px] max-[768px]:[&_.MuiInputBase-input]:px-[5px] max-[768px]:[&_.MuiInputBase-input]:py-[6px]"
      type="number"
      variant="standard"
      size="small"
      fullWidth
      value={row.teamMembers}
      onChange={(event) =>
        updateRow(
          row.id,
          'teamMembers',
          Math.max(0, Number(event.target.value) || 0),
        )
      }
      slotProps={{
        htmlInput: {
          min: 0,
          step: 1,
          'aria-label': `Number of team members for category ${row.id}`,
        },
      }}
    />
  );

  const renderReadOnlyValue = (
    value: number,
    label: string,
    isCurrency = false,
  ) => (
    <Typography
      className="cursor-default text-[#222] select-none"
      aria-label={label}
    >
      {isCurrency ? formatCurrency(value) : value}
    </Typography>
  );

  return (
    <Box className="w-full min-w-0" data-calculator-id={calculatorId}>
      <Box className="mb-[14px] flex w-full items-center justify-between gap-4 max-[600px]:items-start">
        <Box className="flex items-start gap-10 max-[600px]:gap-x-3 max-[600px]:gap-y-2 [&_h2]:m-0 [&_h2]:pt-[7px] [&_h2]:pl-[5px] [&_h2]:text-[18px] [&_h2]:leading-[1.35] [&_h2]:font-bold [&_h2]:text-[#111] [&_a]:inline-flex [&_a]:w-fit [&_a]:items-center [&_a]:border-b [&_a]:border-[#c6c6c6] [&_a]:px-[10px] [&_a]:py-[7px] [&_a]:text-[16px] [&_a]:leading-[1.4] [&_a]:font-medium [&_a]:text-[#555] [&_a]:no-underline [&_a]:transition-colors [&_a:hover]:border-[#e06410] [&_a:hover]:text-[#e06410] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-[#e06410] [&_a:active]:text-[#bc65e4]">
          <h2>Links:</h2>
          <a
            href="https://drive.google.com/drive/folders/1YLt82-95BMaAmetoMYpdpUMf-V0jBl9j?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Food & Beverage Guidelines
          </a>

          <a
            href="https://docs.google.com/spreadsheets/d/1XK2_WWzjYgJN0BHuGRM_yIyyb82rgw59f-hqg-sY7XY/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            Access and Privileges
          </a>
        </Box>
        <Box className="flex items-center gap-3 [&_h2]:m-0 [&_h2]:whitespace-nowrap [&_h2]:text-[18px] [&_h2]:leading-[1.35] [&_h2]:font-bold [&_h2]:text-[#111]">
          <h2>Currency:</h2>
          <ConversionRates />
        </Box>
      </Box>

      <Paper
        className="max-w-full overflow-hidden rounded-[4px] border-2 border-[#ab4c27b4] bg-white shadow-none!"
        variant="outlined"
      >
        <Box className="flex h-[55px] items-center justify-start border-b-2 border-[#ab4c277a] bg-[#ab4c27] px-4 py-3 max-[1024px]:px-3 max-[1024px]:py-[10px] [&_.MuiTypography-root]:text-[18px] [&_.MuiTypography-root]:leading-[1.35] [&_.MuiTypography-root]:font-semibold [&_.MuiTypography-root]:text-[#fffcf8]">
          <Typography>NSO FUNDED TEAM MEMBERS ESTIMATED COSTS</Typography>
        </Box>

        <TableContainer className="block w-full max-w-full overflow-x-scroll overflow-y-hidden [scrollbar-gutter:stable] [scrollbar-width:auto] [scrollbar-color:#ee9247_#ebeaea] [&::-webkit-scrollbar]:h-[13px] [&::-webkit-scrollbar-track]:bg-[#eee] [&::-webkit-scrollbar-thumb]:rounded-[8px] [&::-webkit-scrollbar-thumb]:border-[3px] [&::-webkit-scrollbar-thumb]:border-[#eee] [&::-webkit-scrollbar-thumb]:bg-[#898989] [&::-webkit-scrollbar-thumb:hover]:bg-[#666] max-[768px]:touch-pan-x max-[768px]:[&::-webkit-scrollbar]:h-[14px]">
          <Table
            className="w-full min-w-[2050px] table-fixed border-collapse max-[1024px]:min-w-[1600px] max-[768px]:min-w-[1450px]"
            size="small"
          >
            <TableHead>
              <TableRow className="bg-[#f7f3f1]! [&_.MuiTableCell-root]:h-[58px] [&_.MuiTableCell-root]:border-b [&_.MuiTableCell-root]:border-[#ab4c277a] [&_.MuiTableCell-root]:px-3 [&_.MuiTableCell-root]:py-[13px] [&_.MuiTableCell-root]:text-center [&_.MuiTableCell-root]:align-middle [&_.MuiTableCell-root]:text-[16px] [&_.MuiTableCell-root]:leading-[1.4] [&_.MuiTableCell-root]:font-medium [&_.MuiTableCell-root]:text-[#2c1602] [&_.MuiTableCell-root:first-child]:w-[500px] [&_.MuiTableCell-root:first-child]:border-r [&_.MuiTableCell-root:first-child]:border-[#ab4c277a] [&_.MuiTableCell-root:first-child]:pl-[18px] [&_.MuiTableCell-root:first-child]:text-left [&_.MuiTableCell-root:nth-child(2)]:w-[145px] [&_.MuiTableCell-root:nth-child(2)]:pl-5 [&_.MuiTableCell-root:nth-child(3)]:w-[145px] [&_.MuiTableCell-root:nth-child(4)]:w-[155px] [&_.MuiTableCell-root:nth-child(5)]:w-[155px] [&_.MuiTableCell-root:nth-child(6)]:w-[170px] [&_.MuiTableCell-root:nth-child(7)]:w-[170px] [&_.MuiTableCell-root:nth-child(8)]:w-[160px] [&_.MuiTableCell-root:nth-child(n+9)]:w-[150px] max-[1024px]:[&_.MuiTableCell-root]:h-[50px] max-[1024px]:[&_.MuiTableCell-root]:px-2 max-[1024px]:[&_.MuiTableCell-root]:py-[9px] max-[1024px]:[&_.MuiTableCell-root]:text-[11px] max-[1024px]:[&_.MuiTableCell-root]:leading-[1.25] max-[1024px]:[&_.MuiTableCell-root:first-child]:w-[370px] max-[1024px]:[&_.MuiTableCell-root:first-child]:pl-3 max-[768px]:[&_.MuiTableCell-root]:h-[48px] max-[768px]:[&_.MuiTableCell-root]:px-[6px] max-[768px]:[&_.MuiTableCell-root]:py-2 max-[768px]:[&_.MuiTableCell-root]:text-[10px] max-[768px]:[&_.MuiTableCell-root:first-child]:w-[330px]">
                <TableCell>{/* Empty cell */}</TableCell>
                <TableCell>Number of Team Members</TableCell>
                <TableCell>Travel Budget</TableCell>
                <TableCell>Check-in Date</TableCell>
                <TableCell>Check-out Date</TableCell>
                <TableCell>Days on Site per Team Member </TableCell>
                <TableCell>Nights on Site Per Team Member</TableCell>
                <TableCell>Accommodation Budget</TableCell>
                <TableCell>SIM Card Budget</TableCell>
                <TableCell>Meals Budget</TableCell>
                <TableCell>Village Meals Budget</TableCell>
                <TableCell>Insurance Budget</TableCell>
                <TableCell>Total Cost per Team Member</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {currentData.rows.map((row) => {
                const category = TRAVEL_CATEGORIES.find(
                  (item) => item.id === row.id,
                );
                const stayDuration = getStayDuration(row.checkIn, row.checkOut);

                return (
                  <TableRow
                    key={row.id}
                    className="[&_.MuiTableCell-root]:h-[68px] [&_.MuiTableCell-root]:border-b [&_.MuiTableCell-root]:border-[#e2c1b3] [&_.MuiTableCell-root:first-child]:border-r [&_.MuiTableCell-root:first-child]:border-[#ab4c277a]"
                  >
                    <TableCell className="bg-white px-[18px] py-[14px] align-middle max-[1024px]:px-3! max-[1024px]:py-[10px]!">
                      <Typography className="text-[16px] leading-[1.5] font-normal text-[#222] max-[1024px]:text-[12px] max-[1024px]:leading-[1.4] max-[768px]:text-[11px]">
                        {category?.title}
                      </Typography>
                    </TableCell>

                    <TableCell className="bg-white px-3 py-[10px] text-center align-middle active:bg-white max-[1024px]:px-2! max-[1024px]:py-[7px]! max-[768px]:p-[6px]!">
                      {renderTeamMemberInput(row)}
                    </TableCell>
                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(
                        row.travelBudget,
                        'Travel budget',
                        true,
                      )}
                    </TableCell>

                    <TableCell className="bg-white px-3 py-[10px] text-center align-middle active:bg-white max-[1024px]:px-2! max-[1024px]:py-[7px]! max-[768px]:p-[6px]!">
                      <TextField
                        className="w-full rounded-none [&_.MuiInput-root]:min-h-[38px] [&_.MuiInput-root]:rounded-none [&_.MuiInput-root]:bg-white [&_.MuiInput-root]:text-[16px] [&_.MuiInputBase-input]:px-1 [&_.MuiInputBase-input]:pt-[10px] [&_.MuiInputBase-input]:pb-[6px] [&_.MuiInputBase-input]:text-center [&_.MuiInput-root:before]:border-b [&_.MuiInput-root:before]:border-[#ab4c277a] [&_.MuiInput-root:hover:not(.Mui-disabled):not(.Mui-error):before]:border-[#ffb663] [&_.MuiInput-root:after]:border-b-2 [&_.MuiInput-root:after]:border-[#ffb663] [&_input[type=number]]:[appearance:textfield] [&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none max-[1024px]:[&_.MuiInputBase-root]:min-h-[34px] max-[1024px]:[&_.MuiInputBase-root]:text-[11px] max-[1024px]:[&_.MuiInputBase-input]:px-[6px] max-[1024px]:[&_.MuiInputBase-input]:py-[7px] max-[1024px]:[&_.MuiInputBase-input]:text-[11px] max-[768px]:[&_.MuiInputBase-root]:min-h-8 max-[768px]:[&_.MuiInputBase-root]:text-[10px] max-[768px]:[&_.MuiInputBase-input]:px-[5px] max-[768px]:[&_.MuiInputBase-input]:py-[6px] [&_input]:text-center"
                        type="date"
                        variant="standard"
                        size="small"
                        fullWidth
                        value={row.checkIn}
                        onChange={(event) =>
                          updateRow(row.id, 'checkIn', event.target.value)
                        }
                        slotProps={{
                          htmlInput: { 'aria-label': 'Check-in date' },
                        }}
                      />
                    </TableCell>

                    <TableCell className="bg-white px-3 py-[10px] text-center align-middle active:bg-white max-[1024px]:px-2! max-[1024px]:py-[7px]! max-[768px]:p-[6px]!">
                      <TextField
                        className="w-full rounded-none [&_.MuiInput-root]:min-h-[38px] [&_.MuiInput-root]:rounded-none [&_.MuiInput-root]:bg-white [&_.MuiInput-root]:text-[16px] [&_.MuiInputBase-input]:px-1 [&_.MuiInputBase-input]:pt-[10px] [&_.MuiInputBase-input]:pb-[6px] [&_.MuiInputBase-input]:text-center [&_.MuiInput-root:before]:border-b [&_.MuiInput-root:before]:border-[#ab4c277a] [&_.MuiInput-root:hover:not(.Mui-disabled):not(.Mui-error):before]:border-[#ffb663] [&_.MuiInput-root:after]:border-b-2 [&_.MuiInput-root:after]:border-[#ffb663] [&_input[type=number]]:[appearance:textfield] [&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none max-[1024px]:[&_.MuiInputBase-root]:min-h-[34px] max-[1024px]:[&_.MuiInputBase-root]:text-[11px] max-[1024px]:[&_.MuiInputBase-input]:px-[6px] max-[1024px]:[&_.MuiInputBase-input]:py-[7px] max-[1024px]:[&_.MuiInputBase-input]:text-[11px] max-[768px]:[&_.MuiInputBase-root]:min-h-8 max-[768px]:[&_.MuiInputBase-root]:text-[10px] max-[768px]:[&_.MuiInputBase-input]:px-[5px] max-[768px]:[&_.MuiInputBase-input]:py-[6px] [&_input]:text-center"
                        type="date"
                        variant="standard"
                        size="small"
                        fullWidth
                        value={row.checkOut}
                        onChange={(event) =>
                          updateRow(row.id, 'checkOut', event.target.value)
                        }
                        slotProps={{
                          htmlInput: { 'aria-label': 'Check-out date' },
                        }}
                      />
                    </TableCell>

                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(stayDuration.days, 'Number of days')}
                    </TableCell>
                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(
                        stayDuration.nights,
                        'Number of nights',
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(
                        row.accommodationBudget,
                        'Accommodation budget',
                        true,
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(
                        row.simCardBudget,
                        'SIM card budget',
                        true,
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(
                        row.mealsBudget,
                        'Meals budget',
                        true,
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(
                        row.villageMealsBudget,
                        'Village meals budget',
                        true,
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(
                        row.insuranceBudget,
                        'Insurance budget',
                        true,
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-[10px] text-center align-middle active:bg-white">
                      {renderReadOnlyValue(
                        row.totalCostPerTeamMember,
                        'Total cost per team member',
                        true,
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <EstimatedCosts
        costs={currentData.estimatedCosts}
        onChange={updateEstimatedCost}
      />
      <HotelDetails />

      <CostSummary summary={summary} estimatedTotal={estimatedTotal} />
    </Box>
  );
}
