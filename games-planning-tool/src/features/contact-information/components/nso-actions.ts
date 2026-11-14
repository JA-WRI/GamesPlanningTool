// No substantial AI usage.

'use server';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import {
  hasUniqueRowIds,
  replaceCollection,
  runDraftSave,
} from '@/lib/db-helpers';
import { ContactRow } from '@/components/contact-information/ContactGrid';
import { nsoContactsToDb, parseGameId } from '../lib/contactDbMapping';

export async function getNsoContacts(
  nsoId: string,
  gameId: string,
): Promise<ContactRow[]> {
  const contacts = await prisma.contact.findMany({
    where: { nsoId, gameId: parseGameId(gameId), type: 'NSO' },
    orderBy: { role: 'asc' },
  });

  return contacts.map((c) => ({
    id: c.id,
    role: c.role,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    countryCode: c.countryCode,
    phone: c.phone,
  }));
}

export async function saveNsoContacts(
  nsoId: string,
  gameId: string,
  rows: ContactRow[],
): Promise<ContactRow[]> {
  const scope = { nsoId, gameId: parseGameId(gameId), type: 'NSO' as const };
  const outcome = await runDraftSave(rows, {
    validate: hasUniqueRowIds,
    map: (draft) => nsoContactsToDb(nsoId, scope.gameId, draft),
    persist: async (mappedRows) => {
      await replaceCollection(
        (operation) => prisma.$transaction(operation),
        (tx: Prisma.TransactionClient) => tx.contact,
        scope,
        mappedRows,
      );
      return getNsoContacts(nsoId, gameId);
    },
  });

  if (!outcome.ok) throw new Error('Invalid NSO contact.');
  return outcome.value;
}
