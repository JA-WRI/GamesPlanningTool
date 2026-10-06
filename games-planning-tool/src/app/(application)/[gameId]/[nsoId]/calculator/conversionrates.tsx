// 80% AI generated code:
// The following was AI generated:
// - Currency selector component structure
// The options and layout were reviewed and modified to match the calculator requirements.

"use client";

import { useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, Menu, MenuItem } from "@mui/material";
import "./conversionrates.css";

const CURRENCIES = ["EUR", "USD", "CAD"] as const;

export default function ConversionRates() {
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("CAD");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(menuAnchor);

  return (
    <div className="calculator-currency-selector">
      <Button
        className="calculator-currency-button"
        disableRipple
        disableElevation
        endIcon={<ArrowDropDownIcon />}
        aria-label={`Selected currency: ${currency}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={(event) => setMenuAnchor(event.currentTarget)}
      >
        {currency}
      </Button>
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
      >
        {CURRENCIES.filter((option) => option !== currency).map((option) => (
          <MenuItem
            key={option}
            onClick={() => {
              setCurrency(option);
              setMenuAnchor(null);
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}