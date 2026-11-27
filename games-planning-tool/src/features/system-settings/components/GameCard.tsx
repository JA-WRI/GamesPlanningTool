//50% or more AI generated
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import type { GameSummary } from '@/lib/types';
import { SETTINGS_SECTIONS } from '@/lib/system-settings-sections';
import SetupProgressBar from '@/components/system-settings/SetupProgressBar';
import { setGameActive } from '@/features/system-settings/actions/setGameActive';
import DeleteGameModal from './DeleteGameModal';

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

const labelClass =
  'text-[11px] font-medium uppercase tracking-wide text-gray-400';

function DateBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className={labelClass}>{label}</dt>
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

export default function GameCard({
  game,
  sectionsDone,
}: {
  game: GameSummary;
  sectionsDone: number;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const archiveLabel = game.isActive ? 'Archive' : 'Restore';
  const ArchiveToggleIcon = game.isActive ? ArchiveIcon : UnarchiveIcon;
  const totalSections = SETTINGS_SECTIONS.length;

  const handleToggleActive = () => {
    setMenuAnchor(null);
    setError(null);
    startTransition(async () => {
      try {
        const result = await setGameActive(game.id, !game.isActive);
        if (!result.ok) setError(result.error);
      } catch (err) {
        console.error('setGameActive failed:', err);
        setError('Could not update the game. Please try again.');
      }
    });
  };

  const openDelete = () => {
    setMenuAnchor(null);
    setConfirmOpen(true);
  };

  return (
    // Stacked on small screens; one row from lg up.
    <article className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:shadow-md lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-8">
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

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span className={labelClass}>Setup</span>
          <span className="text-xs text-gray-500">
            {sectionsDone} of {totalSections} sections
          </span>
        </div>
        <SetupProgressBar
          done={sectionsDone}
          total={totalSections}
          label={`Setup progress for ${game.name}`}
          className="mt-2"
        />
      </div>

      <div className="flex items-center justify-between gap-2 lg:justify-end">
        {/* The game's setup index redirects to its first section. */}
        <Link
          href={`/admin/system-settings/${game.id}`}
          className="shrink-0 rounded-lg bg-[#B5650D] px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#9A540A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5650D]/40 focus-visible:ring-offset-2"
        >
          View Configurations
        </Link>

        {/* Monitors (1600px+): archive and delete stay in view. Laptops are
            usually 1280–1536px, so they get the ⋮ menu below instead.
            Keep this breakpoint the same as the ⋮ button's. */}
        <div className="hidden items-center gap-2 min-[1600px]:flex">
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={isPending}
            aria-label={`${archiveLabel} ${game.name}`}
            title={archiveLabel}
            className={`${iconButton} hover:bg-amber-50 hover:text-[#B5650D] focus-visible:ring-amber-300`}
          >
            <ArchiveToggleIcon fontSize="small" aria-hidden />
          </button>

          <button
            type="button"
            onClick={openDelete}
            disabled={isPending}
            aria-label={`Delete ${game.name}`}
            title="Delete"
            className={`${iconButton} hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-300`}
          >
            <DeleteIcon fontSize="small" aria-hidden />
          </button>
        </div>

        {/* Laptops and smaller (under 1600px): archive and delete live in a ⋮ menu. */}
        <button
          type="button"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          disabled={isPending}
          aria-label={`More actions for ${game.name}`}
          aria-haspopup="menu"
          aria-expanded={menuAnchor ? 'true' : undefined}
          className={`${iconButton} hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-gray-300 min-[1600px]:hidden`}
        >
          <MoreVertIcon fontSize="small" aria-hidden />
        </button>
        <Menu
          anchorEl={menuAnchor}
          open={menuAnchor !== null}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleToggleActive}>
            <ListItemIcon>
              <ArchiveToggleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{archiveLabel}</ListItemText>
          </MenuItem>
          <MenuItem onClick={openDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </div>

      {error && (
        <p
          role="alert"
          className="col-span-full rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </p>
      )}

      <DeleteGameModal
        gameId={game.id}
        gameName={game.name}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />
    </article>
  );
}
