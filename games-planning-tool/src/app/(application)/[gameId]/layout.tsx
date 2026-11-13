import { notFound } from 'next/navigation';
import { getSession } from '@/server/auth/session'; // TODO(auth): real session
import { getGamesWithNsos } from '@/server/queries/games';
import { findGame, gamesForUser } from '@/lib/routing/Navigation';

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const [session, { gameId }, games] = await Promise.all([
    getSession(),
    params,
    getGamesWithNsos(),
  ]);

  // NSO users can only open games their NSO takes part in
  const { role, nsoId } = session.user;
  if (!findGame(gamesForUser(games, role, nsoId), gameId)) notFound();

  return <>{children}</>;
}
