// 80% AI generated code:
// The following was AI generated:
// - Original estimated cost component structure and MUI inputs
// - css converted to tailwind
// The layout, cost categories, values, and styling were modified
// to match the wanted calculator design.

'use client';

import {
  Box,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

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
  readonly onChange: (field: keyof EstimatedCostsData, value: number) => void;
};

const COST_FIELDS: Array<{
  field: keyof EstimatedCostsData;
  label: string;
}> = [
  { field: 'clothingPackage', label: 'Clothing Package' },
  { field: 'travelEconomyFare', label: 'Travel Economy Fare' },
  { field: 'athleteInsurance', label: 'Athlete Insurance' },
  { field: 'supportStaffInsurance', label: 'Support Staff Insurance' },
  { field: 'cellphone', label: 'Cellphone (local plan)' },
  { field: 'mealsPerDay', label: 'Meals' },
  { field: 'villageMealVoucher', label: 'Village Meal Voucher' },
  { field: 'knifeAndFork', label: 'Knife & Fork for Ap' },
  { field: 'accommodation', label: 'Accommodation' },
];

export default function EstimatedCosts({
  costs,
  onChange,
}: Readonly<EstimatedCostsProps>) {
  return (
    <Paper
      className="mt-10 overflow-hidden rounded-[4px] border-2 border-[#ab4c27b4] bg-white shadow-none!"
      variant="outlined"
    >
      <Box className="border-b-2 border-[#ab4c277a] bg-[#fff8f6] px-4 py-[14px] [&_.MuiTypography-root]:text-[18px] [&_.MuiTypography-root]:leading-[1.35] [&_.MuiTypography-root]:font-bold [&_.MuiTypography-root]:text-[#220c00]">
        <Typography>Estimated Costs</Typography>
      </Box>

      <Box className="grid grid-cols-2 gap-x-10 px-[18px] pb-3 max-[1024px]:gap-x-5 max-[1024px]:px-3 max-[768px]:grid-cols-1">
        {COST_FIELDS.map((item) => (
          <Box
            key={item.field}
            className="flex min-h-[62px] items-center justify-between gap-5 border-b border-[#e2c1b3] px-[2px] py-2 max-[600px]:gap-3"
          >
            <Typography className="text-[16px] leading-[1.4] font-normal text-[#222]">
              {item.label}
            </Typography>

            <TextField
              className="w-[150px] shrink-0 max-[1024px]:w-[140px] max-[768px]:w-[150px] max-[600px]:w-[130px] [&_.MuiInputBase-root]:min-h-[38px] [&_.MuiInputBase-root]:rounded-none [&_.MuiInputBase-root]:bg-white [&_.MuiInputBase-root]:text-[16px] [&_.MuiInputBase-input]:py-2 [&_.MuiInputBase-input]:pr-2 [&_.MuiInputBase-input]:pl-0 [&_.MuiInputBase-input]:text-right [&_.MuiInputBase-input]:text-[16px] [&_.MuiInputBase-input]:text-[#222] [&_.MuiInputAdornment-root]:mr-1 [&_.MuiInputAdornment-root_.MuiTypography-root]:text-[16px] [&_.MuiInputAdornment-root_.MuiTypography-root]:text-[#444] [&_.MuiOutlinedInput-notchedOutline]:rounded-none [&_.MuiOutlinedInput-notchedOutline]:border-0 [&_.MuiOutlinedInput-notchedOutline]:border-b [&_.MuiOutlinedInput-notchedOutline]:border-[#ab4c277a] [&_.MuiInputBase-root:hover_.MuiOutlinedInput-notchedOutline]:border-[#ffb663] [&_.MuiInputBase-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-b-2 [&_.MuiInputBase-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-[#ffb663] [&_input[type=number]]:[appearance:textfield] [&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none"
              type="number"
              size="small"
              value={costs[item.field]}
              onChange={(event) =>
                onChange(
                  item.field,
                  Math.max(0, Number(event.target.value) || 0),
                )
              }
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                  'aria-label': item.label,
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
