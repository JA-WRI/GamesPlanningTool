// AI contribution: 50% or more AI-generated
import 'server-only';
import { prisma } from '@/lib/prisma';
import type { AccreditationStatus } from '@/generated/prisma/enums';
import { toDbIds } from '@/features/team-size/lib/teamSizeDbMapping';
import { formatDay } from '@/features/accreditation/lib/accreditationPeriodLogic';

// a period as the page gets it, dates are 'YYYY-MM-DD'
export type AccreditationPeriodRow = {
  id: string;
  gameMemberId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  status: AccreditationStatus;
};

// all periods of the NSO people in this game, null when the url ids are not real db ids
export async function listAccreditationPeriods(
  gameId: string,
  nsoId: string,
): Promise<AccreditationPeriodRow[] | null> {
  const ids = toDbIds(gameId, nsoId);
  if (!ids) return null;

  const periods = await prisma.accreditationPeriod.findMany({
    where: {
      gameMember: { gameId: ids.gameId, member: { nsoId: ids.nsoId } },
    },
    select: {
      id: true,
      gameMemberId: true,
      propertyId: true,
      startDate: true,
      endDate: true,
      status: true,
    },
    // same order on every load
    orderBy: [{ gameMemberId: 'asc' }, { startDate: 'asc' }, { id: 'asc' }],
  });

  return periods.map((period) => ({
    ...period,
    startDate: formatDay(period.startDate),
    endDate: formatDay(period.endDate),
  }));
}
