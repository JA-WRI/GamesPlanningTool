import React from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
  clearIcon?: React.ReactNode;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Type to search',
  className = 'relative w-full',
  inputClassName = 'w-full h-10 rounded-full border border-gray-300 bg-white px-4 pr-12 text-sm text-gray-900 outline-none',
  icon,
  clearIcon,
}: SearchBarProps) {
  return (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />

      {value && clearIcon ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
        >
          {clearIcon}
        </button>
      ) : icon ? (
        icon
      ) : (
        <Search size={18} className="absolute right-3 top-2.5 text-gray-500" />
      )}
    </div>
  );
}
