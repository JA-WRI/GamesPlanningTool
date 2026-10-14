// AI contribution: 100% AI-generated
'use client';

import { ColumnDefinition } from '../../../../games-planning-tool/src/components/commons/Grid';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseGridPage from '../../../../games-planning-tool/src/components/commons/BaseGridPage';

interface ItemRow extends Record<string, unknown> {
  id: string;
  item: string;
  category: string;
}

describe('BaseGridPage', () => {
  const columns: ColumnDefinition<ItemRow>[] = [
    { field: 'item', label: 'Item Name', type: 'text' },
    { field: 'category', label: 'Category', type: 'text' },
  ];

  const initialData: ItemRow[] = [
    { id: '1', item: 'Laptop', category: 'Electronics' },
    { id: '2', item: 'Desk', category: 'Furniture' },
  ];

  const createEmptyRow = (): ItemRow => ({
    id: String(Date.now()),
    item: '',
    category: '',
  });

  it('renders title, search bar, and initial row data', () => {
    render(
      <BaseGridPage
        title="Inventory"
        description="Manage your inventory items"
        initialData={initialData}
        columns={columns}
        createEmptyRow={createEmptyRow}
        addButtonLabel="Add Item"
      />,
    );

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Manage your inventory items')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search records...'),
    ).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.getByText('Furniture')).toBeInTheDocument();
  });

  it('filters rows correctly based on search query input', () => {
    render(
      <BaseGridPage
        title="Inventory"
        initialData={initialData}
        columns={columns}
        createEmptyRow={createEmptyRow}
        addButtonLabel="Add Item"
      />,
    );

    const searchInput = screen.getByPlaceholderText('Search records...');

    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    expect(screen.getByText('Laptop')).toBeInTheDocument();
    expect(screen.queryByText('Desk')).not.toBeInTheDocument();
  });

  it('preserves all rows when searching, editing a filtered row, saving, and clearing search', () => {
    render(
      <BaseGridPage
        title="Inventory"
        initialData={initialData}
        columns={columns}
        createEmptyRow={createEmptyRow}
        addButtonLabel="Add Item"
      />,
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const searchInput = screen.getByPlaceholderText('Search records...');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    expect(screen.getByDisplayValue('Laptop')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Desk')).not.toBeInTheDocument();

    const laptopInput = screen.getByDisplayValue('Laptop');
    fireEvent.change(laptopInput, { target: { value: 'Gaming Laptop' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByText('Gaming Laptop')).toBeInTheDocument();
    expect(screen.getByText('Desk')).toBeInTheDocument();
  });
});
