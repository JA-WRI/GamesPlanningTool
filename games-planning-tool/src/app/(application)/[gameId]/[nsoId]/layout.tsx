//no substantial AI generated code
import { notFound } from 'next/navigation';
import { getGamesWithNsos } from '@/server/queries/games';
import { findGame } from '@/lib/routing/Navigation';

export default async function NsoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const [{ gameId, nsoId }, games] = await Promise.all([
    params,
    getGamesWithNsos(),
  ]);
  const game = findGame(games, gameId);
  if (!game?.nsos.some((n) => n.id === nsoId)) notFound();
  return <>{children}</>;
}
