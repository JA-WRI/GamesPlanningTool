// AI contribution: 50% or more AI-generated
'use client';

import { useState } from 'react';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import { useNotes } from '@/hooks/useNotes';

type NotesBoxProps = {
  id: string;
  value: string;
  onSave: (notes: string) => void | Promise<unknown>;
  initialDraft?: string;
  draftKey?: string;
  label?: string;
  placeholder?: string;
};

// notes box anyone can type in, with its own Save and Discard
export default function NotesBox({
  id,
  value,
  onSave,
  initialDraft,
  draftKey,
  label = 'Notes',
  placeholder = 'Add notes',
}: NotesBoxProps) {
  const notes = useNotes(value, onSave, initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [cleanupError, setCleanupError] = useState(false);
  const draftValue = { notes: notes.draft };
  const persistedDraft = useDraftAutosave({
    draftKey,
    value: draftValue,
    enabled: notes.hasChanges,
    initiallyRestored: initialDraft !== undefined,
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(false);
    setCleanupError(false);
    try {
      await persistedDraft.flush(draftValue);
      await notes.save();
      if (draftKey) {
        try {
          await persistedDraft.clear('committed');
        } catch {
          setCleanupError(true);
        }
      }
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (
      (persistedDraft.hasPersistedDraft || notes.hasChanges) &&
      !window.confirm(
        'Discard this draft and restore the last saved database value? This cannot be undone.',
      )
    ) {
      return;
    }

    persistedDraft.cancelPending();
    if (draftKey) {
      try {
        await persistedDraft.clear('discarded', { notes: value });
        setCleanupError(false);
      } catch {
        setCleanupError(true);
        return;
      }
    }
    notes.discard();
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      {/* white box,same border colour and corners as the grid's table */}
      <div className="min-h-28 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-gray-400">
        <label htmlFor={id} className="block text-sm text-gray-500">
          {label}
        </label>
        {/* grows with the text, starts at 4 lines */}
        <textarea
          id={id}
          rows={4}
          disabled={isSaving}
          value={notes.draft}
          placeholder={placeholder}
          onChange={(e) => notes.change(e.target.value)}
          className="field-sizing-content w-full resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      <NotesActions
        notes={notes}
        isSaving={isSaving || persistedDraft.isSaving}
        hasPersistedDraft={persistedDraft.hasPersistedDraft}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
      {saveError && (
        <p role="alert" className="self-end text-sm text-red-700">
          Save failed. Your changes are still here; please try again.
        </p>
      )}
      {cleanupError && (
        <p role="alert" className="self-end text-sm text-amber-700">
          Changes saved, but the old draft could not be cleared.
        </p>
      )}
      {draftKey && persistedDraft.isPending && (
        <p aria-live="polite" className="self-end text-sm text-gray-500">
          Draft changes not saved yet
        </p>
      )}
      {draftKey && persistedDraft.status === 'saved' && (
        <p aria-live="polite" className="self-end text-sm text-gray-500">
          Draft saved
        </p>
      )}
      {draftKey && persistedDraft.status === 'restored' && (
        <p aria-live="polite" className="self-end text-sm text-gray-500">
          Draft restored
        </p>
      )}
    </div>
  );
}

// under the box: Discard and Save while typing then "Notes saved"
function NotesActions({
  notes,
  isSaving,
  hasPersistedDraft,
  onSave,
  onDiscard,
}: {
  notes: ReturnType<typeof useNotes>;
  isSaving: boolean;
  hasPersistedDraft: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  if (notes.hasChanges) {
    return (
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {hasPersistedDraft ? 'Discard draft' : 'Discard changes'}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="px-5 py-2 text-sm font-medium text-white bg-burgundy hover:bg-burgundy/90 rounded-md transition-colors shadow-sm cursor-pointer disabled:cursor-wait disabled:opacity-70"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    );
  }
  if (!notes.justSaved) return null;
  return (
    <p role="status" className="self-end text-sm text-gray-500">
      Notes saved
    </p>
  );
}
