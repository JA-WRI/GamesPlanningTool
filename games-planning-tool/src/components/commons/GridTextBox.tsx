// Ai contribution: 50% or more AI-generated
// AI use to help extract the TextField from the Grid Component
'use client';

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type GridTextBoxProps = Omit<TextFieldProps, 'variant'> & {};

export default function GridTextBox({
  size = 'small',
  fullWidth = true,
  sx,
  inputProps,
  ...props
}: GridTextBoxProps & { inputProps?: React.ComponentProps<'input'> }) {
  return (
    <TextField
      variant="outlined"
      size={size}
      fullWidth={fullWidth}
      slotProps={{
        htmlInput: inputProps,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#FFFFFF',
          borderRadius: '6px',
          fontSize: '0.875rem',
          '&.Mui-focused fieldset': {
            borderColor: 'var(--color-burgundy, #8a181a)',
          },
        },
        ...sx,
      }}
      {...props}
    />
  );
}
