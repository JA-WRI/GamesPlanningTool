// AI contribution: 50% or more AI-generated
'use server';

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import {
  toDbIds,
  UUID_PATTERN,
} from '@/features/team-size/lib/teamSizeDbMapping';
import { canEditNso } from '@/features/team-size/actions/canEditNso';
import {
  allowedDays,
  findPeriodError,
  parsePeriodInput,
  type PeriodData,
} from '../lib/accreditationPeriodLogic';

export type PeriodResult = { ok: true } | { ok: false; error: string };

type DbIds = { gameId: number; nsoId: string };

const INVALID = 'Some details are missing or invalid.';
const NOT_ALLOWED = 'You are not allowed to change this NSO.';
const NOT_FOUND = 'This period was not found.';
const SAVE_FAILED = 'The period could not be saved. Please try again.';
const DELETE_FAILED = 'The period could not be deleted. Please try again.';

const fail = (error: string): PeriodResult => ({ ok: false, error });

// only periods of people in this NSO and this game
const inScope = (ids: DbIds) => ({
  gameMember: { gameId: ids.gameId, member: { nsoId: ids.nsoId } },
});

// the ids must be real and the user must be allowed to edit this NSO
async function checkAccess(
  gameId: string,
  nsoId: string,
): Promise<DbIds | string> {
  const ids = toDbIds(gameId, nsoId);
  if (!ids) return INVALID;
  if (!(await canEditNso(nsoId))) return NOT_ALLOWED;
  return ids;
}

// the checks that need the database, null when the period can be saved
async function findProblem(
  tx: Prisma.TransactionClient,
  ids: DbIds,
  period: PeriodData,
  editedPeriodId?: string,
): Promise<string | null> {
  // an edited period must already belong to this NSO and this game
  if (editedPeriodId) {
    const found = await tx.accreditationPeriod.count({
      where: { id: editedPeriodId, ...inScope(ids) },
    });
    if (!found) return NOT_FOUND;
  }

  const person = await tx.gameMember.findFirst({
    where: {
      id: period.gameMemberId,
      gameId: ids.gameId,
      member: { nsoId: ids.nsoId },
    },
    select: { gameArrival: true, gameDeparture: true },
  });
  if (!person) return 'This person is not part of this NSO for this Game.';

  const hotel = await tx.gameProperty.findUnique({
    where: {
      gameId_propertyId: { gameId: ids.gameId, propertyId: period.propertyId },
    },
    select: { id: true },
  });
  if (!hotel) return 'This hotel is not linked to this Game.';

  const game = await tx.game.findUnique({
    where: { id: ids.gameId },
    select: { startDate: true, endDate: true },
  });
  if (!game) return INVALID;

  // the person's other periods, without the one being edited
  const otherPeriods = await tx.accreditationPeriod.findMany({
    where: {
      gameMemberId: period.gameMemberId,
      id: editedPeriodId ? { not: editedPeriodId } : undefined,
    },
    select: { startDate: true, endDate: true },
  });

  return findPeriodError(
    period,
    allowedDays(
      { start: game.startDate, end: game.endDate },
      person.gameArrival,
      person.gameDeparture,
    ),
    otherPeriods.map((other) => ({
      start: other.startDate,
      end: other.endDate,
    })),
  );
}

// checks and saves in one transaction, so two saves at once can't overlap
async function checkAndSave(
  ids: DbIds,
  period: PeriodData,
  save: (tx: Prisma.TransactionClient) => Promise<unknown>,
  editedPeriodId?: string,
): Promise<PeriodResult> {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const problem = await findProblem(tx, ids, period, editedPeriodId);
        if (problem) return fail(problem);
        await save(tx);
        return { ok: true } as const;
      },
      { isolationLevel: 'Serializable' },
    );
  } catch (error) {
    console.error('Saving an accreditation period failed:', error);
    return fail(SAVE_FAILED);
  }
}

// the period columns as the db wants them
const toDb = (period: PeriodData) => ({
  gameMemberId: period.gameMemberId,
  propertyId: period.propertyId,
  startDate: period.start,
  endDate: period.end,
  status: period.status,
});

export async function createAccreditationPeriod(
  gameId: string,
  nsoId: string,
  input: unknown,
): Promise<PeriodResult> {
  const ids = await checkAccess(gameId, nsoId);
  if (typeof ids === 'string') return fail(ids);
  const period = parsePeriodInput(input);
  if (!period) return fail(INVALID);

  return checkAndSave(ids, period, (tx) =>
    tx.accreditationPeriod.create({ data: toDb(period) }),
  );
}

export async function updateAccreditationPeriod(
  gameId: string,
  nsoId: string,
  periodId: string,
  input: unknown,
): Promise<PeriodResult> {
  const ids = await checkAccess(gameId, nsoId);
  if (typeof ids === 'string') return fail(ids);
  const period = parsePeriodInput(input);
  if (!period || !UUID_PATTERN.test(String(periodId))) return fail(INVALID);

  return checkAndSave(
    ids,
    period,
    (tx) =>
      tx.accreditationPeriod.update({
        where: { id: periodId },
        data: toDb(period),
      }),
    periodId,
  );
}

export async function deleteAccreditationPeriod(
  gameId: string,
  nsoId: string,
  periodId: string,
): Promise<PeriodResult> {
  const ids = await checkAccess(gameId, nsoId);
  if (typeof ids === 'string') return fail(ids);
  if (!UUID_PATTERN.test(String(periodId))) return fail(INVALID);

  try {
    // only deletes when the period belongs to this NSO and this game
    const { count } = await prisma.accreditationPeriod.deleteMany({
      where: { id: periodId, ...inScope(ids) },
    });
    return count ? { ok: true } : fail(NOT_FOUND);
  } catch (error) {
    console.error('Deleting an accreditation period failed:', error);
    return fail(DELETE_FAILED);
  }
}
