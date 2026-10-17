// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { useGrid } from '@/hooks/useGrid';

type GridCardOptions<T> = {
  initialRows: T[];
  createRow: () => T;
  isValid?: (rows: T[]) => boolean;
  onSave: (rows: T[]) => void;
};

// edit,save,cancel for one card's shared grid rows
// (notes save on their own in the shared NotesBox)
export function useGridCard<
  T extends Record<string, unknown> & { id: string },
>({
  initialRows,
  createRow,
  isValid = () => true,
  onSave,
}: GridCardOptions<T>) {
  const grid = useGrid(initialRows, createRow);
  const [hasCellError, setHasCellError] = useState(false);
  // GridHeader's Edit View / Preview toggle
  const [isPreview, setIsPreview] = useState(false);
  const canSave = !hasCellError && isValid(grid.rows);

  const save = () => {
    if (!canSave) return;
    grid.handleSave();
    setIsPreview(false);
    onSave(grid.rows);
  };

  const cancel = () => {
    grid.handleCancel();
    setIsPreview(false);
  };

  return {
    ...grid,
    setHasCellError,
    canSave,
    save,
    cancel,
    isPreview,
    // like BaseGridPage: no preview while something can't be saved
    setIsPreview: (preview: boolean) => {
      if (preview && !canSave) return;
      setIsPreview(preview);
    },
    edit: () => {
      grid.setIsEditing(true);
      setIsPreview(false);
    },
  };
}
