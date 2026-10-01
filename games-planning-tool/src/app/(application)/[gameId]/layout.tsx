import { Games } from '@/lib/data';
import { notFound } from 'next/navigation';
export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  if (!Games.some((g) => g.id === gameId)) notFound();
  return <>{children}</>;
}
