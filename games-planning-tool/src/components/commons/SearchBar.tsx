// Below 50% AI generated
import React from 'react';
import { Search } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Shared SearchBar component.
 * Extended with an optional `clearable` prop to display a reset button when text is present.
 * Defaults to `false`, preserving the original layout, styling, and search icon fallback with zero impact on other usages.
 */
export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Type to search',
  clearable = false,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-full border border-gray-300 bg-white px-4 pr-12 text-sm text-gray-900 outline-none"
      />

      {clearable && value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer focus:outline-none flex items-center justify-center text-gray-500 hover:text-gray-700"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>
      ) : (
        <Search size={18} className="absolute right-3 top-2.5 text-gray-500" />
      )}
    </div>
  );
}
