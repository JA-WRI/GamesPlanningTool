import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/data';
import { gameSwitchHref, resolveSessionNsoId } from '@/lib/routing/Navigation';
import { getGamesWithNsos } from '@/queries/games';

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
  const game = games.find((g) => String(g.id) === gameId);
  if (!game) notFound();

  const { role, nsoId } = session.user;
  redirect(
    gameSwitchHref(gameId, role, resolveSessionNsoId(game, role, nsoId)),
  );
}
