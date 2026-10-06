'use client';

import { Box, Divider, Paper, Typography } from '@mui/material';
import './costsummary.css';

export type CostSummaryItem = {
  label: string;
  value: number;
};

type CostSummaryProps = {
  readonly summary: CostSummaryItem[];
  readonly estimatedTotal: number;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

export default function CostSummary({
  summary,
  estimatedTotal,
}: Readonly<CostSummaryProps>) {
  return (
    <Paper className="cost-summary" variant="outlined">
      <Box className="cost-summary-heading">
        <Typography>Cost Summary</Typography>
      </Box>

      <Box className="cost-summary-content">
        {summary.map((item) => (
          <Box key={item.label} className="cost-summary-row">
            <Typography>{item.label}</Typography>
            <Typography>{formatCurrency(item.value)}</Typography>
          </Box>
        ))}
      </Box>

      <Divider />

      <Box className="cost-summary-total">
        <Box>
          <Typography className="cost-summary-label">
            Estimated Total:
          </Typography>

          <Typography className="cost-summary-note">
            Excludes clothing packages (individual need)
          </Typography>
        </Box>

        <Typography className="cost-summary-amount">
          {formatCurrency(estimatedTotal)}
        </Typography>
      </Box>
    </Paper>
  );
}
