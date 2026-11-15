// AI contribution: No substantial AI-generated cod
'use client';

import { useState } from 'react';

// keeps the notes text & saves it or puts back the last saved version
export function useNotes(
  initialNotes: string,
  onSave: (notes: string) => void | Promise<unknown>,
  initialDraft?: string,
) {
  const [draft, setDraft] = useState(initialDraft ?? initialNotes);
  const [saved, setSaved] = useState(initialNotes);
  const [justSaved, setJustSaved] = useState(false);
  const hasChanges = draft !== saved;

  const change = (text: string) => {
    setDraft(text);
    setJustSaved(false);
  };

  const save = async () => {
    if (!hasChanges) return;
    await onSave(draft);
    setSaved(draft);
    setJustSaved(true);
  };

  const discard = () => {
    setDraft(saved);
  };

  return { draft, hasChanges, justSaved, change, save, discard };
}
