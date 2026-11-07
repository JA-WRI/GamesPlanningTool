//No substantial AI generated code
'use client';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { findGame, gameHasNso, gameSwitchHref } from '@/lib/routing/Navigation';
import { GameWithNsos, Role } from '@/lib/types';

export default function GamesSelector({
  role,
  games,
}: {
  role: Role;
  games: GameWithNsos[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ gameId?: string; nsoId?: string }>();

  const currentGame = findGame(games, params.gameId);

  function handleChange(newGameId: string) {
    // NSO users: their own NSO comes from the URL (layouts guarantee it's theirs).
    // COC/Admin: carry the picked NSO over only if it's part of the new game.
    const picked = params.nsoId ?? searchParams.get('nso') ?? undefined;
    const keepPicked = gameHasNso(findGame(games, newGameId), picked)
      ? picked
      : undefined;
    router.push(gameSwitchHref(newGameId, role, params.nsoId, keepPicked));
  }

  return (
    <select
      value={currentGame ? String(currentGame.id) : ''}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Select game"
      className="rounded-full bg-white px-6 p-2 pr-5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy"
    >
      {!currentGame && (
        <option value="" disabled>
          Select game
        </option>
      )}
      {games.map((game) => (
        <option key={game.id} value={String(game.id)}>
          {game.name}
        </option>
      ))}
    </select>
  );
}
