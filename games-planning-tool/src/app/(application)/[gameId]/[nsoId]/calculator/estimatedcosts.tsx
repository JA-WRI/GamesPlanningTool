// 80% AI generated code:
// The following was AI generated:
// - Original estimated cost component structure and MUI inputs
// The layout, cost categories, values, and styling were modified
// to match the wanted calculator design.

"use client";

import {
  Box,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import "./estimatedcosts.css";

export type EstimatedCostsData = {
  clothingPackage: number;
  travelEconomyFare: number;
  athleteInsurance: number;
  supportStaffInsurance: number;
  cellphone: number;
  mealsPerDay: number;
  villageMealVoucher: number;
  knifeAndFork: number;
  accommodation: number;
};

type EstimatedCostsProps = {
  readonly costs: EstimatedCostsData;
  readonly onChange: (
    field: keyof EstimatedCostsData,
    value: number
  ) => void;
};

const COST_FIELDS: Array<{
  field: keyof EstimatedCostsData;
  label: string;
}> = [
  { field: "clothingPackage", label: "Clothing Package" },
  { field: "travelEconomyFare", label: "Travel Economy Fare" },
  { field: "athleteInsurance", label: "Athlete Insurance" },
  { field: "supportStaffInsurance", label: "Support Staff Insurance" },
  { field: "cellphone", label: "Cellphone (local plan)" },
  { field: "mealsPerDay", label: "Meals" },
  { field: "villageMealVoucher", label: "Village Meal Voucher" },
  { field: "knifeAndFork", label: "Knife & Fork for Ap" },
  { field: "accommodation", label: "Accommodation" },
];

export default function EstimatedCosts({
  costs,
  onChange,
}: Readonly<EstimatedCostsProps>) {
  return (
    <Paper className="estimated-costs" variant="outlined">
      <Box className="estimated-costs-heading">
        <Typography>Estimated Costs</Typography>
      </Box>

      <Box className="estimated-costs-grid">
        {COST_FIELDS.map((item) => (
          <Box key={item.field} className="estimated-cost-item">
            <Typography className="estimated-cost-label">
              {item.label}
            </Typography>

            <TextField
              className="estimated-cost-input"
              type="number"
              size="small"
              value={costs[item.field]}
              onChange={(event) =>
                onChange(
                  item.field,
                  Math.max(0, Number(event.target.value) || 0)
                )
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                  "aria-label": item.label,
                },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}