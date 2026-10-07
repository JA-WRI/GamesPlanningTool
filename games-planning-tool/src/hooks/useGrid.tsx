import { useState } from 'react';

export function useGrid<T extends { id: string }>(
  initialRows: T[],
  createEmptyRow: () => T,
  onSaveCallback?: (updatedRows: T[]) => void,
) {
  const [isEditing, setIsEditing] = useState(false);
  const [rows, setRows] = useState<T[]>(initialRows);

  const handleSave = () => {
    setIsEditing(false);
    if (onSaveCallback) {
      onSaveCallback(rows);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRows(initialRows);
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
