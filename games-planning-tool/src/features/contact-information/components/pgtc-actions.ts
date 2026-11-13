// AI contribution: Below 50% AI-generated

'use server';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import {
  hasUniqueRowIds,
  replaceCollection,
  runDraftSave,
} from '@/lib/db-helpers';
import { DisciplineData } from '@/features/contact-information/components/PGTCDisciplines';
import { parseGameId, pgtcDisciplinesToDb } from '../lib/contactDbMapping';

export async function getDisciplines(
  nsoId: string,
  gameId: string,
): Promise<DisciplineData[]> {
  const records = await prisma.pgtcDiscipline.findMany({
    where: { nsoId, gameId: parseGameId(gameId) },
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
    state: r.stateOrProvince ?? '',
    country: r.country ?? '',
    travelMethod: r.travelMethod ?? '',
    pointOfEntry: r.pointOfEntry ?? '',
    additionalNotes: r.additionalNotes ?? '',
  }));
}

export async function saveDisciplines(
  nsoId: string,
  gameId: string,
  rows: DisciplineData[],
): Promise<DisciplineData[]> {
  const scope = { nsoId, gameId: parseGameId(gameId) };
  const outcome = await runDraftSave(rows, {
    validate: hasUniqueRowIds,
    map: (draft) => pgtcDisciplinesToDb(nsoId, scope.gameId, draft),
    persist: async (mappedRows) => {
      await replaceCollection(
        (operation) => prisma.$transaction(operation),
        (tx: Prisma.TransactionClient) => tx.pgtcDiscipline,
        scope,
        mappedRows,
      );
      return getDisciplines(nsoId, gameId);
    },
  });

  if (!outcome.ok) throw new Error('Invalid PGTC discipline draft.');
  return outcome.value;
}
