// AI contribution: 50% or more AI-generated
import 'server-only';
import { prisma } from '@/lib/prisma';
import { toDbIds } from '@/features/team-size/lib/teamSizeDbMapping';
import {
  JOURNEY_STEPS,
  type JourneyStepStatuses,
} from '@/features/team-journey/lib/stepperLogic';

// the saved status of each stepper step, empty when the url ids are not real db ids
export async function getJourneyStepStatuses(
  gameId: string,
  nsoId: string,
): Promise<JourneyStepStatuses> {
  const ids = toDbIds(gameId, nsoId);
  if (!ids) return {};

  const tasks = await prisma.task.findMany({
    where: {
      gameNso: { gameId: ids.gameId, nsoId: ids.nsoId },
      stepKey: { in: JOURNEY_STEPS.map((step) => step.key) },
    },
    select: { stepKey: true, status: true },
    // same result on every load if a step has 2 tasks
    orderBy: { id: 'asc' },
  });

  return Object.fromEntries(tasks.map((task) => [task.stepKey, task.status]));
}
