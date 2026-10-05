// 90% AI generated code for original layout of the calculator content
"use client";

import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
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

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

// Replace defaults values later!!
const RATES = {
  accommodationPerNight: 0,
  foodPerDay: 0,
  simPerPerson: 0,
  insurancePerPerson: 0,
};

export type Traveler = {
  id: number;
  category: string;
  number: number;
  checkIn: string;
  checkOut: string;
  accommodationRate: number;
  travelCost: number;
};

export function createTraveler(id: number): Traveler {
  return {
    id,
    category: "",
    number: 1,
    checkIn: "",
    checkOut: "",
    accommodationRate: RATES.accommodationPerNight,
    travelCost: 0,
  };
}

type CalculatorContentProps = {
  readonly calculatorId: number;
  readonly travelers: Traveler[];
  readonly onTravelersChange: (travelers: Traveler[]) => void;
};

// Calculate the difference between two calendar dates.
// Using UTC avoids daylight-saving-time calculation errors.
function getNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;

  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;

  return Math.max(0, Math.round((end - start) / 86400000));
}

function getDays(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;

  const nights = getNights(checkIn, checkOut);

  return nights > 0 ? nights + 1 : 0;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

export default function CalculatorContent({
  calculatorId,
  travelers,
  onTravelersChange,
}: CalculatorContentProps) {

  // Update one field for a specific traveler.
  const updateTraveler = (
    id: number,
    field: keyof Traveler,
    value: string | number
  ) => {
    const updated = travelers.map((traveler) =>
      traveler.id === id
        ? { ...traveler, [field]: value }
        : traveler
    );

    onTravelersChange(updated);
  };

  const addTraveler = () => {
    const newId =
      Math.max(0, ...travelers.map((traveler) => traveler.id)) + 1;

    onTravelersChange([...travelers, createTraveler(newId)]);
  };

  const removeTraveler = (id: number) => {
    onTravelersChange(
      travelers.filter((traveler) => traveler.id !== id)
    );
  };

  // Live calculations.
  const accommodationTotal = travelers.reduce((sum, traveler) => {
    const nights = getNights(traveler.checkIn, traveler.checkOut);

    return (
      sum +
      nights * traveler.number * traveler.accommodationRate
    );
  }, 0);

  const travelTotal = travelers.reduce(
    (sum, traveler) =>
      sum + traveler.travelCost * traveler.number,
    0
  );

  const foodTotal = travelers.reduce((sum, traveler) => {
    const days = getDays(traveler.checkIn, traveler.checkOut);

    return sum + days * traveler.number * RATES.foodPerDay;
  }, 0);

  const totalPeople = travelers.reduce(
    (sum, traveler) => sum + traveler.number,
    0
  );

  const insuranceTotal =
    totalPeople * RATES.insurancePerPerson;

  const simTotal =
    totalPeople * RATES.simPerPerson;

  const estimatedTotal =
    accommodationTotal +
    travelTotal +
    foodTotal +
    insuranceTotal +
    simTotal;

  const summary = [
    { label: "Accommodation:", value: accommodationTotal },
    { label: "Travel:", value: travelTotal },
    { label: "Food:", value: foodTotal },
    { label: "Insurance:", value: insuranceTotal },
    { label: "SIM card:", value: simTotal },
  ];

  return (
    <Box className="calculator" data-calculator-id={calculatorId}>
      {/* TRAVELERS SECTION */}
      <Paper
        className="calculator__panel"
        variant="outlined"
      >
        <Box className="calculator__section-heading">
          <Typography>
            Travelers
          </Typography>
        </Box>

        {/* Horizontal scrolling table */}
        <TableContainer className="calculator__table-container">
          <Table
            className="calculator__table"
            size="small"
          >
            <TableHead>
              <TableRow className="calculator__table-head-row">
                <TableCell>
                  Travel Category
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
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {travelers.map((traveler) => {
                const nights = getNights(
                  traveler.checkIn,
                  traveler.checkOut
                );

                const days = getDays(
                  traveler.checkIn,
                  traveler.checkOut
                );

                const invalidDates =
                  !!traveler.checkIn &&
                  !!traveler.checkOut &&
                  traveler.checkOut <= traveler.checkIn;

                return (
                  <TableRow key={traveler.id} hover>
                    {/* Category */}
                    <TableCell className="calculator__cell">
                      <TextField
                        select
                        fullWidth
                        size="small"
                        variant="standard"
                        value={traveler.category}
                        onChange={(event) =>
                          updateTraveler(
                            traveler.id,
                            "category",
                            event.target.value
                          )
                        }
                        slotProps={{
                          select: { displayEmpty: true },
                        }}
                        className="calculator__category"
                      >
                        <MenuItem value="" disabled>
                          Select
                        </MenuItem>
                        <MenuItem value="Athlete">
                          Athlete
                        </MenuItem>
                        <MenuItem value="Coach">
                          Coach
                        </MenuItem>
                        <MenuItem value="Staff">
                          Staff
                        </MenuItem>
                        <MenuItem value="Official">
                          Official
                        </MenuItem>
                        <MenuItem value="Other">
                          Other
                        </MenuItem>
                      </TextField>
                    </TableCell>

                    {/* Number of travelers */}
                    <TableCell className="calculator__cell">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={traveler.number}
                        onChange={(event) =>
                          updateTraveler(
                            traveler.id,
                            "number",
                            Math.max(
                              0,
                              Math.floor(Number(event.target.value) || 0)
                            )
                          )
                        }
                        slotProps={{ htmlInput: { min: 0, step: 1 } }}
                        className="calculator__input"
                      />
                    </TableCell>

                    {/* Check-in */}
                    <TableCell className="calculator__cell">
                      <TextField
                        type="date"
                        size="small"
                        fullWidth
                        value={traveler.checkIn}
                        onChange={(event) =>
                          updateTraveler(
                            traveler.id,
                            "checkIn",
                            event.target.value
                          )
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                        className="calculator__input"
                      />
                    </TableCell>

                    {/* Check-out */}
                    <TableCell className="calculator__cell">
                      <TextField
                        type="date"
                        size="small"
                        fullWidth
                        value={traveler.checkOut}
                        error={invalidDates}
                        onChange={(event) =>
                          updateTraveler(
                            traveler.id,
                            "checkOut",
                            event.target.value
                          )
                        }
                        slotProps={{
                          htmlInput: {
                            min: traveler.checkIn || undefined,
                          },
                          inputLabel: { shrink: true },
                        }}
                        className="calculator__input"
                      />
                    </TableCell>

                    {/* Calculated days */}
                    <TableCell
                      align="center"
                      className="calculator__cell"
                    >
                      {days}
                    </TableCell>

                    {/* Calculated nights */}
                    <TableCell
                      align="center"
                      className="calculator__cell"
                    >
                      {nights}
                    </TableCell>

                    {/* Accommodation nightly rate */}
                    <TableCell className="calculator__cell">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={traveler.accommodationRate}
                        onChange={(event) =>
                          updateTraveler(
                            traveler.id,
                            "accommodationRate",
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
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                        }}
                        className="calculator__input"
                      />
                    </TableCell>

                    {/* Travel cost per person */}
                    <TableCell className="calculator__cell">
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        value={traveler.travelCost}
                        onChange={(event) =>
                          updateTraveler(
                            traveler.id,
                            "travelCost",
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
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          },
                        }}
                        className="calculator__input"
                      />
                    </TableCell>

                    {/* Remove traveler */}
                    <TableCell
                      align="center"
                      className="calculator__cell"
                    >
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Remove traveler"
                        onClick={() =>
                          removeTraveler(traveler.id)
                        }
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add traveler footer */}
        <Box className="calculator__table-footer">
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={addTraveler}
            className="calculator__add-button"
          >
            Add New Traveler
          </Button>
        </Box>
      </Paper>

      {/* COST SUMMARY */}
      <Paper
        className="calculator__panel calculator__summary"
        variant="outlined"
      >
        <Box className="calculator__summary-content">
          <Typography className="calculator__summary-title">
            Cost Summary
          </Typography>

          {summary.map((item) => (
            <Box
              key={item.label}
              className="calculator__summary-row"
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

        {/* Estimated total */}
        <Box className="calculator__estimated-total">
          <Box>
            <Typography className="calculator__estimated-label">
              Estimated Total:
            </Typography>

            <Typography className="calculator__note">
              Excludes clothing packages (individual need)
            </Typography>
          </Box>

          <Typography className="calculator__estimated-amount">
            {formatCurrency(estimatedTotal)}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
