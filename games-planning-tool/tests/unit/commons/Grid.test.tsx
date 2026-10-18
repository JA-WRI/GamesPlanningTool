// AI contribution: 100% AI-generated
'use client';

import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Grid, {
  ColumnDefinition,
} from '../../../../games-planning-tool/src/components/commons/Grid';

interface SampleRow extends Record<string, unknown> {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

describe('Grid Component', () => {
  const columns: ColumnDefinition<SampleRow>[] = [
    { field: 'name', label: 'Name', type: 'text' },
    { field: 'quantity', label: 'Quantity', type: 'number' },
    { field: 'price', label: 'Price', type: 'number' },
    {
      field: 'total',
      label: 'Total',
      type: 'calculated',
      formula: {
        evaluate: (row) => Number(row.quantity) * Number(row.price),
      },
      formatValue: (val) => `$${val.toFixed(2)}`,
    },
  ];

  const rows: SampleRow[] = [
    { id: '1', name: 'Apple', quantity: 2, price: 3.5 },
  ];

  const mockOnRowsChange = vi.fn();
  const mockOnAddRow = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table columns and row data correctly in non-editing mode', () => {
    render(
      <Grid
        columns={columns}
        rows={rows}
        isEditing={false}
        onRowsChange={mockOnRowsChange}
      />,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$7.00')).toBeInTheDocument();
  });

  it('renders inputs when isEditing is true and isPreview is false', () => {
    render(
      <Grid
        columns={columns}
        rows={rows}
        isEditing={true}
        isPreview={false}
        onRowsChange={mockOnRowsChange}
        onAddRow={mockOnAddRow}
      />,
    );

    const input = screen.getByDisplayValue('Apple');
    expect(input).toBeInTheDocument();

    const addButton = screen.getByRole('button', { name: /add row/i });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(mockOnAddRow).toHaveBeenCalledTimes(1);
  });

  it('opens confirmation dialog when delete button is clicked and deletes row upon confirmation', () => {
    render(
      <Grid
        columns={columns}
        rows={rows}
        isEditing={true}
        isPreview={false}
        onRowsChange={mockOnRowsChange}
      />,
    );

    const deleteButton = screen.getByRole('button', { name: /delete row/i });
    fireEvent.click(deleteButton);

    expect(
      screen.getByText(/Are you sure you want to delete this row\?/i),
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmButton);

    expect(mockOnRowsChange).toHaveBeenCalledWith([]);
  });

  it('applies fitWidth style correctly to the table container', () => {
    const { container } = render(
      <Grid
        columns={columns}
        rows={rows}
        isEditing={false}
        fitWidth={true}
        onRowsChange={mockOnRowsChange}
      />,
    );

    const table = container.querySelector('table');
    expect(table).toHaveStyle({ minWidth: '100%' });
  });

  it('applies custom minWidth style correctly to the table container', () => {
    const { container } = render(
      <Grid
        columns={columns}
        rows={rows}
        isEditing={false}
        minWidth={800}
        onRowsChange={mockOnRowsChange}
      />,
    );

    const table = container.querySelector('table');
    expect(table).toHaveStyle({ minWidth: '800px' });
  });

  it('computes and formats calculated column formulas accurately via evaluate', () => {
    const customRows = [{ id: '1', name: 'Apple', quantity: 3, price: 4.0 }];
    render(
      <Grid
        columns={columns}
        rows={customRows}
        isEditing={false}
        onRowsChange={mockOnRowsChange}
      />,
    );

    // 3 * 4.0 = $12.00
    expect(screen.getByText('$12.00')).toBeInTheDocument();
  });
});
