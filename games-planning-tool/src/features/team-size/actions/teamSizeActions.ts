// AI contribution: 50% or more AI-generated
'use server';

import { prisma } from '@/lib/prisma';
import type { TeamSize } from '../lib/teamSizeLogic';
import type { DisciplineBreakdown } from '../lib/teamSizeGridLogic';
import {
  disciplinesToDb,
  hasTeamSizeShape,
  isTeamSizeSavable,
  teamSizeToDb,
  toDbIds,
} from '../lib/teamSizeDbMapping';
import { canEditNso } from './canEditNso';

// saves one NSO team size for one game, creates the rows the first time and updates them after
export async function saveTeamSize(
  gameId: string,
  nsoId: string,
  teamSize: TeamSize,
  disciplines: DisciplineBreakdown,
): Promise<{ ok: boolean }> {
  const ids = toDbIds(gameId, nsoId);
  if (
    !ids ||
    !hasTeamSizeShape(teamSize, disciplines) ||
    !isTeamSizeSavable(teamSize, disciplines)
  )
    return { ok: false };

  // the user must be allowed to edit this NSO
  if (!(await canEditNso(nsoId))) return { ok: false };

  // the NSO must take part in this game
  const gameNso = await prisma.gameNso.findUnique({
    where: { gameId_nsoId: ids },
  });
  if (!gameNso) return { ok: false };

  const estimate = teamSizeToDb(teamSize, disciplines);

  // all or nothing, the estimate first because the disciplines point to it
  await prisma.$transaction([
    prisma.teamSizeEstimate.upsert({
      where: { nsoId_gameId: ids },
      create: { ...ids, ...estimate },
      update: estimate,
    }),
    ...disciplinesToDb(disciplines).map((row) =>
      prisma.disciplineBreakdown.upsert({
        where: {
          nsoId_gameId_discipline: { ...ids, discipline: row.discipline },
        },
        create: { ...ids, ...row },
        update: row,
      }),
    ),
  ]);

  return { ok: true };
}
