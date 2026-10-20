// AI contribution: Above 50% Al-generated
// This file contains AI generated code used to define the table body of the grid template from MUI Library, and to support column types, formulas, header, subtexts, and a delete confirmation popup
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlusIcon from '@mui/icons-material/Add';
import GridTextBox from '@/components/commons/GridTextBox';
import { useGridValidation } from '@/hooks/useGridValidation';

export type ColumnType = 'text' | 'email' | 'tel' | 'number' | 'select';
export type CalculationOperator = '+' | '-' | '*';

export interface SelectOption {
  label: string;
  value: string | number;
}

// discrimination union so empty formulas are not allowed.
export type ColumnFormula<T> =
  | {
      operator: CalculationOperator;
      fieldA: keyof T;
      fieldB: keyof T;
      evaluate?: never;
    }
  | {
      // added for multi-parameter/multi-operation calculations
      evaluate: (row: T) => number;
      operator?: never;
      fieldA?: never;
      fieldB?: never;
    };

export interface ColumnDefinition<T> {
  field: keyof T;
  label: string;
  subtitle?: string;
  type?: ColumnType | 'calculated';
  placeholder?: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  formula?: ColumnFormula<T>;
  formatValue?: (val: number) => string;
  allowedTextValues?: string[];
  readOnly?: boolean;
}

interface GridProps<T extends Record<string, unknown>> {
  columns: ColumnDefinition<T>[];
  rows: T[];
  isEditing: boolean;
  isPreview?: boolean;
  onRowsChange: (newRows: T[]) => void;
  onAddRow?: () => void;
  addButtonLabel?: string;
  onValidationChange?: (hasError: boolean) => void;
  allowDelete?: boolean;
  allowAddRow?: boolean;
  minWidth?: number | string; // customizavle minWidth
  fitWidth?: boolean; // option to fit table width
}

