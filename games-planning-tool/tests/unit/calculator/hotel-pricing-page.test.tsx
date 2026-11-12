// AI-assisted tests; reviewed for calculator and hotel pricing requirements.
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/server/queries/games', () => ({ getGamesWithNsos: vi.fn() }));
vi.mock('@/lib/data', () => ({ getSession: vi.fn() }));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NOT_FOUND');
  },
}));
vi.mock('@/features/nso-calculator/components/CalculatorClient', () => ({
  default: () => null,
}));
vi.mock('@/features/nso-calculator/components/HotelPricingSection', () => ({
  default: () => null,
}));
import { getGamesWithNsos } from '@/server/queries/games';
import { getSession } from '@/lib/data';
import Page from '@/app/(application)/[gameId]/[nsoId]/calculator/page';
const params = (gameId: string, nsoId: string) =>
  Promise.resolve({ gameId, nsoId });
beforeEach(() => {
  vi.mocked(getGamesWithNsos).mockResolvedValue([
    {
      id: 7,
      name: 'Games',
      nsos: [
        { id: 'nso-a', name: 'A' },
        { id: 'nso-b', name: 'B' },
      ],
    },
  ]);
  vi.mocked(getSession).mockResolvedValue({
    user: { role: 'admin', gameId: '7' },
  });
});
it('accepts a participating NSO and the database game ID', async () => {
  const result = await Page({ params: params('7', 'nso-a') });
  expect(result.props.children.key).toBe('7');
  expect(result.props.children.props.children.props.gameId).toBe(7);
});
it.each([
  ['game_id_1', 'nso-a'],
  ['7', 'unrelated-nso'],
  ['8', 'nso-a'],
])('rejects invalid game/NSO scope %s %s', async (gameId, nsoId) => {
  await expect(Page({ params: params(gameId, nsoId) })).rejects.toThrow(
    'NOT_FOUND',
  );
});
it('prevents an NSO user opening another participating NSO calculator', async () => {
  vi.mocked(getSession).mockResolvedValue({
    user: { role: 'nso', gameId: '7', nsoId: 'nso-a' },
  });
  await expect(Page({ params: params('7', 'nso-b') })).rejects.toThrow(
    'NOT_FOUND',
  );
});
