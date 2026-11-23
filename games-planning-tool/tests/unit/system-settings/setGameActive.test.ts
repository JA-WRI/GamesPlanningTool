import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/server/queries/games', () => ({
  updateGameActive: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { updateGameActive } from '@/server/queries/games';
import { setGameActive } from '@/features/system-settings/actions/setGameActive';

const updateGameActiveMock = vi.mocked(updateGameActive);
const revalidatePathMock = vi.mocked(revalidatePath);

const prismaError = (code: string) =>
  Object.assign(new Error(`Prisma error ${code}`), { code });

describe('setGameActive', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    updateGameActiveMock.mockResolvedValue({ id: 1 } as never);

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validation', () => {
    it.each([
      ['a decimal id', 1.5, true],
      ['a NaN id', Number.NaN, true],
      ['an Infinity id', Number.POSITIVE_INFINITY, false],
      ['a numeric string id', '7' as unknown as number, true],
      ['an undefined id', undefined as unknown as number, true],
      ['a null id', null as unknown as number, true],
      ['a string flag', 7, 'true' as unknown as boolean],
      ['a numeric flag', 7, 1 as unknown as boolean],
      ['an undefined flag', 7, undefined as unknown as boolean],
      ['a null flag', 7, null as unknown as boolean],
    ])('rejects %s', async (_label, id, isActive) => {
      const result = await setGameActive(id, isActive);

      expect(result).toEqual({ ok: false, error: 'Invalid request.' });
      expect(updateGameActiveMock).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });
  });

  describe('updating', () => {
    it('archives a game by passing false', async () => {
      await setGameActive(42, false);

      expect(updateGameActiveMock).toHaveBeenCalledTimes(1);
      expect(updateGameActiveMock).toHaveBeenCalledWith(42, false);
    });

    it('restores a game by passing true', async () => {
      await setGameActive(42, true);

      expect(updateGameActiveMock).toHaveBeenCalledTimes(1);
      expect(updateGameActiveMock).toHaveBeenCalledWith(42, true);
    });

    it('returns ok on success', async () => {
      await expect(setGameActive(1, false)).resolves.toEqual({ ok: true });
    });

    it('refreshes the whole layout so the header dropdown updates', async () => {
      await setGameActive(1, false);

      expect(revalidatePathMock).toHaveBeenCalledTimes(1);
      expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout');
    });
  });

  describe('when the game no longer exists (P2025)', () => {
    it('returns an explanatory error', async () => {
      updateGameActiveMock.mockRejectedValue(prismaError('P2025'));

      await expect(setGameActive(1, false)).resolves.toEqual({
        ok: false,
        error: 'This game no longer exists.',
      });
    });

    it('still refreshes so the stale card disappears', async () => {
      updateGameActiveMock.mockRejectedValue(prismaError('P2025'));

      await setGameActive(1, false);

      expect(revalidatePathMock).toHaveBeenCalledTimes(1);
      expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout');
    });

    it('does not log it as an error, since it is an expected outcome', async () => {
      updateGameActiveMock.mockRejectedValue(prismaError('P2025'));

      await setGameActive(1, false);

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('when something unexpected fails', () => {
    it('returns a generic error instead of throwing', async () => {
      updateGameActiveMock.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(setGameActive(1, false)).resolves.toEqual({
        ok: false,
        error: 'Could not update the game. Please try again.',
      });
    });

    it('treats an unknown Prisma code as unexpected', async () => {
      updateGameActiveMock.mockRejectedValue(prismaError('P2003'));

      await expect(setGameActive(1, false)).resolves.toEqual({
        ok: false,
        error: 'Could not update the game. Please try again.',
      });
    });

    it('does not leak the underlying error message', async () => {
      updateGameActiveMock.mockRejectedValue(
        new Error('password authentication failed'),
      );

      const result = await setGameActive(1, false);

      expect(JSON.stringify(result)).not.toContain('password');
    });

    it('does not refresh the layout', async () => {
      updateGameActiveMock.mockRejectedValue(new Error('boom'));

      await setGameActive(1, false);

      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it('logs the underlying error for debugging', async () => {
      const error = new Error('boom');
      updateGameActiveMock.mockRejectedValue(error);

      await setGameActive(1, false);

      expect(console.error).toHaveBeenCalledWith(
        'setGameActive failed:',
        error,
      );
    });

    it('handles a thrown value that is not an Error object', async () => {
      updateGameActiveMock.mockRejectedValue('something odd');

      await expect(setGameActive(1, false)).resolves.toEqual({
        ok: false,
        error: 'Could not update the game. Please try again.',
      });
    });

    it('handles a null rejection without crashing', async () => {
      updateGameActiveMock.mockRejectedValue(null);

      const result = await setGameActive(1, false);

      expect(result.ok).toBe(false);
    });
  });
});
