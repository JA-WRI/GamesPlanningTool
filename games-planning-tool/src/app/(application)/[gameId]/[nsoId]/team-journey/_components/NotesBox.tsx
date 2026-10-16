// AI contribution: 50% or more AI-generated
'use client';

import { TextField } from '@mui/material';

type NotesBoxProps = {
  id: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
};

// "Notes / Factors" under a table
export default function NotesBox({
  id,
  value,
  isEditing,
  onChange,
}: NotesBoxProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-widest text-gray-500"
      >
        Notes / Factors
      </label>

      {isEditing ? (
        <TextField
          id={id}
          multiline
          minRows={1}
          fullWidth
          size="small"
          value={value}
          placeholder="Add notes"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <p
          id={id}
          className="whitespace-pre-wrap break-words rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
        >
          {value || <span className="text-gray-400">Add note</span>}
        </p>
      )}
    </div>
  );
}
