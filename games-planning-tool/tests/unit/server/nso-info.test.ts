// 50% or more AI generation
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    nso: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { getNsoInfo } from '../../../src/server/queries/nso-info';

const findUnique = vi.mocked(prisma.nso.findUnique);

const nsoRow = (overrides: Record<string, unknown> = {}) =>
  ({
    name: 'some name',
    sport: 'some sport',
    contacts: [{ email: 'some@email' }],
    ...overrides,
  }) as never;

describe('getNsoInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUnique.mockResolvedValue(nsoRow());
  });

  it('looks up the NSO by the id it is given', async () => {
    await getNsoInfo('nso-1', 7);

    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(findUnique.mock.calls[0][0]?.where).toEqual({ id: 'nso-1' });
  });

  it('only considers the primary NSO contact of the requested game', async () => {
    await getNsoInfo('nso-1', 7);

    const select = findUnique.mock.calls[0][0]?.select as {
      contacts: { where: unknown; take: number };
    };
    expect(select.contacts.where).toMatchObject({
      gameId: 7,
      isPrimary: true,
      type: 'NSO',
    });
  });

  it('asks for at most one contact', async () => {
    await getNsoInfo('nso-1', 7);

    const select = findUnique.mock.calls[0][0]?.select as {
      contacts: { take: number };
    };
    expect(select.contacts.take).toBe(1);
  });

  it('returns null when the NSO does not exist', async () => {
    findUnique.mockResolvedValue(null);

    await expect(getNsoInfo('missing', 7)).resolves.toBeNull();
  });

  it('maps the NSO and its primary contact to the page shape', async () => {
    findUnique.mockResolvedValue(
      nsoRow({
        name: 'N',
        sport: 'S',
        contacts: [{ email: 'e@x' }],
      }),
    );

    await expect(getNsoInfo('nso-1', 7)).resolves.toEqual({
      name: 'N',
      sport: 'S',
      primaryContactEmail: 'e@x',
    });
  });

  it('returns an empty email when the NSO has no primary contact', async () => {
    findUnique.mockResolvedValue(nsoRow({ contacts: [] }));

    const info = await getNsoInfo('nso-1', 7);

    expect(info).not.toBeNull();
    expect(info?.primaryContactEmail).toBe('');
  });

  it('uses the first contact if more than one is returned', async () => {
    findUnique.mockResolvedValue(
      nsoRow({ contacts: [{ email: 'first@x' }, { email: 'second@x' }] }),
    );

    const info = await getNsoInfo('nso-1', 7);

    expect(info?.primaryContactEmail).toBe('first@x');
  });

  it('does not swallow database errors', async () => {
    findUnique.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(getNsoInfo('nso-1', 7)).rejects.toThrow('ECONNREFUSED');
  });
});
