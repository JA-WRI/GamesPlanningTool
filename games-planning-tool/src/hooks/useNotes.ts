// AI contribution: No substantial AI-generated cod
'use client';

import { useState } from 'react';

// keeps the notes text & saves it or puts back the last saved version
export function useNotes(
  initialNotes: string,
  onSave: (notes: string) => void,
) {
  const [draft, setDraft] = useState(initialNotes);
  const [saved, setSaved] = useState(initialNotes);
  const [justSaved, setJustSaved] = useState(false);
  const hasChanges = draft !== saved;

  const change = (text: string) => {
    setDraft(text);
    setJustSaved(false);
  };

  const save = () => {
    if (!hasChanges) return;
    setSaved(draft);
    setJustSaved(true);
    onSave(draft);
  };

  const discard = () => {
    setDraft(saved);
  };

  return { draft, hasChanges, justSaved, change, save, discard };
}
