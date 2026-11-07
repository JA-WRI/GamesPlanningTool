import { notFound } from 'next/navigation';
import { getGamesWithNsos } from '@/lib/queries/games';
import { findGame } from '@/lib/routing/Navigation';

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  // The game must exist (matched against the cached list, so a bad id never reaches Prisma).
  if (!findGame(await getGamesWithNsos(), gameId)) notFound();

  return <>{children}</>;
}
