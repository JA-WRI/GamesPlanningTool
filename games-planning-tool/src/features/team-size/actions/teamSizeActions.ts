// AI contribution: 50% or more AI-generated
'use server';

import { prisma } from '@/lib/prisma';
import { runDraftSave } from '@/lib/db-helpers';
import type { TeamSize } from '../lib/teamSizeLogic';
import type { DisciplineBreakdown } from '../lib/teamSizeGridLogic';
import {
  disciplinesToDb,
  hasTeamSizeShape,
  isTeamSizeSavable,
  teamSizeToDb,
  toDbIds,
} from '../lib/teamSizeDbMapping';

// saves one NSO team size for one game, creates the rows the first time and updates them after
export async function saveTeamSize(
  gameId: string,
  nsoId: string,
  teamSize: TeamSize,
  disciplines: DisciplineBreakdown,
): Promise<{ ok: boolean }> {
  const ids = toDbIds(gameId, nsoId);
  if (!ids) return { ok: false };

  const outcome = await runDraftSave(
    { ids, teamSize, disciplines },
    {
      authorize: async ({ ids: dbIds }) =>
        Boolean(
          await prisma.gameNso.findUnique({
            where: { gameId_nsoId: dbIds },
          }),
        ),
      validate: ({ teamSize: draft, disciplines: breakdown }) =>
        hasTeamSizeShape(draft, breakdown) &&
        isTeamSizeSavable(draft, breakdown),
      map: ({ teamSize: draft, disciplines: breakdown }) => ({
        estimate: teamSizeToDb(draft, breakdown),
        disciplines: disciplinesToDb(breakdown),
      }),
      persist: async ({ estimate, disciplines: rows }, { ids: dbIds }) => {
        await prisma.$transaction([
          prisma.teamSizeEstimate.upsert({
            where: { nsoId_gameId: dbIds },
            create: { ...dbIds, ...estimate },
            update: estimate,
          }),
          ...rows.map((row) =>
            prisma.disciplineBreakdown.upsert({
              where: {
                nsoId_gameId_discipline: {
                  ...dbIds,
                  discipline: row.discipline,
                },
              },
              create: { ...dbIds, ...row },
              update: row,
            }),
          ),
        ]);
      },
    },
  );

  return { ok: outcome.ok };
}
