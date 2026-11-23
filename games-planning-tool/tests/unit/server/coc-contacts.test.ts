// 50% or more AI generation
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { getCocContacts } from '../../../src/server/queries/coc-contacts';

const findMany = vi.mocked(prisma.contact.findMany);

describe('getCocContacts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([]);
  });

  it('only asks for COC contacts of the requested game', async () => {
    await getCocContacts(7);

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany.mock.calls[0][0]?.where).toMatchObject({
      gameId: 7,
      type: 'COC',
    });
  });

  it('is not scoped to an NSO, since COC contacts belong to the game', async () => {
    await getCocContacts(7);

    expect(findMany.mock.calls[0][0]?.where).not.toHaveProperty('nsoId');
  });

  it('uses the game id it is given', async () => {
    await getCocContacts(1);
    await getCocContacts(2);

    expect(findMany.mock.calls[0][0]?.where).toMatchObject({ gameId: 1 });
    expect(findMany.mock.calls[1][0]?.where).toMatchObject({ gameId: 2 });
  });

  it('returns whatever the database returns, without altering it', async () => {
    const rows = [{ id: 'a' }, { id: 'b' }];
    findMany.mockResolvedValue(rows as never);

    await expect(getCocContacts(1)).resolves.toBe(rows);
  });

  it('returns an empty list when there are no COC contacts', async () => {
    await expect(getCocContacts(99)).resolves.toEqual([]);
  });

  it('does not swallow database errors', async () => {
    findMany.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(getCocContacts(1)).rejects.toThrow('ECONNREFUSED');
  });
});
