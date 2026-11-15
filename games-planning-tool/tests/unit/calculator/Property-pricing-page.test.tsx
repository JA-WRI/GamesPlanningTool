//AI usage: over 50%
import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/server/queries/games', () => ({ getGamesWithNsos: vi.fn() }));
vi.mock('@/lib/data', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/calculator', () => ({ getCalculatorData: vi.fn() }));
vi.mock('@/lib/draft-actions', () => ({ getDraftDocument: vi.fn() }));
vi.mock('@/features/nso-calculator/components/calculator-actions', () => ({
  saveTravelerItems: vi.fn(),
  saveEstimatedCostItems: vi.fn(),
}));
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
import { getCalculatorData } from '@/lib/calculator';
import { getDraftDocument } from '@/lib/draft-actions';
import { ConversionRatesError } from '@/lib/calculator-errors';
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
  vi.mocked(getCalculatorData).mockResolvedValue({
    gameId: game.id,
    nsoId: participatingNso.id,
    gameName: game.name,
    rates: { CAD: 1, USD: 1.38, EUR: 1.48 },
    categories: [],
    travelers: [],
    estimatedCosts: [],
  });
  vi.mocked(getDraftDocument).mockResolvedValue(undefined);
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

it('shows a clear message when conversion rates are unavailable', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(getCalculatorData).mockRejectedValue(
    new ConversionRatesError('Missing rate'),
  );
  const result = await Page({
    params: params(String(game.id), participatingNso.id),
  });
  expect(result.props.role).toBe('alert');
  expect(result.props.children).toContain('currency conversion rates');
  expect(log).toHaveBeenCalled();
  log.mockRestore();
});

it('does not hide unrelated database failures', async () => {
  vi.mocked(getCalculatorData).mockRejectedValue(new Error('database offline'));
  await expect(
    Page({ params: params(String(game.id), participatingNso.id) }),
  ).rejects.toThrow('database offline');
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
