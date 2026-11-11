// AI contribution: Above 50% AI-generated
'use server';

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/data';

const DRAFT_KEY_PATTERN = /^[a-zA-Z0-9:_-]{1,180}$/;
const MAX_DRAFT_BYTES = 1_000_000;

async function getScopedKey(draftKey: string): Promise<string> {
  if (!DRAFT_KEY_PATTERN.test(draftKey)) {
    throw new Error('Invalid draft key.');
  }

  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized.');

  const { role, gameId, nsoId } = session.user;
  return `${role}:${gameId}:${nsoId ?? 'all'}:${draftKey}`;
}

function toJsonPayload(payload: unknown): Prisma.InputJsonValue {
  const serialized = JSON.stringify(payload);
  if (
    !serialized ||
    new TextEncoder().encode(serialized).byteLength > MAX_DRAFT_BYTES
  ) {
    throw new Error('Draft payload is invalid or too large.');
  }

  const parsed: unknown = JSON.parse(serialized);
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Draft payload must be an object or array.');
  }

  return parsed as Prisma.InputJsonValue;
}

export async function getDraftDocument(
  draftKey: string,
  schemaVersion = 1,
): Promise<unknown | null> {
  const scopeKey = await getScopedKey(draftKey);
  const draft = await prisma.draft.findUnique({ where: { scopeKey } });
  if (!draft) return null;

  if (draft.schemaVersion !== schemaVersion) {
    await prisma.draft.delete({ where: { scopeKey } });
    return null;
  }

  return draft.payload;
}

export async function saveDraftDocument(
  draftKey: string,
  payload: unknown,
  schemaVersion = 1,
): Promise<void> {
  if (!Number.isInteger(schemaVersion) || schemaVersion < 1) {
    throw new Error('Invalid draft schema version.');
  }

  const scopeKey = await getScopedKey(draftKey);
  const jsonPayload = toJsonPayload(payload);

  await prisma.draft.upsert({
    where: { scopeKey },
    create: { scopeKey, payload: jsonPayload, schemaVersion },
    update: {
      payload: jsonPayload,
      schemaVersion,
      revision: { increment: 1 },
    },
  });
}

export async function deleteDraftDocument(draftKey: string): Promise<void> {
  const scopeKey = await getScopedKey(draftKey);
  await prisma.draft.deleteMany({ where: { scopeKey } });
}
