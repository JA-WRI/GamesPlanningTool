// AI contribution: 50% or more AI-generated
'use client';

type NotesBoxProps = {
  id: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
};

// white box under a table, same border colour and corners as the grid's
// table; "Notes" label inside, about 4 lines tall even when empty, and
// stretches to fill the rest of the card so side-by-side cards end together
export default function NotesBox({
  id,
  value,
  isEditing,
  onChange,
}: NotesBoxProps) {
  return (
    <div className="min-h-28 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-gray-400">
      <label htmlFor={id} className="block text-sm text-gray-500">
        Notes
      </label>

      {isEditing ? (
        // grows with the text, starts at 4 lines
        <textarea
          id={id}
          rows={4}
          value={value}
          placeholder="Add notes"
          onChange={(e) => onChange(e.target.value)}
          className="field-sizing-content w-full resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
        />
      ) : (
        <p
          id={id}
          className="whitespace-pre-wrap break-words text-sm text-gray-700"
        >
          {value}
        </p>
      )}
    </div>
  );
}
