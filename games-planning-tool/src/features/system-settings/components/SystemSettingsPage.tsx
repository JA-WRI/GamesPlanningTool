//50% or more AI generated
'use client';

import { useState } from 'react';
import type { GameSummary } from '@/lib/types';
import GameCard from './GameCard';
import NewGamePopup from './NewGamePopup';

type GameTab = 'active' | 'archived';

export default function SystemSettingsPage({
  active,
  archived,
}: {
  active: GameSummary[];
  archived: GameSummary[];
}) {
  const [tab, setTab] = useState<GameTab>('active');
  const [popupOpen, setPopupOpen] = useState(false);

  const tabs: { value: GameTab; label: string }[] = [
    { value: 'active', label: `Active (${active.length})` },
    { value: 'archived', label: `Archived (${archived.length})` },
  ];
  const games = tab === 'active' ? active : archived;

  return (
    <div className="px-12 py-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">
        System Configurations
      </h1>

      <div className="flex items-center justify-between border-b border-gray-200">
        <div role="tablist" aria-label="Game status" className="flex gap-2">
          {tabs.map(({ value, label }) => {
            const selected = tab === value;
            return (
              <button
                key={value}
                id={`tab-${value}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="games-panel"
                onClick={() => setTab(value)}
                className={`-mb-px border-b-2 px-3 pb-3 text-sm transition ${
                  selected
                    ? 'border-green-700 font-medium text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setPopupOpen(true)}
          className="mb-2 flex items-center gap-1.5 rounded-lg border border-[#B5650D] px-3 py-1.5 text-sm font-medium text-[#B5650D] transition hover:bg-[#B5650D] hover:text-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-current"
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
          </svg>
          New Game
        </button>
      </div>

      <div
        id="games-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="space-y-4 pt-6"
      >
        {games.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500">
            No {tab === 'active' ? 'active' : 'archived'} games.
          </p>
        ) : (
          games.map((game) => <GameCard key={game.id} game={game} />)
        )}
      </div>

      <NewGamePopup open={popupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}
