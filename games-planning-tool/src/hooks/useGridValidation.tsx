// AI Contribution: Below 50% AI-Generated
'use client';

import { useEffect } from 'react';
import { ColumnDefinition } from '@/components/commons/Grid';

export function useGridValidation<T extends Record<string, unknown>>(
  rows: T[],
  columns: ColumnDefinition<T>[],
  onValidationChange?: (hasError: boolean) => void,
) {
  const getCellError = (
    col: ColumnDefinition<T>,
    val: unknown,
  ): string | null => {
    if (val === '' || val === null || val === undefined) return null;

    const stringVal = String(val).trim();

    if (
      col.allowedTextValues &&
      col.allowedTextValues.some(
        (allowed) => allowed.toUpperCase() === stringVal.toUpperCase(),
      )
    ) {
      return null;
    }

    if (col.type === 'number') {
      const num = Number(stringVal);
      if (Number.isNaN(num)) {
        const allowedStr = col.allowedTextValues
          ? ` or ${col.allowedTextValues.join(', ')}`
          : '';
        return `Must be a number${allowedStr}`;
      }
      if (col.min !== undefined && num < col.min) {
        return `Must be at least ${col.min}`;
      }
      if (col.max !== undefined && num > col.max) {
        return `Must be at most ${col.max}`;
      }
    }

    return null;
  };

  const hasErrors = rows.some((row) =>
    columns.some((col) => getCellError(col, row[col.field]) !== null),
  );

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(hasErrors);
    }
  }, [hasErrors, onValidationChange]);

  return {
    getCellError,
    hasErrors,
  };
}
