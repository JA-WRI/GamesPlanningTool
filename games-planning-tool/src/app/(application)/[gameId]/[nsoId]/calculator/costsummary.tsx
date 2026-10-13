// 10% of the code was AI generated:
// - css converted to tailwind

'use client';

import { Box, Divider, Paper, Typography } from '@mui/material';

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
    <Paper
      className="mt-10 overflow-hidden rounded-[4px] border-2 border-[#ab4c277a] bg-white shadow-none! [&_.MuiDivider-root]:border-t [&_.MuiDivider-root]:border-[#ab4c277a]"
      variant="outlined"
    >
      <Box className="border-b-2 border-[#ab4c277a] px-4 py-[14px] [&_.MuiTypography-root]:text-[18px] [&_.MuiTypography-root]:leading-[1.35] [&_.MuiTypography-root]:font-bold [&_.MuiTypography-root]:text-[#111]">
        <Typography>Cost Summary</Typography>
      </Box>

      <Box className="px-4 max-[768px]:px-3">
        {summary.map((item) => (
          <Box
            key={item.label}
            className="flex min-h-[62px] items-center justify-between border-b border-[#ab4c277a] px-[2px] py-2 last:border-b-0 [&_.MuiTypography-root]:text-[16px] [&_.MuiTypography-root]:leading-[1.4] [&_.MuiTypography-root]:text-[#222]"
          >
            <Typography>{item.label}</Typography>
            <Typography>{formatCurrency(item.value)}</Typography>
          </Box>
        ))}
      </Box>

      <Divider />

      <Box className="flex items-center justify-between gap-5 p-4 max-[600px]:gap-3">
        <Box>
          <Typography className="text-[18px] leading-[1.35] font-semibold text-[#111]">
            Estimated Total:
          </Typography>

          <Typography className="mt-[3px] text-[10px] text-[#666]">
            Excludes clothing packages (individual need)
          </Typography>
        </Box>

        <Typography className="text-[18px] leading-[1.35] font-semibold text-[#111]">
          {formatCurrency(estimatedTotal)}
        </Typography>
      </Box>
    </Paper>
  );
}
