// AI contribution: 50% or more AI-generated
'use client';

import { useNotes } from '@/hooks/useNotes';

type NotesBoxProps = {
  id: string;
  value: string;
  onSave: (notes: string) => void;
  label?: string;
  placeholder?: string;
};


export default function NotesBox({
  id,
  value,
  onSave,
  label = 'Notes',
  placeholder = 'Add notes',
}: NotesBoxProps) {
  const notes = useNotes(value, onSave);

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
          value={notes.draft}
          placeholder={placeholder}
          onChange={(e) => notes.change(e.target.value)}
          className="field-sizing-content w-full resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      <NotesActions notes={notes} />
    </div>
  );
}

// under the box: Discard and Save while typing then "Notes saved"
function NotesActions({ notes }: { notes: ReturnType<typeof useNotes> }) {
  if (notes.hasChanges) {
    return (
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={notes.discard}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={notes.save}
          className="px-5 py-2 text-sm font-medium text-white bg-burgundy hover:bg-burgundy/90 rounded-md transition-colors shadow-sm cursor-pointer"
        >
          Save
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
