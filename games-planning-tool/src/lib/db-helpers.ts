// AI contribution: Below 50% AI-generated

import { prisma } from '@/lib/prisma';

export async function genericSave<T extends { id: string }>(
  modelDelegate: {
    findMany: (args?: any) => Promise<{ id: string }[]>;
    deleteMany: (args: any) => Promise<any>;
    upsert: (args: any) => Promise<any>;
  },
  rows: T[],
): Promise<void> {
  const existing = await modelDelegate.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map((e) => e.id));
  const incomingIds = new Set(rows.map((r) => r.id));

  // deleting rows
  const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
  if (idsToDelete.length > 0) {
    await modelDelegate.deleteMany({
      where: { id: { in: idsToDelete } },
    });
  }

  for (const row of rows) {
    await modelDelegate.upsert({
      where: { id: row.id },
      update: row,
      create: row,
    });
  }
}
