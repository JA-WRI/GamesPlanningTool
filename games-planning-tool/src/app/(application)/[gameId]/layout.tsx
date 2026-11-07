import { notFound } from 'next/navigation';
import { getGamesWithNsos } from '@/queries/games';

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const [{ gameId }, games] = await Promise.all([params, getGamesWithNsos()]);
  if (!games.some((g) => String(g.id) === gameId)) notFound();
  return <>{children}</>;
}
