import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/server/queries/games', () => ({
  removeGame: vi.fn(),
}));

vi.mock('@/server/auth/permissions', () => ({
  assertAdmin: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/server/auth/permissions';
import { removeGame } from '@/server/queries/games';
import { deleteGame } from '@/features/system-settings/actions/deleteGame';

const removeGameMock = vi.mocked(removeGame);
const revalidatePathMock = vi.mocked(revalidatePath);
const assertAdminMock = vi.mocked(assertAdmin);

const prismaError = (code: string) =>
  Object.assign(new Error(`Prisma error ${code}`), { code });

describe('deleteGame', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    assertAdminMock.mockResolvedValue(undefined);
    removeGameMock.mockResolvedValue({ id: 1 } as never);

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('permissions', () => {
    it('rejects callers who are not admins', async () => {
      assertAdminMock.mockRejectedValue(
        new Error('Only admins can manage games.'),
      );

      await expect(deleteGame(1)).rejects.toThrow(
        'Only admins can manage games.',
      );
      expect(assertAdminMock).toHaveBeenCalledWith(
        'Only admins can manage games.',
      );
      expect(removeGameMock).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it.each([
      ['a decimal', 1.5],
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
      ['a numeric string', '7' as unknown as number],
      ['undefined', undefined as unknown as number],
      ['null', null as unknown as number],
    ])('rejects %s as an id', async (_label, id) => {
      const result = await deleteGame(id);

      expect(result).toEqual({ ok: false, error: 'Invalid game.' });
      expect(removeGameMock).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it('accepts a whole-number id', async () => {
      await expect(deleteGame(7)).resolves.toEqual({ ok: true });
    });
  });

  describe('deleting', () => {
    it('passes the id to removeGame', async () => {
      await deleteGame(42);

      expect(removeGameMock).toHaveBeenCalledTimes(1);
      expect(removeGameMock).toHaveBeenCalledWith(42);
    });

    it('returns ok on success', async () => {
      await expect(deleteGame(1)).resolves.toEqual({ ok: true });
    });

    it('refreshes the whole layout so the header dropdown updates', async () => {
      await deleteGame(1);

      expect(revalidatePathMock).toHaveBeenCalledTimes(1);
      expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout');
    });
  });

  describe('when the game is already gone (P2025)', () => {
    it('treats it as success', async () => {
      removeGameMock.mockRejectedValue(prismaError('P2025'));

      await expect(deleteGame(1)).resolves.toEqual({ ok: true });
    });

    it('still refreshes so the stale card disappears', async () => {
      removeGameMock.mockRejectedValue(prismaError('P2025'));

      await deleteGame(1);

      expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout');
    });

    it('does not log it as an error', async () => {
      removeGameMock.mockRejectedValue(prismaError('P2025'));

      await deleteGame(1);

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('when other data is linked to the game (P2003)', () => {
    it('returns an explanatory error', async () => {
      removeGameMock.mockRejectedValue(prismaError('P2003'));

      await expect(deleteGame(1)).resolves.toEqual({
        ok: false,
        error:
          'This game has NSOs, members, contacts or other data linked to it, so it cannot be deleted.',
      });
    });

    it('does not refresh the layout, since nothing changed', async () => {
      removeGameMock.mockRejectedValue(prismaError('P2003'));

      await deleteGame(1);

      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it('does not log it as an error, since it is an expected outcome', async () => {
      removeGameMock.mockRejectedValue(prismaError('P2003'));

      await deleteGame(1);

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('when something unexpected fails', () => {
    it('returns a generic error instead of throwing', async () => {
      removeGameMock.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(deleteGame(1)).resolves.toEqual({
        ok: false,
        error: 'Could not delete the game. Please try again.',
      });
    });

    it('treats an unknown Prisma code as unexpected', async () => {
      removeGameMock.mockRejectedValue(prismaError('P2002'));

      const result = await deleteGame(1);

      expect(result).toEqual({
        ok: false,
        error: 'Could not delete the game. Please try again.',
      });
    });

    it('does not leak the underlying error message', async () => {
      removeGameMock.mockRejectedValue(
        new Error('password authentication failed'),
      );

      const result = await deleteGame(1);

      expect(JSON.stringify(result)).not.toContain('password');
    });

    it('does not refresh the layout', async () => {
      removeGameMock.mockRejectedValue(new Error('boom'));

      await deleteGame(1);

      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it('logs the underlying error for debugging', async () => {
      const error = new Error('boom');
      removeGameMock.mockRejectedValue(error);

      await deleteGame(1);

      expect(console.error).toHaveBeenCalledWith('deleteGame failed:', error);
    });

    it('handles a thrown value that is not an Error object', async () => {
      removeGameMock.mockRejectedValue('something odd');

      await expect(deleteGame(1)).resolves.toEqual({
        ok: false,
        error: 'Could not delete the game. Please try again.',
      });
    });

    it('handles a null rejection without crashing', async () => {
      removeGameMock.mockRejectedValue(null);

      const result = await deleteGame(1);

      expect(result.ok).toBe(false);
    });
  });
});
