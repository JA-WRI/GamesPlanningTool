// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { useGrid } from '@/hooks/useGrid';

type GridCardOptions<T> = {
  initialRows: T[];
  initialNotes?: string;
  createRow: () => T;
  isValid?: (rows: T[]) => boolean;
  onSave: (rows: T[], notes: string) => void;
};

// edit, save, cancel for one card(the shared grid rows plus its notes)
export function useGridCard<
  T extends Record<string, unknown> & { id: string },
>({
  initialRows,
  initialNotes = '',
  createRow,
  isValid = () => true,
  onSave,
}: GridCardOptions<T>) {
  const grid = useGrid(initialRows, createRow);
  const [notes, setNotes] = useState(initialNotes);
  const [savedNotes, setSavedNotes] = useState(initialNotes);
  const [hasCellError, setHasCellError] = useState(false);
  // GridHeader's Edit View / Preview toggle
  const [isPreview, setIsPreview] = useState(false);
  const canSave = !hasCellError && isValid(grid.rows);

  const save = () => {
    if (!canSave) return;
    grid.handleSave();
    setIsPreview(false);
    setSavedNotes(notes);
    onSave(grid.rows, notes);
  };

  const cancel = () => {
    grid.handleCancel();
    setIsPreview(false);
    setNotes(savedNotes);
  };

  return {
    ...grid,
    notes,
    setNotes,
    setHasCellError,
    canSave,
    save,
    cancel,
    isPreview,
    // like BaseGridPage no preview while something can't be saved
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
