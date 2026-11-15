// AI contribution: Below 50% AI-generated
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { prismaMock, getSessionMock } = vi.hoisted(() => ({
  prismaMock: {
    draft: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  getSessionMock: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));
vi.mock('@/lib/data', () => ({ getSession: getSessionMock }));

import {
  deleteDraftDocument,
  getDraftDocument,
  saveDraftDocument,
} from '@/lib/draft-actions';

beforeEach(() => {
  vi.clearAllMocks();
  getSessionMock.mockResolvedValue({
    user: { role: 'admin', gameId: 'game_id_1' },
  });
});

describe('draft actions', () => {
  it('scopes draft reads to the server session and draft key', async () => {
    prismaMock.draft.findUnique.mockResolvedValue({
      schemaVersion: 1,
      payload: [{ id: 'one' }],
    });

    await expect(getDraftDocument('contacts:nso')).resolves.toEqual([
      { id: 'one' },
    ]);
    expect(prismaMock.draft.findUnique).toHaveBeenCalledWith({
      where: { scopeKey: 'admin:game_id_1:all:contacts:nso' },
    });
  });

  it('ignores drafts written with an older schema version without deleting them', async () => {
    prismaMock.draft.findUnique.mockResolvedValue({
      schemaVersion: 1,
      payload: { rows: [] },
    });

    await expect(getDraftDocument('calculator:1:travelers', 2)).resolves.toBe(
      null,
    );
    expect(prismaMock.draft.findUnique).toHaveBeenCalledWith({
      where: { scopeKey: 'admin:game_id_1:all:calculator:1:travelers' },
    });
    expect(prismaMock.draft.delete).not.toHaveBeenCalled();
    expect(prismaMock.draft.deleteMany).not.toHaveBeenCalled();
  });

  it('upserts JSON payloads and increments the draft revision', async () => {
    const payload = [{ id: 'one', name: 'Draft row' }];

    await saveDraftDocument('contacts:nso', payload);

    expect(prismaMock.draft.upsert).toHaveBeenCalledWith({
      where: { scopeKey: 'admin:game_id_1:all:contacts:nso' },
      create: {
        scopeKey: 'admin:game_id_1:all:contacts:nso',
        payload,
        schemaVersion: 1,
      },
      update: {
        payload,
        schemaVersion: 1,
        revision: { increment: 1 },
      },
    });
  });

  it('rejects invalid keys and non-JSON object payloads', async () => {
    await expect(saveDraftDocument('../other', [])).rejects.toThrow(
      'Invalid draft key',
    );
    await expect(
      saveDraftDocument('contacts:nso', 'not-an-object'),
    ).rejects.toThrow('Draft payload must be an object or array');
    expect(prismaMock.draft.upsert).not.toHaveBeenCalled();
  });

  it('deletes only the session-scoped draft record', async () => {
    await deleteDraftDocument('contacts:nso');

    expect(prismaMock.draft.deleteMany).toHaveBeenCalledWith({
      where: { scopeKey: 'admin:game_id_1:all:contacts:nso' },
    });
  });
});
