import { notFound } from 'next/navigation';
import { getGamesWithNsos } from '@/server/queries/games';
import { findGame } from '@/lib/routing/Navigation';

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const [{ gameId }, games] = await Promise.all([params, getGamesWithNsos()]);
  if (!findGame(games, gameId)) notFound();
  return <>{children}</>;
}
