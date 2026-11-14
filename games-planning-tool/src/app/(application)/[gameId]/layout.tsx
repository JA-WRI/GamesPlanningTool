// AI contribution: 30%
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const dbGameId = Number(gameId);

  if (!/^\d+$/.test(gameId) || dbGameId < 1 || dbGameId > 2_147_483_647) {
    notFound();
  }

  const game = await prisma.game.findUnique({
    where: { id: dbGameId },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!game || !game.isActive) {
    notFound();
  }

  return <>{children}</>;
}
