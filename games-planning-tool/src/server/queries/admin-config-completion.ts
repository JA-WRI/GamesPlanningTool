// 50% or more AI generated code
import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type {
  SectionCompletion,
  ConfigSectionRoute,
} from '@/lib/admin-config-sections';

/*
  This file will be used to set Completion status of each Game setup section,
  It should show a check or exclamation marks beside your config task based on completion of your page.
  You job is to setup the rules to determine the setup status (when your page is considered complete or incomplete)
  Note: Statuses are worked out from the Game's data on every load; nothing about completion is stored in the database.
  *****Fill in your section and return true or false.*******
*/

/* eslint-disable @typescript-eslint/no-unused-vars -- gameId is unused until each function is filled in */

/* EXAMPLE (delete with the example-setup page): how to write a completion check.

  The pattern:
    1. Query only the fields your rule needs (select), for this gameId.
    2. No row means not complete.
    3. Write each condition on its own line so the rule is easy to read.
    4. Return one true / false.
*/

async function isExampleSetupComplete(gameId: number): Promise<boolean> {
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: {
      name: true,
      city: true,
      country: true,
      startDate: true,
      endDate: true,
      planningPeriodStart: true,
      planningPeriodEnd: true,
    },
  });
  if (!game) return false;

  const hasRequiredText =
    game.name.trim() !== '' &&
    game.city.trim() !== '' &&
    game.country.trim() !== '';
  const hasValidGamesDates = game.endDate >= game.startDate;
  const hasValidPlanningPeriod =
    game.planningPeriodEnd >= game.planningPeriodStart;

  return hasRequiredText && hasValidGamesDates && hasValidPlanningPeriod;
}

// TODO(#117): Game Details
async function isGameDetailsComplete(gameId: number): Promise<boolean> {
  return false;
}

// TODO(#118): Participating NSOs
async function isParticipatingNsosComplete(gameId: number): Promise<boolean> {
  return false;
}

// TODO(#119): Properties & Prices
async function isPropertiesComplete(gameId: number): Promise<boolean> {
  return false;
}

// TODO(#120): Planning Deadlines
async function isPlanningDeadlinesComplete(gameId: number): Promise<boolean> {
  return false;
}

// TODO(#121): Accreditation Types
async function isAccreditationTypesComplete(gameId: number): Promise<boolean> {
  return false;
}

// TODO(#122): Estimated Costs (calculator rates)
async function isEstimatedCostsComplete(gameId: number): Promise<boolean> {
  return false;
}

/* eslint-enable @typescript-eslint/no-unused-vars */

// Which function checks which section. Typed against ConfigSectionRoute, so
// adding a section to the list without a function here is a type error.
const COMPLETION_CHECKS: Record<
  ConfigSectionRoute,
  (gameId: number) => Promise<boolean>
> = {
  'example-setup': isExampleSetupComplete,
  'game-details': isGameDetailsComplete,
  'participating-nsos': isParticipatingNsosComplete,
  properties: isPropertiesComplete,
  'planning-deadlines': isPlanningDeadlinesComplete,
  'accreditation-types': isAccreditationTypesComplete,
  'estimated-costs': isEstimatedCostsComplete,
};

// One fetch for all statuses. Cached per request, so the layout and pages share one lookup.
export const getSectionCompletion = cache(
  async (gameId: number): Promise<SectionCompletion> => {
    const keys = Object.keys(COMPLETION_CHECKS) as ConfigSectionRoute[];
    const results = await Promise.all(
      keys.map((key) => COMPLETION_CHECKS[key](gameId)),
    );
    return Object.fromEntries(
      keys.map((key, i) => [key, results[i]]),
    ) as SectionCompletion;
  },
);
