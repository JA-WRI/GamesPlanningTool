import 'server-only';
import { prisma } from '@/lib/prisma';

export async function getCocContacts(gameId: number) {
  return prisma.contact.findMany({
    where: { gameId, type: 'COC' },
    orderBy: [{ isPrimary: 'desc' }, { lastName: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      countryCode: true,
      phone: true,
    },
  });
}
