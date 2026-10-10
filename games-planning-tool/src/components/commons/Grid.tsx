// AI contribution: Above 50% Al-generated
// This file contains AI generated code used to define the table body of the grid template from MUI Library, and to support column types, formulas, header, subtexts, and a delete confirmation popup
'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlusIcon from '@mui/icons-material/Add';
import GridTextBox from '@/components/commons/GridTextBox';

export type ColumnType = 'text' | 'email' | 'tel' | 'number' | 'select';
export type CalculationOperator = '+' | '-' | '*';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface ColumnFormula<T> {
  operator: CalculationOperator;
  fieldA: keyof T;
  fieldB: keyof T;
}

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
}

interface GridProps<T extends Record<string, unknown>> {
  columns: ColumnDefinition<T>[];
  rows: T[];
  isEditing: boolean;
  isPreview?: boolean;
  onRowsChange: (newRows: T[]) => void;
  onAddRow?: () => void;
  addButtonLabel?: string;
}

export default function Grid<T extends Record<string, unknown>>({
  columns,
  rows,
  isEditing,
  isPreview = false,
  onRowsChange,
  onAddRow,
  addButtonLabel = 'Add Row',
}: GridProps<T>) {
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(
    null,
  );

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
    const valA = Number(row[formula.fieldA]) || 0;
    const valB = Number(row[formula.fieldB]) || 0;

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
        <Table sx={{ minWidth: 1000 }} aria-label="editable grid table">
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
              {isEditing && (
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
                      {showInputs && !col.formula ? (
                        col.type === 'select' ? (
                          <TextField
                            select
                            size="small"
                            fullWidth
                            value={rawComputed as string | number}
                            onChange={(e) =>
                              handleCellChange(
                                rowIndex,
                                col.field,
                                e.target.value,
                              )
                            }
                            sx={{
                              minWidth: '140px',
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#FFFFFF',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                '&.Mui-focused fieldset': {
                                  borderColor: 'var(--color-burgundy, #8a181a)',
                                },
                              },
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>{col.placeholder || 'Select option'}</em>
                            </MenuItem>
                            {col.options?.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <GridTextBox
                            type={col.type || 'text'}
                            value={rawComputed as string | number}
                            placeholder={col.placeholder || col.label}
                            onChange={(e) => {
                              const val = e.target.value;
                              const parsedValue =
                                col.type === 'number' && val !== ''
                                  ? Number(val)
                                  : val;
                              handleCellChange(
                                rowIndex,
                                col.field,
                                parsedValue,
                              );
                            }}
                            sx={{
                              minWidth:
                                col.type === 'number' ? '90px' : '120px',
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
                            col.formula
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
                {isEditing && (
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

      {showInputs && onAddRow && (
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
