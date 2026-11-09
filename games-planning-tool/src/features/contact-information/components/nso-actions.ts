// No substantial AI usage.

'use server';

import { prisma } from '@/lib/prisma';
import { genericSave } from '@/lib/db-helpers';
import { ContactRow } from '@/components/contact-information/ContactGrid';

export async function getNsoContacts(): Promise<ContactRow[]> {
  const contacts = await prisma.nsoContact.findMany({
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
  rows: ContactRow[],
): Promise<ContactRow[]> {
  await genericSave(prisma.nsoContact, rows);

  return getNsoContacts();
}
