//AI usage: over 50%
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
vi.mock('@/features/nso-calculator/components/PropertyPricingSection', () => ({
  default: () => null,
}));
import { getGamesWithNsos } from '@/server/queries/games';
import { getSession } from '@/lib/data';
import Page from '@/app/(application)/[gameId]/[nsoId]/calculator/page';

const game = {
  id: 7,
  name: 'Games',
  nsos: [
    { id: 'nso-a', name: 'A' },
    { id: 'nso-b', name: 'B' },
  ],
};
const [participatingNso, otherParticipatingNso] = game.nsos;
const unrelatedNsoId = 'unrelated-nso';
const otherGameId = String(game.id + 1);

const params = (gameId: string, nsoId: string) =>
  Promise.resolve({ gameId, nsoId });

beforeEach(() => {
  vi.mocked(getGamesWithNsos).mockResolvedValue([game]);
  vi.mocked(getSession).mockResolvedValue({
    user: { role: 'admin', gameId: String(game.id) },
  });
});

it('accepts a participating NSO and the database game ID', async () => {
  const result = await Page({
    params: params(String(game.id), participatingNso.id),
  });
  expect(result.props.gameName).toBe(game.name);
  expect(result.props.children.key).toBe(String(game.id));
  expect(result.props.children.props.children.props.gameId).toBe(game.id);
});

it.each([
  ['a malformed game ID', 'game_id_1', participatingNso.id],
  ['an NSO not in the game', String(game.id), unrelatedNsoId],
  ['a different game', otherGameId, participatingNso.id],
])('rejects invalid game/NSO scope: %s', async (_label, gameId, nsoId) => {
  await expect(Page({ params: params(gameId, nsoId) })).rejects.toThrow(
    'NOT_FOUND',
  );
});

it('prevents an NSO user opening another participating NSO calculator', async () => {
  vi.mocked(getSession).mockResolvedValue({
    user: { role: 'nso', gameId: String(game.id), nsoId: participatingNso.id },
  });
  await expect(
    Page({ params: params(String(game.id), otherParticipatingNso.id) }),
  ).rejects.toThrow('NOT_FOUND');
});
