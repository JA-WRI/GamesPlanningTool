// AI contribution: 50% or more AI-generated
'use server';

import { prisma } from '@/lib/prisma';
import type { MedalRow } from '../lib/teamSizeGridLogic';
import { toDbIds } from '../lib/teamSizeDbMapping';
import { hasMedalRowsShape, medalRowsToDb } from '../lib/medalDbMapping';
import { canEditNso } from './canEditNso';

// saves event, medal and notes for the NSO athletes in one game
export async function saveMedalRows(
  gameId: string,
  nsoId: string,
  rows: MedalRow[],
): Promise<{ ok: boolean }> {
  const ids = toDbIds(gameId, nsoId);
  if (!ids || !hasMedalRowsShape(rows)) return { ok: false };
  // the user must be allowed to edit this NSO
  if (!(await canEditNso(nsoId))) return { ok: false };

  const data = medalRowsToDb(rows);
  const rowIds = data.map((row) => row.id);
  // the same athlete twice is refused
  if (new Set(rowIds).size !== rowIds.length) return { ok: false };

  // every row must be an athlete of this NSO in this game
  const ownAthletes = await prisma.gameMember.count({
    where: {
      id: { in: rowIds },
      gameId: ids.gameId,
      member: { nsoId: ids.nsoId, type: 'Athlete' },
    },
  });
  if (ownAthletes !== rowIds.length) return { ok: false };

  // all or nothing, the names are never changed here
  await prisma.$transaction(
    data.map(({ id, ...columns }) =>
      prisma.gameMember.update({ where: { id }, data: columns }),
    ),
  );

  return { ok: true };
}
