// AI use to help extract the TextField from the Grid Component
'use client';

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type TextBoxProps = Omit<TextFieldProps, 'variant'> & {};

export default function TextBox({
  size = 'small',
  fullWidth = true,
  sx,
  ...props
}: TextBoxProps) {
  return (
    <TextField
      variant="outlined"
      size={size}
      fullWidth={fullWidth}
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
