// Made with AI agents (Antigravity)
'use client';

import React from 'react';
import SearchBar from '@/components/commons/SearchBar';

interface SearchPillProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchPill({
  value,
  onChange,
  placeholder = 'Search by name, category...',
  className = 'w-full pl-4 pr-9 py-1 text-xs sm:text-sm bg-white border border-[#80131d] rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#80131d]/20 placeholder:text-neutral-500 transition-all',
}: SearchPillProps) {
  const clearIcon = (
    <svg
      className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600 transition-colors"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  );

  const searchIcon = (
    <svg
      className="w-4 h-4 text-[#80131d] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="relative min-w-[220px] sm:min-w-[260px]"
      inputClassName={className}
      clearIcon={clearIcon}
      icon={searchIcon}
    />
  );
}

export default SearchPill;
