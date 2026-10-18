// AI contribution: 100% AI-generated
'use client';

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
  tax?: number;
}

describe('Grid Component', () => {
  const columns: ColumnDefinition<SampleRow>[] = [
    { field: 'name', label: 'Name', type: 'text' },
    { field: 'quantity', label: 'Quantity', type: 'number' },
    { field: 'price', label: 'Price', type: 'number', readOnly: true }, // Tested: readOnly option
    {
      field: 'total',
      label: 'Total',
      type: 'calculated',
      formula: {
        // testing multi-parameter and custom calculation operations with evaluate
        evaluate: (row) =>
          Number(row.quantity) * Number(row.price) + (Number(row.tax) || 0),
      },
      formatValue: (val) => `$${val.toFixed(2)}`,
    },
  ];

  const rows: SampleRow[] = [
    { id: '1', name: 'Apple', quantity: 2, price: 3.5, tax: 1.0 },
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
    expect(screen.getByText('$8.00')).toBeInTheDocument(); // (2 * 3.5) + 1.0 = 8.00
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

  it('applies fitWidth style correctly to the table container and input cells', () => {
    const { container } = render(
      <Grid
        columns={columns}
        rows={rows}
        isEditing={true}
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

  it('computes and formats calculated column formulas accurately via evaluate with multi-parameters', () => {
    const customRows = [
      { id: '1', name: 'Apple', quantity: 3, price: 4.0, tax: 2.0 },
    ];
    render(
      <Grid
        columns={columns}
        rows={customRows}
        isEditing={false}
        onRowsChange={mockOnRowsChange}
      />,
    );

    // (3 * 4.0) + 2.0 = $14.00
    expect(screen.getByText('$14.00')).toBeInTheDocument();
  });

  it('respects the readOnly column option by rendering it as static text instead of an editable input in edit mode', () => {
    render(
      <Grid
        columns={columns}
        rows={rows}
        isEditing={true}
        isPreview={false}
        onRowsChange={mockOnRowsChange}
      />,
    );

    // readOnly column 'price' should render as text.
    const priceDisplay = screen.getByText('3.5');
    expect(priceDisplay).toBeInTheDocument();
    expect(priceDisplay.tagName).toBe('SPAN');
  });

  it('hides the add row button when allowAddRow is false', () => {
    render(
      <Grid
        columns={columns}
        rows={rows}
        isEditing={true}
        isPreview={false}
        allowAddRow={false}
        onRowsChange={mockOnRowsChange}
        onAddRow={mockOnAddRow}
      />,
    );

    const addButton = screen.queryByRole('button', { name: /add row/i });
    expect(addButton).not.toBeInTheDocument();
  });

  it('supports strict column formula structures (operator vs evaluate union check)', () => {
    const operatorColumns: ColumnDefinition<SampleRow>[] = [
      { field: 'quantity', label: 'Quantity', type: 'number' },
      { field: 'price', label: 'Price', type: 'number' },
      {
        field: 'total',
        label: 'Total',
        type: 'calculated',
        formula: {
          operator: '*',
          fieldA: 'quantity',
          fieldB: 'price',
        },
      },
    ];

    const testRows = [{ id: '1', name: 'Test', quantity: 4, price: 5 }];
    render(
      <Grid
        columns={operatorColumns}
        rows={testRows}
        isEditing={false}
        onRowsChange={mockOnRowsChange}
      />,
    );

    // 4 * 5 = 20
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
