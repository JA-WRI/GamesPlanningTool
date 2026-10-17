// 60% AI generated code:
// The following was AI generated:
// - Original estimated cost component structure and MUI inputs
// - css converted to tailwind
// The layout, cost categories, values, and styling were modified to match the wanted calculator design.
// The reusable grid component was impleted manually

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
  readonly isEditing?: boolean;
  readonly isPreview?: boolean;
};

const COST_FIELDS: Array<{
  field: keyof EstimatedCostsData;
  label: string;
}> = [
  { field: 'travelEconomyFare', label: 'Travel Economy Fare' },
  { field: 'athleteInsurance', label: 'Athlete Insurance' },
  { field: 'supportStaffInsurance', label: 'Support Staff Insurance' },
  { field: 'cellphone', label: 'Cellphone (local plan)' },
  { field: 'mealsPerDay', label: 'Meals' },
  { field: 'villageMealVoucher', label: 'Village Meal Voucher' },
  { field: 'knifeAndFork', label: 'Knife & Fork for Ap' },
  { field: 'clothingPackage', label: 'Clothing Package' },
];

export default function EstimatedCosts({
  costs,
  onChange,
  isEditing = false,
  isPreview = false,
}: Readonly<EstimatedCostsProps>) {
  const showInputs = isEditing && !isPreview;
  return (
    <Paper
      className="mt-10 overflow-hidden rounded-[4px] shadow-none!"
      variant="outlined"
    >
      <Box className="px-4 py-[14px]">
        <Typography>ESTIMATED COSTS</Typography>
      </Box>

      <Box className="grid grid-cols-4 gap-x-4 gap-y-5 p-4 max-[1024px]:grid-cols-2 max-[600px]:grid-cols-1">
        {COST_FIELDS.map((item) => (
          <Box key={item.field} className="min-w-0">
            <Typography className="mb-1 text-[11px]! font-semibold!  tracking-wide text-[#625e5c]!">
              {item.label}
            </Typography>

            {showInputs ? (
              <TextField
              className="[&_.MuiOutlinedInput-root]:h-[38px] [&_.MuiOutlinedInput-root]:rounded-[4px] "
                type="number"
                size="small"
                fullWidth
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
                      <InputAdornment position="start">
                        $
                      </InputAdornment>
                    ),
                  },
                }}
              
            />
            ) : (
              <Box className="flex h-[38px] items-center rounded-[4px] border border-[#b6b7b8]  px-3 text-[14px] text-[#222]">
                ${costs[item.field]}
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Box className="border-t px-4 py-3">
        <Typography className="text-[11px]! text-[#777]!">
          CONVERSIONS
        </Typography>
      </Box>
    </Paper>
  );
}
