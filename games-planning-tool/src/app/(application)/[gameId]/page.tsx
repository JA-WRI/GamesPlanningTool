import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/server/auth/session'; // TODO(auth): real session
import {
  findGame,
  gameSwitchHref,
  resolveSessionNsoId,
} from '@/lib/routing/Navigation';
import { getGamesWithNsos } from '@/server/queries/games';

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const [session, { gameId }, games] = await Promise.all([
    getSession(),
    params,
    getGamesWithNsos(),
  ]);

  // gameId has already been validated by the [gameId] layout
  const game = findGame(games, gameId);
  if (!game) notFound();

  const { role, nsoId } = session.user;

  // An NSO user whose NSO isn't in this game must not be sent to another
  // team's dashboard
  const sessionNsoId = resolveSessionNsoId(game, role, nsoId);
  if (role === 'nso' && !sessionNsoId) notFound();

  redirect(gameSwitchHref(gameId, role, sessionNsoId));
}
