// AI contribution: 100% Ai Generated
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGrid } from '../../../../games-planning-tool/src/hooks/useGrid';

interface TestRow extends Record<string, unknown> {
  id: string;
  name: string;
}

describe('useGrid Hook', () => {
  const initialRows: TestRow[] = [{ id: '1', name: 'Item 1' }];
  const createEmptyRow = (): TestRow => ({ id: '2', name: 'New Item' });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useGrid(initialRows, createEmptyRow));

    expect(result.current.rows).toEqual(initialRows);
    expect(result.current.isEditing).toBe(false);
  });

  it('toggles editing state and handles row additions', () => {
    const { result } = renderHook(() => useGrid(initialRows, createEmptyRow));

    act(() => {
      result.current.setIsEditing(true);
    });
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.handleAddRow();
    });
    expect(result.current.rows).toHaveLength(2);
    expect(result.current.rows[1].name).toBe('New Item');
  });

  it('saves rows and triggers callback correctly', () => {
    const onSaveCallback = vi.fn();
    const { result } = renderHook(() =>
      useGrid(initialRows, createEmptyRow, onSaveCallback),
    );

    act(() => {
      result.current.setIsEditing(true);
      result.current.setRows([{ id: '1', name: 'Updated Item' }]);
    });

    act(() => {
      result.current.handleSave();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.rows[0].name).toBe('Updated Item');
    expect(onSaveCallback).toHaveBeenCalledWith([
      { id: '1', name: 'Updated Item' },
    ]);
  });

  it('cancels edits and reverts back to saved rows', () => {
    const { result } = renderHook(() => useGrid(initialRows, createEmptyRow));

    act(() => {
      result.current.setIsEditing(true);
      result.current.setRows([{ id: '1', name: 'Changed Item' }]);
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.rows[0].name).toBe('Item 1');
  });
});
