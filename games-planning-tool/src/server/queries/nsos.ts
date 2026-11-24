//no substantial AI generated code
import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export const getNsoCategories = cache(async (): Promise<string[]> => {
  const rows = await prisma.nso.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  });
  return rows.map((nso) => nso.name);
});
