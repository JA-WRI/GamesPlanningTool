// AI contribution: 100% AI-generated
'use client';

import { ColumnDefinition } from '../../../../games-planning-tool/src/components/commons/Grid';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
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

  it('calls custom onSave callback with saved rows when provided', () => {
    const handleSaveMock = vi.fn();
    render(
      <BaseGridPage
        title="Inventory"
        initialData={initialData}
        columns={columns}
        createEmptyRow={createEmptyRow}
        onSave={handleSaveMock}
      />,
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(handleSaveMock).toHaveBeenCalledTimes(1);
    expect(handleSaveMock).toHaveBeenCalledWith(initialData);
  });

  it('blocks saving and shows alert when custom isValid rule returns false', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const handleSaveMock = vi.fn();

    render(
      <BaseGridPage
        title="Inventory"
        initialData={initialData}
        columns={columns}
        createEmptyRow={createEmptyRow}
        onSave={handleSaveMock}
        isValid={() => false}
      />,
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(alertSpy).toHaveBeenCalled();
    expect(handleSaveMock).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('uses default "Add Row" label when addButtonLabel is omitted', () => {
    render(
      <BaseGridPage
        title="Inventory"
        initialData={initialData}
        columns={columns}
        createEmptyRow={createEmptyRow}
      />,
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const addButton = screen.getByRole('button', { name: /add row/i });
    expect(addButton).toBeInTheDocument();
  });
});
