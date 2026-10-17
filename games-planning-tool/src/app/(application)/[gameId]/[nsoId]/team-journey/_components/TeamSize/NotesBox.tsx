// AI contribution: 50% or more AI-generated
'use client';

type NotesBoxProps = {
  id: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
};

// white box under a table same border colour and corners as the grid's
// table"Notes" label inside about 4 lines tall even when empty &
// stretches to fill rest of card so side b side cards end together
export default function NotesBox({
  id,
  value,
  isEditing,
  onChange,
}: NotesBoxProps) {
  return (
    <div className="min-h-28 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-gray-400">
      {isEditing ? (
        <>
          <label htmlFor={id} className="block text-sm text-gray-500">
            Notes
          </label>
          {/* grows with the text, starts at 4 lines */}
          <textarea
            id={id}
            rows={4}
            value={value}
            placeholder="Add notes"
            onChange={(e) => onChange(e.target.value)}
            className="field-sizing-content w-full resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </>
      ) : (
        <>
          {/* a label can't point at a <p> so link them with arialabelledby */}
          <span id={`${id}-label`} className="block text-sm text-gray-500">
            Notes
          </span>
          <p
            id={id}
            aria-labelledby={`${id}-label`}
            className="whitespace-pre-wrap break-words text-sm text-gray-700"
          >
            {value}
          </p>
        </>
      )}
    </div>
  );
}
