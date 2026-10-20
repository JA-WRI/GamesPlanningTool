// AI contribution: 100% AI-generated
'use client';

import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GridTextBox from '../../../../games-planning-tool/src/components/commons/GridTextBox';

describe('GridTextBox', () => {
  it('renders with default small size and full width', () => {
    render(<GridTextBox placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('handles value changes correctly', () => {
    const handleChange = vi.fn();
    render(<GridTextBox placeholder="Type here" onChange={handleChange} />);

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'New Value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('accepts custom inputProps and type', () => {
    render(
      <GridTextBox
        type="number"
        inputProps={{ min: 0, max: 10 }}
        placeholder="Number input"
      />,
    );

    const input = screen.getByPlaceholderText('Number input');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '10');
  });
});
