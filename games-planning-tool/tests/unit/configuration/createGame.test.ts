import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/server/queries/games', () => ({
  insertGame: vi.fn(),
}));

import { revalidatePath } from 'next/cache';
import { insertGame } from '@/server/queries/games';
import { createGame } from '@/app/(application)/admin/system-settings/_lib/createGame';

const insertGameMock = vi.mocked(insertGame);
const revalidatePathMock = vi.mocked(revalidatePath);

const valid = { name: 'Summer Games', country: 'USA', city: 'Los Angeles' };

describe('createGame', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    insertGameMock.mockResolvedValue({ id: 1 } as never);

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validation', () => {
    it.each([
      ['name', { ...valid, name: '' }],
      ['country', { ...valid, country: '' }],
      ['city', { ...valid, city: '' }],
    ])('rejects an empty %s', async (_field, input) => {
      const result = await createGame(input);

      expect(result).toEqual({ ok: false, error: 'All fields are required.' });
      expect(insertGameMock).not.toHaveBeenCalled();
      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it.each([
      ['name', { ...valid, name: '   ' }],
      ['country', { ...valid, country: '\t ' }],
      ['city', { ...valid, city: '\n' }],
    ])('rejects a whitespace-only %s', async (_field, input) => {
      const result = await createGame(input);

      expect(result.ok).toBe(false);
      expect(insertGameMock).not.toHaveBeenCalled();
    });

    it('rejects when every field is empty', async () => {
      const result = await createGame({ name: '', country: '', city: '' });

      expect(result).toEqual({ ok: false, error: 'All fields are required.' });
    });

    it('rejects missing input instead of throwing', async () => {
      const result = await createGame(undefined as never);

      expect(result).toEqual({ ok: false, error: 'All fields are required.' });
      expect(insertGameMock).not.toHaveBeenCalled();
    });

    it('rejects missing fields instead of throwing', async () => {
      const result = await createGame({ name: 'Only a name' } as never);

      expect(result.ok).toBe(false);
      expect(insertGameMock).not.toHaveBeenCalled();
    });
  });

  describe('creating', () => {
    it('passes the values to insertGame', async () => {
      await createGame(valid);

      expect(insertGameMock).toHaveBeenCalledTimes(1);
      expect(insertGameMock).toHaveBeenCalledWith(valid);
    });

    it('trims surrounding whitespace before saving', async () => {
      await createGame({
        name: '  Summer Games ',
        country: ' USA',
        city: 'Los Angeles  ',
      });

      expect(insertGameMock).toHaveBeenCalledWith(valid);
    });

    it('keeps inner spaces and accents', async () => {
      await createGame({
        name: 'Jeux  Olympiques',
        country: 'Canada',
        city: 'Montréal',
      });

      expect(insertGameMock).toHaveBeenCalledWith({
        name: 'Jeux  Olympiques',
        country: 'Canada',
        city: 'Montréal',
      });
    });

    it('returns ok on success', async () => {
      await expect(createGame(valid)).resolves.toEqual({ ok: true });
    });

    it('refreshes the whole layout so the header dropdown updates', async () => {
      await createGame(valid);

      expect(revalidatePathMock).toHaveBeenCalledTimes(1);
      expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout');
    });
  });

  describe('when saving fails', () => {
    it('returns a friendly error instead of throwing', async () => {
      insertGameMock.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(createGame(valid)).resolves.toEqual({
        ok: false,
        error: 'Could not create the game. Please try again.',
      });
    });

    it('does not leak the database error message to the caller', async () => {
      insertGameMock.mockRejectedValue(
        new Error('password authentication failed'),
      );

      const result = await createGame(valid);

      expect(JSON.stringify(result)).not.toContain('password');
    });

    it('does not refresh the layout', async () => {
      insertGameMock.mockRejectedValue(new Error('boom'));

      await createGame(valid);

      expect(revalidatePathMock).not.toHaveBeenCalled();
    });

    it('logs the underlying error for debugging', async () => {
      const error = new Error('boom');
      insertGameMock.mockRejectedValue(error);

      await createGame(valid);

      expect(console.error).toHaveBeenCalledWith('createGame failed:', error);
    });
  });
});
