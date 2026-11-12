import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/data';
import {
  gamesForUser,
  gameSwitchHref,
  resolveSessionNsoId,
} from '@/lib/routing/Navigation';
import { getGamesWithNsos } from '@/server/queries/games';

export default async function RootPage() {
  const [session, games] = await Promise.all([
    getSession(),
    getGamesWithNsos(),
  ]);

  const { role, nsoId } = session.user;

  // TODO: use the session's game once sessions come from the database
  const game = gamesForUser(games, role, nsoId)[0];
  if (!game) notFound();

  const sessionNsoId = resolveSessionNsoId(game, role, nsoId);
  if (role === 'nso' && !sessionNsoId) notFound();

  redirect(gameSwitchHref(String(game.id), role, sessionNsoId));
}
