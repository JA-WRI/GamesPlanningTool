// 80% AI generated code:
// The following was AI generated:
// - Original calculator layout, table/input scaffolding, and component organization
// - Temporary calculator-specific state used before backend persistence is added
// The table fields and calculator requirements were reviewed and modified manually.

"use client";

import { useState } from "react";
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
} from "@mui/material";
import ConversionRates from "./conversionrates";
import CostSummary from "./costsummary";
import EstimatedCosts, { EstimatedCostsData } from "./estimatedcosts";
import "./calculatorcontent.css";
import HotelDetails from "./hoteldetails";

const TRAVEL_CATEGORIES = [
  {
    id: 1,
    title: "Travelling Accredited Alternate Athletes @ partial NSO cost (Ap)",
  },
  {
    id: 2,
    title: "Travelling Non-accredited Alternate Athletes @ full NSO cost"
  },
  {
    id: 3,
    title: "Support staff @ partial NSO cost (e.g., partial Ao)",
  },
  {
    id: 4,
    title: "Support staff @ full NSO cost (incl. non-accredited)",
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
    checkIn: "",
    checkOut: "",
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
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
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
    update: (data: CalculatorData) => CalculatorData
  ) => {
    setCalculatorData((previous) => {
      const current = previous[calculatorId] ?? createInitialCalculatorData();
      return { ...previous, [calculatorId]: update(current) };
    });
  };

  
  const updateRow = (
    rowId: number,
    field: keyof CalculatorRow,
    value: string | number
  ) => {
    updateCurrentCalculator((data) => ({
      ...data,
      rows: data.rows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      ),
    }));
  };
  const updateEstimatedCost = (
    field: keyof EstimatedCostsData,
    value: number
  ) => {
    updateCurrentCalculator((data) => ({
      ...data,
      estimatedCosts: {
        ...data.estimatedCosts,
        [field]: value,
      }
    }));
  };


  const accommodationTotal = 0;
  const travelTotal = 0;
  const foodTotal = 0;
  const insuranceTotal = 0;
  const simTotal = 0;
  const estimatedTotal = 0;

  const summary = [
    { label: "Accommodation:", value: accommodationTotal },
    { label: "Travel:", value: travelTotal },
    { label: "Food:", value: foodTotal },
    { label: "Insurance:", value: insuranceTotal },
    { label: "SIM card:", value: simTotal },
  ];

  const renderTeamMemberInput = (row: CalculatorRow) => (
    <TextField
      className="calculator-content-input"
      type="number"
      variant="standard"
      size="small"
      fullWidth
      value={row.teamMembers}
      onChange={(event) =>
        updateRow(row.id, "teamMembers", Math.max(0, Number(event.target.value) || 0))
      }
      slotProps={{
        htmlInput: { min: 0, step: 1, "aria-label": `Number of team members for category ${row.id}` },
      }}
    />
  );

  const renderReadOnlyValue = (value: number, label: string, isCurrency = false) => (
    <Typography className="calculator-content-readonly-value" aria-label={label}>
      {isCurrency ? formatCurrency(value) : value}
    </Typography>
  );

  return (
    <Box className="calculator" data-calculator-id={calculatorId}>

      <Box className="calculator-links-conversion-rates">
        
        <Box className="calculator-links">
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
        <Box className="currency-selector">
          <h2>Currency:</h2>
          <ConversionRates />
        </Box>
      </Box>

      <Paper className="calculator-content-panel" variant="outlined">
        <Box className="calculator-content-section-heading">
          <Typography>NSO FUNDED TEAM MEMBERS ESTIMATED COSTS</Typography>
        </Box>

        <TableContainer className="calculator-content-table-container">
          <Table className="calculator-content-table" size="small">
            <TableHead>
              <TableRow className="calculator-content-table-head-row">
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
                  (item) => item.id === row.id
                );
                const stayDuration = getStayDuration(row.checkIn, row.checkOut);

                return (
                  <TableRow key={row.id} className="calculator-content-data-row">
                    <TableCell className="calculator-content-category-cell">
                      <Typography className="calculator-content-category-title">
                        {category?.title}
                      </Typography>
                    </TableCell>

                    <TableCell className="calculator-content-editable-cell">
                      {renderTeamMemberInput(row)}
                    </TableCell>
                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(row.travelBudget, "Travel budget", true)}
                    </TableCell>

                    <TableCell className="calculator-content-editable-cell">
                      <TextField
                        className="calculator-content-input calculator-content-date-input"
                        type="date"
                        variant="standard"
                        size="small"
                        fullWidth
                        value={row.checkIn}
                        onChange={(event) =>
                          updateRow(row.id, "checkIn", event.target.value)
                        }
                        slotProps={{ htmlInput: { "aria-label": "Check-in date" } }}
                      />
                    </TableCell>

                    <TableCell className="calculator-content-editable-cell">
                      <TextField
                        className="calculator-content-input calculator-content-date-input"
                        type="date"
                        variant="standard"
                        size="small"
                        fullWidth
                        value={row.checkOut}
                        onChange={(event) =>
                          updateRow(row.id, "checkOut", event.target.value)
                        }
                        slotProps={{ htmlInput: { "aria-label": "Check-out date" } }}
                      />
                    </TableCell>

                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(stayDuration.days, "Number of days")}
                    </TableCell>
                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(stayDuration.nights, "Number of nights")}
                    </TableCell>
                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(row.accommodationBudget, "Accommodation budget", true)}
                    </TableCell>
                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(row.simCardBudget, "SIM card budget", true)}
                    </TableCell>
                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(row.mealsBudget, "Meals budget", true)}
                    </TableCell>
                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(row.villageMealsBudget, "Village meals budget", true)}
                    </TableCell>
                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(row.insuranceBudget, "Insurance budget", true)}
                    </TableCell>
                    <TableCell className="calculator-content-readonly-cell">
                      {renderReadOnlyValue(row.totalCostPerTeamMember, "Total cost per team member", true)}
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
