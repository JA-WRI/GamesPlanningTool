import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/data';
import { gameSwitchHref } from '@/lib/routing/Navigation';
import { getGamesWithNsos } from '@/queries/games';

export default async function RootPage() {
  const [session, games] = await Promise.all([
    getSession(),
    getGamesWithNsos(),
  ]);

  // TODO: use the session's game once sessions come from the database
  const game = games[0];
  if (!game) notFound();

  redirect(
    gameSwitchHref(String(game.id), session.user.role, session.user.nsoId),
  );
}