export default function Grid<T extends Record<string, unknown>>({
  columns,
  rows,
  isEditing,
  isPreview = false,
  onRowsChange,
  onAddRow,
  addButtonLabel = 'Add Row',
  onValidationChange,
  allowDelete = true,
  allowAddRow = true,
  minWidth = 1000,
  fitWidth = false,
}: GridProps<T>) {
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(
    null,
  );
  const { getCellError } = useGridValidation(rows, columns, onValidationChange);

  const handleCellChange = (
    rowIndex: number,
    field: keyof T,
    value: unknown,
  ) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: value,
    };
    onRowsChange(updatedRows);
  };

  const confirmDeleteRow = () => {
    if (deleteTargetIndex !== null) {
      const updatedRows = rows.filter((_, idx) => idx !== deleteTargetIndex);
      onRowsChange(updatedRows);
      setDeleteTargetIndex(null);
    }
  };

  const calculateValue = (row: T, formula?: ColumnFormula<T>): number => {
    if (!formula) return 0;
    if (formula.evaluate) {
      return formula.evaluate(row);
    }

    // because optional, need safety check
    const valA =
      formula.fieldA !== undefined ? Number(row[formula.fieldA]) || 0 : 0;
    const valB =
      formula.fieldB !== undefined ? Number(row[formula.fieldB]) || 0 : 0;

    switch (formula.operator) {
      case '+':
        return valA + valB;
      case '-':
        return valA - valB;
      case '*':
        return valA * valB;
      default:
        return 0;
    }
  };

  // editing vs preview
  const showInputs = isEditing && !isPreview;

  return (
    <div className="w-full space-y-4">
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          overflowX: 'auto', // horizontal scroll
          backgroundColor: 'var(--color-surface, #ffffff)',
        }}
      >
        <Table
          sx={{ minWidth: fitWidth ? '100%' : minWidth }}
          aria-label="editable grid table"
        >
          <TableHead
            sx={{ backgroundColor: 'var(--color-background, #f8f5f0)' }}
          >
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.field)}
                  align={col.align || 'left'}
                  style={{ width: col.width }}
                  sx={{
                    borderBottom: '1px solid #E5E7EB',
                    py: 1.5,
                    verticalAlign: 'top',
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-gray-900 text-xs tracking-wide">
                      {col.label}
                    </span>
                    {col.subtitle && (
                      <span className="text-[11px] font-normal text-gray-500 normal-case">
                        {col.subtitle}
                      </span>
                    )}
                  </div>
                </TableCell>
              ))}
              {showInputs && allowDelete && (
                <TableCell
                  align="center"
                  sx={{
                    width: 70,
                    borderBottom: '1px solid #E5E7EB',
                    py: 1.5,
                    verticalAlign: 'top',
                  }}
                >
                  <span className="font-semibold text-gray-900 text-xs tracking-wide">
                    ACTIONS
                  </span>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={(row as { id?: string }).id || rowIndex}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': {
                    backgroundColor: isEditing
                      ? 'rgba(0,0,0,0.02)'
                      : 'transparent',
                  },
                }}
              >
                {columns.map((col) => {
                  const rawComputed = col.formula
                    ? calculateValue(row, col.formula)
                    : (row[col.field] ?? '');
                  const errorMsg =
                    col.type === 'number'
                      ? getCellError(col, rawComputed)
                      : null;
                  const displayVal =
                    col.formula &&
                    typeof rawComputed === 'number' &&
                    col.formatValue
                      ? col.formatValue(rawComputed)
                      : String(rawComputed);

                  return (
                    <TableCell
                      key={String(col.field)}
                      align={col.align || 'left'}
                      sx={{ py: 1.5, px: 1.5 }}
                    >
                      {showInputs && !col.formula && !col.readOnly ? (
                        col.type === 'select' ? (
                          <Autocomplete
                            size="small"
                            fullWidth
                            options={col.options || []}
                            getOptionLabel={(option) => {
                              if (
                                typeof option === 'object' &&
                                option !== null &&
                                'label' in option
                              ) {
                                return String(option.label);
                              }
                              const found = col.options?.find(
                                (opt) => opt.value === option,
                              );
                              return found
                                ? String(found.label)
                                : String(option);
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.value ===
                              (typeof value === 'object' &&
                              value !== null &&
                              'value' in value
                                ? value.value
                                : value)
                            }
                            value={
                              col.options?.find(
                                (opt) => opt.value === rawComputed,
                              ) || null
                            }
                            onChange={(_, newValue) => {
                              const val =
                                newValue &&
                                typeof newValue === 'object' &&
                                'value' in newValue
                                  ? newValue.value
                                  : '';
                              handleCellChange(rowIndex, col.field, val);
                            }}
                            renderInput={(params) => (
                              <GridTextBox
                                {...params}
                                placeholder={col.placeholder || 'Select option'}
                              />
                            )}
                            sx={{
                              minWidth: fitWidth ? 0 : '140px',
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#FFFFFF',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                '&.Mui-focused fieldset': {
                                  borderColor: 'var(--color-burgundy, #8a181a)',
                                },
                              },
                            }}
                          />
                        ) : (
                          <GridTextBox
                            type={
                              col.allowedTextValues &&
                              col.allowedTextValues.length > 0
                                ? 'text'
                                : col.type || 'text'
                            }
                            // need to protect against nan fallback
                            value={
                              typeof rawComputed === 'number' &&
                              Number.isNaN(rawComputed)
                                ? ''
                                : (rawComputed as string | number)
                            }
                            placeholder={col.placeholder || col.label}
                            error={Boolean(errorMsg)}
                            onChange={(e) => {
                              const val = e.target.value;
                              const isAllowedText = col.allowedTextValues?.some(
                                (item) =>
                                  item.toUpperCase() === val.toUpperCase(),
                              );
                              const parsedValue =
                                isAllowedText ||
                                Number.isNaN(Number(val)) ||
                                val === ''
                                  ? val
                                  : Number(val);
                              handleCellChange(
                                rowIndex,
                                col.field,
                                parsedValue,
                              );
                            }}
                            sx={{
                              minWidth: fitWidth
                                ? 0
                                : col.type === 'number'
                                  ? '90px'
                                  : '120px',
                            }}
                            slotProps={{
                              htmlInput: {
                                min: col.min,
                                max: col.max,
                                step: col.step,
                                style: { textAlign: col.align || 'left' },
                              },
                            }}
                          />
                        )
                      ) : (
                        <span
                          className={`text-sm block whitespace-nowrap ${
                            col.readOnly && showInputs
                              ? 'bg-gray-100 text-gray-600 px-2.5 py-1 rounded border border-gray-200 inline-block font-medium'
                              : col.formula
                                ? 'text-foreground font-bold'
                                : 'text-foreground font-normal'
                          }`}
                        >
                          {displayVal || '-'}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
                {showInputs && allowDelete && (
                  <TableCell align="center" sx={{ py: 1.5 }}>
                    {!isPreview ? (
                      <IconButton
                        aria-label="delete row"
                        size="small"
                        onClick={() => setDeleteTargetIndex(rowIndex)}
                        sx={{
                          color: 'var(--color-error, #8a181a)',
                          '&:hover': {
                            backgroundColor: 'rgba(214, 69, 69, 0.08)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showInputs && onAddRow && allowAddRow && (
        <button
          onClick={onAddRow}
          type="button"
          className="px-5 py-2 text-sm font-medium text-white bg-burgundy hover:bg-burgundy/90 rounded-md transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
        >
          <PlusIcon fontSize="small" />
          {addButtonLabel}
        </button>
      )}
      {/* Confirmation popup when user deletes a row */}
      <Dialog
        open={deleteTargetIndex !== null}
        onClose={() => setDeleteTargetIndex(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 600 }}>
          Are you sure you want to delete this row?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            This action cannot be undone. Once saved, this row will be
            permanently removed from the table.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTargetIndex(null)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              color: 'var(--color-foreground, #2b2428)',
              borderColor: 'var(--color-muted, #6f666b)',
              '&:hover': {
                borderColor: 'var(--color-foreground, #2b2428)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteRow}
            variant="contained"
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-error, #8a181a)',
              '&:hover': {
                backgroundColor: 'var(--color-terracotta, #8c2d2e)',
              },
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
