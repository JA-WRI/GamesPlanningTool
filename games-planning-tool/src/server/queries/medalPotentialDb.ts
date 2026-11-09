// AI contribution: 50% or more AI-generated
import 'server-only';
import { prisma } from '@/lib/prisma';
import { toDbIds } from '@/features/team-size/lib/teamSizeDbMapping';
import { dbToMedalRows } from '@/features/team-size/lib/medalDbMapping';
import type { MedalRow } from '@/features/team-size/lib/teamSizeGridLogic';

// the NSO athletes in this game, null when the url ids are not real db ids
export async function getMedalRows(
  gameId: string,
  nsoId: string,
): Promise<MedalRow[] | null> {
  const ids = toDbIds(gameId, nsoId);
  if (!ids) return null;

  const athletes = await prisma.gameMember.findMany({
    where: {
      gameId: ids.gameId,
      member: { nsoId: ids.nsoId, type: 'Athlete' },
    },
    select: {
      id: true,
      event: true,
      medal: true,
      medalNotes: true,
      member: { select: { firstName: true, lastName: true } },
    },
    orderBy: [
      { member: { lastName: 'asc' } },
      { member: { firstName: 'asc' } },
    ],
  });

  return dbToMedalRows(athletes);
}
