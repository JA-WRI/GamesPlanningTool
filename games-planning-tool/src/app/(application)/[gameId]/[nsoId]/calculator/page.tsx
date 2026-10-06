// 80% AI generated code:
// The following was AI generated:
// - Original page layout and calculator tab structure
// - Component organization and basic state handling
// The code was reviewed and modified to fit the calculator requirements.

'use client';

import { useState } from 'react';
import { Box, Button, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import './globalpage.css';
import CalculatorContent from './calculatorcontent';

type Calculator = { id: number; name: string };

export default function CalculatorPage() {
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
    <Box component="main" className="calculator-page">
      <Box className="calculator-page-content">
        <Box className="calculator-page-navigation">
          <Tabs
            className="calculator-page-tabs"
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
                className="calculator-page-tab"
                disableRipple
              />
            ))}
          </Tabs>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={createNewCalculator}
            className="calculator-page-add-button"
          >
            Add New Calculator
          </Button>
        </Box>

        <CalculatorContent calculatorId={selectedCalculatorId} />

        <Box className="calculator-page-save-row">
          {/* save stays disabled til db conn is added */}
          <Button
            variant="contained"
            size="small"
            disabled
            className="calculator-page-save-button"
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
