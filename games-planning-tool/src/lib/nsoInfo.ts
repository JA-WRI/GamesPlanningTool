//100% AI generated
import { prisma } from '@/lib/prisma';
import type { NSOInfoPage } from '@/features/contact-information/components/NSOInfoPage';

export async function getNsoInfo(
  nsoId: string,
  gameId: number,
): Promise<NSOInfoPage | null> {
  const nso = await prisma.nso.findUnique({
    where: { id: nsoId },
    select: {
      name: true,
      sport: true,
      contacts: {
        where: { gameId, isPrimary: true, type: 'NSO' },
        select: { email: true },
        orderBy: { id: 'asc' }, // deterministic if more than one primary exists
        take: 1,
      },
    },
  });

  if (!nso) return null;

  return {
    name: nso.name,
    sport: nso.sport,
    primaryContactEmail: nso.contacts[0]?.email ?? '',
  };
}
