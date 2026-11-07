import { notFound } from 'next/navigation';
import { getGamesWithNsos } from '@/lib/queries/games';
import { findGame, gameHasNso } from '@/lib/routing/Navigation';
import { getSession } from '@/lib/sessions';

export default async function NsoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;
  const [games, session] = await Promise.all([
    getGamesWithNsos(),
    getSession(),
  ]);

  // The NSO must participate in this game.
  if (!gameHasNso(findGame(games, gameId), nsoId)) notFound();

  // NSO users can only view their own NSO.
  if (session?.user.role === 'nso' && session.user.nsoId !== nsoId) notFound();

  return <>{children}</>;
}
