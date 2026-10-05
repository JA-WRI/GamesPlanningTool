// 80% AI generated code:
// The following was AI generated:
// - Estimated cost component structure and MUI inputs
// The cost categories and values were reviewed and modified to match the calculator spreadsheet.

"use client";

import { Box, Paper, Typography } from "@mui/material";
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
};

const COST_FIELDS: Array<{
  field: keyof EstimatedCostsData;
  label: string;
  note?: string;
}> = [
  { field: "clothingPackage", label: "Clothing Package" },
  { field: "travelEconomyFare", label: "Travel Economy Fare" },
  { field: "athleteInsurance", label: "Athlete Insurance" },
  { field: "supportStaffInsurance", label: "Support Staff Insurance" },
  { field: "cellphone", label: "Cellphone (local plan)" },
  { field: "mealsPerDay", label: "Meals", note: "/ day" },
  { field: "villageMealVoucher", label: "Village Meal Voucher"},
  { field: "knifeAndFork", label: "Knife & Fork for Ap"},
  { field: "accommodation", label: "Accommodation" },
];

const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export default function EstimatedCosts({ costs }: Readonly<EstimatedCostsProps>) {
  return (
    <Paper className="calculator-content-panel calculator-estimated-costs" variant="outlined">
      <Box className="calculator-content-section-heading">
        <Typography>Estimated Costs</Typography>
      </Box>

      <Box className="calculator-estimated-costs-grid">
        {COST_FIELDS.map((item) => (
          <Box key={item.field} className="calculator-estimated-cost-item">
            <Box className="calculator-estimated-cost-text">
              <Typography>{item.label}</Typography>
              {item.note && <Typography className="calculator-estimated-cost-note">{item.note}</Typography>}
            </Box>

            <Typography
              className="calculator-estimated-cost-value calculator-content-readonly-value"
              aria-label={`${item.label}: ${currencyFormatter.format(costs[item.field])}`}
            >
              {currencyFormatter.format(costs[item.field])}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
