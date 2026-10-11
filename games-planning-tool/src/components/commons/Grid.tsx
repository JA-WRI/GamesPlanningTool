// This file contains AI generated code used to define the table body of the grid template from MUI Library.
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlusIcon from '@mui/icons-material/Add';
import TextBox from '@/components/commons/TextBox';

export interface ColumnDefinition<T> {
  field: keyof T;
  label: string;
  type?: 'text' | 'email' | 'tel';
  placeholder?: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

interface GridProps<T extends Record<string, unknown>> {
  columns: ColumnDefinition<T>[];
  rows: T[];
  isEditing: boolean;
  onRowsChange: (newRows: T[]) => void;
  onAddRow: () => void;
  addButtonLabel?: string;
}

export default function Grid<T extends Record<string, unknown>>({
  columns,
  rows,
  isEditing,
  onRowsChange,
  onAddRow,
  addButtonLabel = 'Add Row',
}: GridProps<T>) {
  const handleCellChange = (
    rowIndex: number,
    field: keyof T,
    value: string,
  ) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [field]: value,
    };
    onRowsChange(updatedRows);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const updatedRows = rows.filter((_, idx) => idx !== rowIndex);
    onRowsChange(updatedRows);
  };

  return (
    <div className="w-full space-y-4">
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          overflowX: 'auto',
          backgroundColor: 'var(--color-surface, #ffffff)',
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="editable grid table">
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
                    fontWeight: 600,
                    color: 'var(--color-foreground, #2b2428)',
                    fontSize: '0.875rem',
                    borderBottom: '1px solid #E5E7EB',
                    py: 1.5,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              {isEditing && (
                <TableCell
                  align="center"
                  sx={{ width: 60, borderBottom: '1px solid #E5E7EB', py: 1.5 }}
                >
                  Actions
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
                  const val = (row[col.field] as string) ?? '';
                  return (
                    <TableCell
                      key={String(col.field)}
                      align={col.align || 'left'}
                      sx={{ py: 1, px: 1.5 }}
                    >
                      {isEditing ? (
                        <TextBox
                          type={col.type || 'text'}
                          value={val}
                          placeholder={col.placeholder || col.label}
                          onChange={(e) =>
                            handleCellChange(
                              rowIndex,
                              col.field,
                              e.target.value,
                            )
                          }
                          slotProps={{
                            htmlInput: {
                              style: { textAlign: col.align || 'left' },
                            },
                          }}
                        />
                      ) : (
                        <span className="text-sm text-foreground font-normal">
                          {val || '-'}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
                {isEditing && (
                  <TableCell align="center" sx={{ py: 1 }}>
                    <IconButton
                      aria-label="delete row"
                      size="small"
                      onClick={() => handleDeleteRow(rowIndex)}
                      sx={{
                        color: 'var(--color-error, #d64545)',
                        '&:hover': {
                          backgroundColor: 'rgba(214, 69, 69, 0.08)',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isEditing && (
        <button
          onClick={onAddRow}
          type="button"
          className="inline-flex items-center gap-2 bg-burgundy hover:bg-burgundy/90 text-white text-sm font-medium py-2.5 px-4 rounded-md transition-colors shadow-sm cursor-pointer"
        >
          <PlusIcon fontSize="small" />
          {addButtonLabel}
        </button>
      )}
    </div>
  );
}
