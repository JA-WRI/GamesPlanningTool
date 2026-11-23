//50% or more AI generated
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import type { GameSummary } from '@/lib/types';
import { setGameActive } from '@/features/system-settings/actions/setGameActive';
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
          <LocationOnIcon fontSize="inherit" className="shrink-0" aria-hidden />
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
        {/* The game's setup index redirects to its first section. */}
        <Link
          href={`/admin/system-settings/${game.id}`}
          className="shrink-0 rounded-lg bg-[#B5650D] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#9A540A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5650D]/40 focus-visible:ring-offset-2"
        >
          View Configurations
        </Link>

        {/* Archive / Restore */}
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={isPending}
          aria-label={`${archiveLabel} ${game.name}`}
          title={archiveLabel}
          className={`${iconButton} hover:bg-amber-50 hover:text-[#B5650D] focus-visible:ring-amber-300`}
        >
          {game.isActive ? (
            <ArchiveIcon fontSize="small" aria-hidden />
          ) : (
            <UnarchiveIcon fontSize="small" aria-hidden />
          )}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label={`Delete ${game.name}`}
          title="Delete"
          className={`${iconButton} hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-300`}
        >
          <DeleteIcon fontSize="small" aria-hidden />
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
