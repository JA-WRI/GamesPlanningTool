import { notFound } from 'next/navigation';
import { getGamesWithNsos } from '@/lib/queries/games';
import { findGame, gameHasNso } from '@/lib/routing/Navigation';

export default async function NsoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;
  // The NSO must take part in this game.
  if (!gameHasNso(findGame(await getGamesWithNsos(), gameId), nsoId)) {
    notFound();
  }

  return <>{children}</>;
}
