// AI contribution: 50%
import { notFound } from 'next/navigation';
import { Nsos } from '@/lib/data';
import { prisma } from '@/lib/prisma';

export default async function NsoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;

  const isMockRoute =
    !/^\d+$/.test(gameId) && Nsos.some((nso) => nso.id === nsoId);

  if (!isMockRoute) {
    const dbGameId = Number(gameId);
    const isUuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(nsoId);

    if (
      !/^\d+$/.test(gameId) ||
      dbGameId < 1 ||
      dbGameId > 2_147_483_647 ||
      !isUuid
    ) {
      notFound();
    }

    const pairing = await prisma.gameNso.findUnique({
      where: {
        gameId_nsoId: { gameId: dbGameId, nsoId },
      },
      select: { id: true },
    });

    if (!pairing) notFound();
  }
  return <>{children}</>;
}
