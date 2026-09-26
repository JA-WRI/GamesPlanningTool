'use client';

import React, { useState } from 'react';

interface TopbarProps {
  currentGames?: string;
  onGamesChange?: (games: string) => void;
}

export function Topbar({
  currentGames = 'LA 2028',
  onGamesChange,
}: TopbarProps) {
  const [selectedGames, setSelectedGames] = useState(currentGames);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const gamesList = ['LA 2028', 'Milano Cortina 2026', 'Paris 2024'];

  const handleSelect = (games: string) => {
    setSelectedGames(games);
    setIsDropdownOpen(false);
    onGamesChange?.(games);
  };

  return (
    <header className="w-full bg-[#80131d] text-white select-none shadow-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-white rounded-full flex flex-col items-center justify-center p-1 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-[#d62828]"
                aria-hidden="true"
              >
                <path d="M12 2l1.6 3.5 3.8-1-1.2 3.6 3.8 1.4-3.1 2.3 2.1 3.2-3.8-.4-1.2 3.4-1-3.4-3.8.4 2.1-3.2-3.1-2.3 3.8-1.4-1.2-3.6 3.8 1L12 2z" />
              </svg>
              <div className="flex -space-x-0.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full border border-blue-600 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full border border-yellow-500 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full border border-neutral-800 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full border border-green-600 inline-block" />
                <span className="w-1.5 h-1.5 rounded-full border border-red-600 inline-block" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
              Games Planning Tool
            </h1>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              className="flex items-center space-x-2 bg-white text-neutral-900 px-3.5 py-1 rounded-full text-sm font-semibold shadow-inner hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <span>{selectedGames}</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white text-neutral-900 rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {gamesList.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleSelect(g)}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-neutral-100 transition-colors flex items-center justify-between cursor-pointer ${
                      selectedGames === g
                        ? 'text-[#80131d] font-bold bg-red-50'
                        : ''
                    }`}
                  >
                    <span>{g}</span>
                    {selectedGames === g && (
                      <svg
                        className="w-4 h-4 text-[#80131d]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3.5">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-white leading-tight">
              Alex Dunphy
            </div>
            <div className="text-xs text-neutral-200">Role-Title</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center font-bold text-sm tracking-wider shadow-sm ring-2 ring-white/30">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
export default Topbar;
