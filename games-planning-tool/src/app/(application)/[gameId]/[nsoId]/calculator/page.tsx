// 90% AI generated code for original layout of the calculator page
"use client";

import { useEffect, useState } from "react";
import { Box, Button, Tab, Tabs, Snackbar, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import "./globalcalculator.css";
import CalculatorContent, {
  Traveler,
  createTraveler,
} from "./calculatorcontent";

type Calculator = {
  id: number;
  name: string;
  travelers: Traveler[];
};

// DELETE THIS LATER
const STORAGE_KEY = "games-planning-calculators"; // temp storage key 

const initialCalculators: Calculator[] = [
  {
    id: 1,
    name: "Calculator 1",
    travelers: [createTraveler(1)],
  },
];

export default function CalculatorPage() {
  const [calculators, setCalculators] =
    useState<Calculator[]>(initialCalculators);

  const [selectedCalculatorId, setSelectedCalculatorId] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);

  // Restore previously saved calculator data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as Calculator[];

        if (Array.isArray(parsed) && parsed.length > 0) {
          setCalculators(parsed);
          setSelectedCalculatorId(parsed[0].id);
        }
      }
    } catch (error) {
      console.error("Could not load saved calculators:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  const createNewCalculator = () => {
    const newId =
      Math.max(0, ...calculators.map((calculator) => calculator.id)) + 1;

    const newCalculator: Calculator = {
      id: newId,
      name: `Calculator ${newId}`,
      travelers: [createTraveler(1)],
    };

    setCalculators((previous) => [...previous, newCalculator]);
    setSelectedCalculatorId(newId);
  };

  const updateTravelers = (travelers: Traveler[]) => {
    setCalculators((previous) =>
      previous.map((calculator) =>
        calculator.id === selectedCalculatorId
          ? { ...calculator, travelers }
          : calculator
      )
    );
  };

  const saveCalculators = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(calculators));
      setSaveMessage(true);
    } catch (error) {
      console.error("Could not save calculators:", error);
      alert("Unable to save your calculator. Please try again.");
    }
  };

  const selectedCalculator = calculators.find(
    (calculator) => calculator.id === selectedCalculatorId
  );

  if (!loaded) return null;

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        px: { xs: 2, md: 3 },
        py: 2,
      }}
    >
      <Box sx={{ maxWidth: 1500, mx: "auto" }}>
        {/* Calculator navigation */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#f2f2f2",
            borderTop: "1px solid #aaa",
            minHeight: 48,
            mb: 1.5,
            px: 1,
            gap: 1,
            overflowX: "auto",
          }}
        >
          <Tabs
            value={selectedCalculatorId}
            onChange={(_, value: number) =>
              setSelectedCalculatorId(value)
            }
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 44,
              "& .MuiTabs-indicator": {
                display: "none",
              },
              "& .MuiTab-root": {
                minHeight: 44,
                minWidth: 110,
                textTransform: "none",
                fontSize: 13,
                color: "#666",
              },
              "& .Mui-selected": {
                bgcolor: "#fff",
                color: "#8b0000 !important",
                fontWeight: 700,
              },
            }}
          >
            {calculators.map((calculator) => (
              <Tab
                key={calculator.id}
                value={calculator.id}
                label={calculator.name}
              />
            ))}
          </Tabs>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={createNewCalculator}
            sx={{
              flexShrink: 0,
              bgcolor: "#424242",
              textTransform: "none",
              fontSize: 11,
              borderRadius: "2px",
              "&:hover": { bgcolor: "#222" },
            }}
          >
            Add New Calculator
          </Button>
        </Box>

        {/* Selected calculator */}
        {selectedCalculator && (
          <CalculatorContent
            calculatorId={selectedCalculator.id}
            travelers={selectedCalculator.travelers}
            onTravelersChange={updateTravelers}
          />
        )}

        {/* Save button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={saveCalculators}
            sx={{
              textTransform: "none",
              bgcolor: "#009b58",
              borderRadius: 1,
              fontSize: 12,
              "&:hover": { bgcolor: "#007c46" },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={saveMessage}
        autoHideDuration={3000}
        onClose={() => setSaveMessage(false)}
      >
        <Alert
          severity="success"
          onClose={() => setSaveMessage(false)}
        >
          Calculator saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
