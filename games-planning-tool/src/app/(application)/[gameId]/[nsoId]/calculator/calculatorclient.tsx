// 80% AI generated code:
// The following was AI generated:
// - Original page layout and calculator tab structure
// - Component organization and basic state handling
// - css converted to tailwind
// The code was reviewed and modified to fit the calculator requirements.

'use client';

import { useState } from 'react';
import { Box, Button, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalculatorContent from './calculatorcontent';

type Calculator = { id: number; name: string };

export default function CalculatorClient() {
  const [calculators, setCalculators] = useState<Calculator[]>([
    { id: 1, name: 'Calculator 1' },
  ]);
  const [selectedCalculatorId, setSelectedCalculatorId] = useState(1);

  const createNewCalculator = () => {
    const id =
      Math.max(0, ...calculators.map((calculator) => calculator.id)) + 1;

    setCalculators((previous) => [
      ...previous,
      { id, name: `Calculator ${id}` },
    ]);
    setSelectedCalculatorId(id);
  };

  return (
    <Box
      component="main"
      className="box-border min-h-full bg-white pb-4 max-[1024px]:px-4 max-[1024px]:py-3 max-[768px]:px-3 max-[768px]:py-[10px]"
    >
      <Box className="m-0 box-border min-w-0 max-w-none px-[3px] pt-3 max-[1024px]:max-w-full max-[600px]:px-[10px] max-[600px]:pt-[10px]">
        <Box className="mb-[10px] flex min-h-[60px] items-center gap-2 overflow-x-auto border-t-[3px] border-[#db8667] bg-[#f2f2f2] max-[1024px]:min-h-11 max-[1024px]:gap-[5px] max-[1024px]:px-[6px] max-[768px]:mb-[10px] max-[600px]:px-1">
          <Tabs
            className="min-h-[38px] flex-[0_1_auto] [&_.MuiTabs-indicator]:top-0 [&_.MuiTabs-indicator]:z-0 [&_.MuiTabs-indicator]:h-full [&_.MuiTabs-indicator]:bg-white [&_.MuiTabs-indicator]:transition-transform [&_.MuiTabs-indicator]:duration-[250ms] max-[768px]:min-w-0 max-[768px]:shrink"
            value={selectedCalculatorId}
            onChange={(_, value: number) => setSelectedCalculatorId(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Calculator selection"
          >
            {calculators.map((calculator) => (
              <Tab
                key={calculator.id}
                value={calculator.id}
                label={calculator.name}
                className="relative z-[1] min-h-[60px] min-w-[150px] px-[13px] py-2 text-[16px] normal-case text-[#666] [&.Mui-selected]:bg-transparent [&.Mui-selected]:font-bold [&.Mui-selected]:text-[#cf4e1b] [&.Mui-focusVisible]:outline-2 [&.Mui-focusVisible]:outline-offset-[-2px] [&.Mui-focusVisible]:outline-[#cf4e1b] max-[1024px]:min-h-[42px] max-[1024px]:min-w-[95px] max-[1024px]:px-[10px] max-[1024px]:py-[6px] max-[1024px]:text-[12px] max-[768px]:min-w-[85px] max-[768px]:text-[11px]"
                disableRipple
              />
            ))}
          </Tabs>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={createNewCalculator}
            className="relative min-h-[35px] shrink-0 rounded-[2px] bg-[#461d0e] px-[9px] py-[3px] text-[16px] font-light normal-case shadow-none! before:absolute before:top-1/2 before:-left-[7px] before:h-[42px] before:-translate-y-1/2 before:border-l-2 before:border-[#cecece] before:content-[''] hover:bg-[#6d2207] [&_.MuiButton-startIcon]:mr-[3px] [&_.MuiSvgIcon-root]:text-[13px] max-[1024px]:min-w-max max-[1024px]:px-[9px] max-[1024px]:py-[5px] max-[1024px]:text-[10px] max-[768px]:text-[9px]"
          >
            Add New Calculator
          </Button>
        </Box>

        <CalculatorContent calculatorId={selectedCalculatorId} />

        <Box className="mt-5 flex justify-end">
          {/* save stays disabled til db conn is added */}
          <Button
            variant="contained"
            size="small"
            disabled
            className="min-h-[38px] min-w-[60px] rounded-[4px] bg-[#009b58] px-2 py-1 text-[16px] normal-case text-white shadow-none! hover:bg-[#007c46] [&.Mui-disabled]:bg-[#009b58] [&.Mui-disabled]:text-white [&.Mui-disabled]:opacity-50 max-[768px]:min-h-[34px] max-[768px]:px-[14px] max-[768px]:py-[5px]"
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
