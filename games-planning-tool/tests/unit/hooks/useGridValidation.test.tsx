// AI contribution: 100% Ai Generated
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useGridValidation } from '@/hooks/useGridValidation';
import { ColumnDefinition } from '@/components/commons/Grid';

describe('useGridValidation Hook', () => {
  const mockColumns: ColumnDefinition<Record<string, unknown>>[] = [
    {
      field: 'score',
      label: 'Score',
      type: 'number',
      min: 1,
      max: 10,
      allowedTextValues: ['COC', 'NSO'],
    },
  ];

  it('should return no errors for valid numbers within min and max', () => {
    const rows = [{ score: 5 }];
    const { result } = renderHook(() => useGridValidation(rows, mockColumns));

    expect(result.current.hasErrors).toBe(false);
    expect(result.current.getCellError(mockColumns[0], 5)).toBeNull();
  });

  it('should return an error if a number is below the min boundary', () => {
    const rows = [{ score: 0 }];
    const { result } = renderHook(() => useGridValidation(rows, mockColumns));

    expect(result.current.hasErrors).toBe(true);
    expect(result.current.getCellError(mockColumns[0], 0)).toBe(
      'Must be at least 1',
    );
  });

  it('should return an error if a number is above the max boundary', () => {
    const rows = [{ score: 15 }];
    const { result } = renderHook(() => useGridValidation(rows, mockColumns));

    expect(result.current.hasErrors).toBe(true);
    expect(result.current.getCellError(mockColumns[0], 15)).toBe(
      'Must be at most 10',
    );
  });

  it('should allow text values specified in allowedTextValues case-insensitively', () => {
    const rowsCoc = [{ score: 'coc' }];
    const rowsNso = [{ score: 'NSO' }];

    const { result: resultCoc } = renderHook(() =>
      useGridValidation(rowsCoc, mockColumns),
    );
    expect(resultCoc.current.hasErrors).toBe(false);
    expect(resultCoc.current.getCellError(mockColumns[0], 'coc')).toBeNull();

    const { result: resultNso } = renderHook(() =>
      useGridValidation(rowsNso, mockColumns),
    );
    expect(resultNso.current.hasErrors).toBe(false);
    expect(resultNso.current.getCellError(mockColumns[0], 'NSO')).toBeNull();
  });

  it('should return an error for invalid text that is not in allowedTextValues', () => {
    const rows = [{ score: 'INVALID' }];
    const { result } = renderHook(() => useGridValidation(rows, mockColumns));

    expect(result.current.hasErrors).toBe(true);
    expect(result.current.getCellError(mockColumns[0], 'INVALID')).toBe(
      'Must be a number or COC, NSO',
    );
  });

  it('should call onValidationChange callback when error status changes', () => {
    const mockOnValidationChange = vi.fn();

    const { rerender } = renderHook(
      ({ rows }) =>
        useGridValidation(rows, mockColumns, mockOnValidationChange),
      { initialProps: { rows: [{ score: 5 }] } },
    );

    expect(mockOnValidationChange).toHaveBeenCalledWith(false);

    // Rerender with invalid row
    rerender({ rows: [{ score: 99 }] });
    expect(mockOnValidationChange).toHaveBeenCalledWith(true);
  });
});
