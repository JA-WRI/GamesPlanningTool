//50% or more AI generated
'use client';

import { useState, useTransition } from 'react';
import type { GameSummary } from '@/server/queries/games';
import { setGameActive } from '../_lib/setGameActive';
import DeleteGameDialog from './DeleteGamePopup';

// Fixed locale and UTC so the server and browser render the same text,
// and a date-only value never shifts to the previous day.
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return null;
  return `${start ? formatDate(start) : 'TBD'} – ${end ? formatDate(end) : 'TBD'}`;
}

function DateBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm ${value ? 'text-gray-900' : 'text-gray-400'}`}
      >
        {value ?? 'Not set'}
      </dd>
    </div>
  );
}

const iconButton =
  'shrink-0 rounded-full p-2 text-gray-400 transition focus:outline-none focus-visible:ring-2 disabled:opacity-50';

export default function GameCard({ game }: { game: GameSummary }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const archiveLabel = game.isActive ? 'Archive' : 'Restore';

  const handleToggleActive = () => {
    setError(null);
    startTransition(async () => {
      const result = await setGameActive(game.id, !game.isActive);
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <article className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto] items-center gap-8 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:shadow-md">
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-gray-900">
          {game.name}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 shrink-0 fill-current"
          >
            <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
          </svg>
          <span className="truncate">
            {game.city}, {game.country}
          </span>
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-6">
        <DateBlock
          label="Games"
          value={formatRange(game.startDate, game.endDate)}
        />
        <DateBlock
          label="Planning period"
          value={formatRange(game.planningPeriodStart, game.planningPeriodEnd)}
        />
      </dl>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="shrink-0 rounded-lg bg-[#B5650D] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#9A540A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5650D]/40 focus-visible:ring-offset-2"
        >
          View Configurations
        </button>

        {/* Archive / Restore */}
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={isPending}
          aria-label={`${archiveLabel} ${game.name}`}
          title={archiveLabel}
          className={`${iconButton} hover:bg-amber-50 hover:text-[#B5650D] focus-visible:ring-amber-300`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-current"
          >
            {game.isActive ? (
              <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z" />
            ) : (
              <path d="M20.55 5.22l-1.39-1.68A1.51 1.51 0 0 0 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.02 3 6.5V19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z" />
            )}
          </svg>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label={`Delete ${game.name}`}
          title="Delete"
          className={`${iconButton} hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-300`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-current"
          >
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="col-span-full rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </p>
      )}

      <DeleteGameDialog
        gameId={game.id}
        gameName={game.name}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />
    </article>
  );
}
