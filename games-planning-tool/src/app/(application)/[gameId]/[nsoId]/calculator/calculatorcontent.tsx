// 70% AI generated code:
// The following was generated:
// - Original layout of the calculator content, including the basic structure of the table and inputs

"use client";

import { useState } from "react";

import {
  Box,
  Divider,
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

// Fixed categories from the calculator spreadsheet.
const TRAVEL_CATEGORIES = [
  {
    id: 1,
    title:
      "Travelling Accredited Alternate Athletes @ partial NSO cost (Ap)",
  },
  {
    id: 2,
    title:
      "Travelling Non-accredited Alternate Athletes @ full NSO cost",
  },
  {
    id: 3,
    title:
      "Support staff @ partial NSO cost (e.g., partial Ao)",
  },
  {
    id: 4,
    title:
      "Support staff @ full NSO cost (incl. non-accredited)",
  },
] as const;

type CalculatorRow = {
  id: number;
  teamMembers: number;
  daysOnSite: number;
  travel: number;
  number: number;
  checkIn: string;
  checkOut: string;
  days: number;
  nights: number;
  accommodationBudget: number;
  travelBudget: number;
};

type CalculatorContentProps = {
  readonly calculatorId: number;
};

// Every calculator starts with four fixed rows.
// All numeric values are initialized to zero.
function createInitialRows(): CalculatorRow[] {
  return TRAVEL_CATEGORIES.map((category) => ({
    id: category.id,
    teamMembers: 0,
    daysOnSite: 0,
    travel: 0,
    number: 0,
    checkIn: "",
    checkOut: "",
    days: 0,
    nights: 0,
    accommodationBudget: 0,
    travelBudget: 0,
  }));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

export default function CalculatorContent({
  calculatorId,
}: CalculatorContentProps) {
  const [rowsByCalculator, setRowsByCalculator] = useState<
    Record<number, CalculatorRow[]>
  >({});

  const rows =
    rowsByCalculator[calculatorId] ?? createInitialRows();

  // Updates an input without performing calculations.
  const updateRow = (
    rowId: number,
    field: keyof CalculatorRow,
    value: string | number
  ) => {
    setRowsByCalculator((previous) => {
      const currentRows =
        previous[calculatorId] ?? createInitialRows();

      return {
        ...previous,
        [calculatorId]: currentRows.map((row) =>
          row.id === rowId
            ? { ...row, [field]: value }
            : row
        ),
      };
    });
  };

  // Placeholder values until calculation logic is implemented.
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

  // Reusable numeric MUI input.
  const renderNumberInput = (
    row: CalculatorRow,
    field: keyof CalculatorRow
  ) => (
    <TextField
      className="calculator-content-input"
      type="number"
      size="small"
      fullWidth
      value={row[field]}
      onChange={(event) =>
        updateRow(
          row.id,
          field,
          Math.max(0, Number(event.target.value) || 0)
        )
      }
      slotProps={{
        htmlInput: {
          min: 0,
          step: 1,
          "aria-label": `${field} for category ${row.id}`,
        },
      }}
    />
  );

  return (
    <Box
      className="calculator"
      data-calculator-id={calculatorId}
    >
      {/* TRAVELERS SECTION */}
      <Paper
        className="calculator-content-panel"
        variant="outlined"
      >
        <Box className="calculator-content-section-heading">
          <Typography>NSO FUNDED TEAM MEMBERS ESTIMATED COSTS</Typography>
        </Box>

        <TableContainer className="calculator-content-table-container">
          <Table
            className="calculator-content-table"
            size="small"
          >
            <TableHead>
              <TableRow className="calculator-content-table-head-row">
                <TableCell>
                  {/* Empty cell*/}
                </TableCell>

                <TableCell>
                  Number of Team Members
                </TableCell>

                <TableCell>
                  Days on Site per Team Member
                </TableCell>

                <TableCell>
                  Travel
                </TableCell>

                <TableCell>
                  Number
                </TableCell>

                <TableCell>
                  Check-in
                </TableCell>

                <TableCell>
                  Check-out
                </TableCell>

                <TableCell>
                  Number of Days
                </TableCell>

                <TableCell>
                  Number of Nights
                </TableCell>

                <TableCell>
                  Accommodation Budget
                </TableCell>

                <TableCell>
                  Travel Budget
                </TableCell>

                <TableCell>
                  SIM Card Budget
                </TableCell>

                <TableCell>
                  Meals Budget
                </TableCell>

                <TableCell>
                  Village Meals Budget
                </TableCell>

                <TableCell>
                  Insurance Budget
                </TableCell>

                <TableCell>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => {
                const category = TRAVEL_CATEGORIES.find(
                  (item) => item.id === row.id
                );

                return (
                  <TableRow
                    key={row.id}
                    className="calculator-content-data-row"
                  >
                    {/* Fixed category title */}
                    <TableCell className="calculator-content-category-cell">
                      <Typography className="calculator-content-category-title">
                        {category?.title}
                      </Typography>
                    </TableCell>

                    {/* Number of team members */}
                    <TableCell className="calculator-content-editable-cell">
                      {renderNumberInput(row, "teamMembers")}
                    </TableCell>

                    {/* Days on site */}
                    <TableCell className="calculator-content-editable-cell">
                      {renderNumberInput(row, "daysOnSite")}
                    </TableCell>

                    {/* Travel */}
                    <TableCell className="calculator-content-editable-cell">
                      <TextField
                        className="calculator-content-input"
                        type="number"
                        size="small"
                        fullWidth
                        value={row.travel}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "travel",
                            Math.max(
                              0,
                              Number(event.target.value) || 0
                            )
                          )
                        }
                        slotProps={{
                          htmlInput: { min: 0, step: 0.01 },
                          input: {
                            startAdornment: (
                              <Typography sx={{ mr: 0.5, fontSize: 12 }}>
                                $
                              </Typography>
                            ),
                          },
                        }}
                      />
                    </TableCell>

                    {/* Number */}
                    <TableCell className="calculator-content-editable-cell">
                      {renderNumberInput(row, "number")}
                    </TableCell>

                    {/* Check-in */}
                    <TableCell className="calculator-content-editable-cell">
                      <TextField
                        className="calculator-content-input"
                        type="date"
                        size="small"
                        fullWidth
                        value={row.checkIn}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "checkIn",
                            event.target.value
                          )
                        }
                        slotProps={{
                          htmlInput: {
                            "aria-label": "Check-in date",
                          },
                        }}
                      />
                    </TableCell>

                    {/* Check-out */}
                    <TableCell className="calculator-content-editable-cell">
                      <TextField
                        className="calculator-content-input"
                        type="date"
                        size="small"
                        fullWidth
                        value={row.checkOut}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "checkOut",
                            event.target.value
                          )
                        }
                        slotProps={{
                          htmlInput: {
                            "aria-label": "Check-out date",
                          },
                        }}
                      />
                    </TableCell>

                    {/* Days */}
                    <TableCell className="calculator-content-editable-cell">
                      {renderNumberInput(row, "days")}
                    </TableCell>

                    {/* Nights */}
                    <TableCell className="calculator-content-editable-cell">
                      {renderNumberInput(row, "nights")}
                    </TableCell>

                    {/* Accommodation Budget */}
                    <TableCell className="calculator-content-editable-cell">
                      {renderNumberInput(row, "accommodationBudget")}
                    </TableCell>

                    {/* Travel Budget */}
                    <TableCell className="calculator-content-editable-cell">
                      {renderNumberInput(row, "travelBudget")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* COST SUMMARY */}
      <Paper
        className="calculator-content-panel calculator-content-summary"
        variant="outlined"
      >
        <Box className="calculator-content-summary-content">
          <Typography className="calculator-content-summary-title">
            Cost Summary
          </Typography>

          {summary.map((item) => (
            <Box
              key={item.label}
              className="calculator-content-summary-row"
            >
              <Typography>
                {item.label}
              </Typography>

              <Typography>
                {formatCurrency(item.value)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        <Box className="calculator-content-estimated-total">
          <Box>
            <Typography className="calculator-content-estimated-label">
              Estimated Total:
            </Typography>

            <Typography className="calculator-content-note">
              Excludes clothing packages (individual need)
            </Typography>
          </Box>

          <Typography className="calculator-content-estimated-amount">
            {formatCurrency(estimatedTotal)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
