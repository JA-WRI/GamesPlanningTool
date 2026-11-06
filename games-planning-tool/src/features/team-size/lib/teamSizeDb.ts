// AI contribution: 50% or more AI-generated
import { prisma } from '@/lib/prisma';
import {
  SavedTeamSize,
  dbToDisciplines,
  dbToTeamSize,
  toDbIds,
} from './teamSizeDbMapping';

// one NSO's team size for one game, null when the url ids are not real db ids
export async function getTeamSize(
  gameId: string,
  nsoId: string,
): Promise<SavedTeamSize | null> {
  const ids = toDbIds(gameId, nsoId);
  if (!ids) return null;

  const estimate = await prisma.teamSizeEstimate.findUnique({
    where: { nsoId_gameId: ids },
    include: { disciplineBreakdowns: true },
  });

  return {
    teamSize: dbToTeamSize(estimate),
    disciplines: dbToDisciplines(
      estimate?.disciplineBreakdowns ?? [],
      estimate?.disciplineBreakdownNotes ?? '',
    ),
  };
}
