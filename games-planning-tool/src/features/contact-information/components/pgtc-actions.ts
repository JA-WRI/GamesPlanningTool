// AI contribution: Below 50% AI-generated

'use server';

import { prisma } from '@/lib/prisma';
import { genericSave } from '@/lib/db-helpers';
import { DisciplineData } from '@/features/contact-information/components/PGTCDisciplines';

export async function getDisciplines(): Promise<DisciplineData[]> {
  const records = await prisma.pgtcDiscipline.findMany({
    orderBy: { name: 'asc' },
  });

  return records.map((r) => ({
    id: r.id,
    name: r.name,
    arrivalDate: r.arrivalDate ?? '',
    arrivalTime: r.arrivalTime ?? '',
    departureDate: r.departureDate ?? '',
    departureTime: r.departureTime ?? '',
    accommodationName: r.accommodationName ?? '',
    streetName: r.streetName ?? '',
    streetNumber: r.streetNumber ?? '',
    zipCode: r.zipCode ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    country: r.country ?? '',
    travelMethod: r.travelMethod ?? '',
    pointOfEntry: r.pointOfEntry ?? '',
    additionalNotes: r.additionalNotes ?? '',
  }));
}

export async function saveDisciplines(
  rows: DisciplineData[],
): Promise<DisciplineData[]> {
  await genericSave(prisma.pgtcDiscipline, rows);

  return getDisciplines();
}
