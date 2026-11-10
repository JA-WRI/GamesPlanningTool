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
    await onSaveCallback?.(rows);
    setSavedRows(rows);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRows(savedRows);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  return {
    rows,
    setRows,
    isEditing,
    setIsEditing,
    handleSave,
    handleCancel,
    handleAddRow,
  };
}
