// Made with AI agents (Antigravity)
'use client';

import React from 'react';
import Image from 'next/image';
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
  className = 'w-full pl-4 pr-9 py-1 text-xs sm:text-sm bg-white border border-neutral-300 rounded-full focus:outline-hidden focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy placeholder:text-neutral-500 transition-all',
}: SearchPillProps) {
  const clearIcon = (
    <Image
      src="/icons/clear.svg"
      alt="Clear search"
      width={14}
      height={14}
      className="w-3.5 h-3.5 transition-opacity hover:opacity-80"
    />
  );

  const searchIcon = (
    <Image
      src="/icons/search.svg"
      alt="Search"
      width={16}
      height={16}
      className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    />
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
