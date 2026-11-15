// No Substantial AI contribution
import { useState } from 'react';

export function useGrid<T extends { id: string }>(
  initialRows: T[],
  createEmptyRow: () => T,
  onSaveCallback?: (updatedRows: T[]) => void | Promise<unknown>,
) {
  const [isEditing, setIsEditing] = useState(false);
  const [rows, setRows] = useState<T[]>(initialRows);
  const [savedRows, setSavedRows] = useState<T[]>(initialRows);

  const handleSave = async () => {
    const result = await onSaveCallback?.(rows);
    const canonicalRows = Array.isArray(result) ? (result as T[]) : rows;
    setRows(canonicalRows);
    setSavedRows(canonicalRows);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRows(savedRows);
  };

  const resetTo = (canonicalRows: T[]) => {
    setRows(canonicalRows);
    setSavedRows(canonicalRows);
    setIsEditing(false);
  };

  const markRowsSaved = (saved: T[]) => {
    setSavedRows(saved);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  return {
    rows,
    setRows,
    isEditing,
    setIsEditing,
    markRowsSaved,
    resetTo,
    handleSave,
    handleCancel,
    handleAddRow,
  };
}
