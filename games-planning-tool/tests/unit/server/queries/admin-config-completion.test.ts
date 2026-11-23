// @vitest-environment node
// AI usage -> 100%
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The real package throws outside Next's server environment.
vi.mock('server-only', () => ({}));

// No database connection in unit tests.
vi.mock('@/lib/prisma', () => ({
  prisma: { game: { findUnique: vi.fn() } },
}));

import { prisma } from '@/lib/prisma';
import { CONFIG_SECTIONS } from '@/lib/admin-config-sections';
import { getSectionCompletion } from '@/server/queries/admin-config-completion';

const findUnique = vi.mocked(prisma.game.findUnique);

// A Game that passes the example check.
const validGame = {
  name: 'Paris 2024',
  city: 'Paris',
  country: 'France',
  startDate: new Date('2024-07-26'),
  endDate: new Date('2024-08-11'),
  planningPeriodStart: new Date('2023-01-01'),
  planningPeriodEnd: new Date('2024-06-30'),
};

type MockGame = {
  [K in keyof typeof validGame]: (typeof validGame)[K] | null;
};

function mockGame(game: Partial<MockGame> | null) {
  findUnique.mockResolvedValue(
    (game === null ? null : { ...validGame, ...game }) as never,
  );
}

describe('getSectionCompletion', () => {
  beforeEach(() => {
    findUnique.mockReset();
    mockGame({});
  });

  it('returns true / false for every section in the list', async () => {
    const result = await getSectionCompletion(1);
    expect(Object.keys(result).sort()).toEqual(
      CONFIG_SECTIONS.map((s) => s.key).sort(),
    );
    for (const value of Object.values(result)) {
      expect(typeof value).toBe('boolean');
    }
  });

  it('marks sections whose check is not filled in yet as not complete', async () => {
    const result = await getSectionCompletion(2);
    expect(result['game-details']).toBe(false);
    expect(result['participating-nsos']).toBe(false);
    expect(result.properties).toBe(false);
    expect(result['planning-deadlines']).toBe(false);
    expect(result['accreditation-types']).toBe(false);
    expect(result['estimated-costs']).toBe(false);
  });

  it('queries only the requested Game', async () => {
    await getSectionCompletion(3);
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 3 } }),
    );
  });
});

// The example check, which shows the pattern for #117–#122.
describe('example completion check', () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it('is complete for a Game with all its details and valid dates', async () => {
    mockGame({});
    expect((await getSectionCompletion(10))['example-setup']).toBe(true);
  });

  it('is not complete when the Game does not exist', async () => {
    mockGame(null);
    expect((await getSectionCompletion(11))['example-setup']).toBe(false);
  });

  it.each([
    ['name', { name: '  ' }],
    ['city', { city: '' }],
    ['country', { country: '' }],
  ])('is not complete when the %s is blank', async (_field, change) => {
    mockGame(change);
    expect((await getSectionCompletion(12))['example-setup']).toBe(false);
  });

  it('is not complete when the Games end before they start', async () => {
    mockGame({ endDate: new Date('2024-07-01') });
    expect((await getSectionCompletion(13))['example-setup']).toBe(false);
  });

  it('is not complete when the planning period ends before it starts', async () => {
    mockGame({ planningPeriodEnd: new Date('2022-12-31') });
    expect((await getSectionCompletion(14))['example-setup']).toBe(false);
  });

  it.each([
    'startDate',
    'endDate',
    'planningPeriodStart',
    'planningPeriodEnd',
  ] as const)('is not complete when %s is not set', async (field) => {
    mockGame({ [field]: null });
    expect((await getSectionCompletion(15))['example-setup']).toBe(false);
  });

  it('is not complete for a newly created Game with no dates', async () => {
    mockGame({
      startDate: null,
      endDate: null,
      planningPeriodStart: null,
      planningPeriodEnd: null,
    });
    expect((await getSectionCompletion(16))['example-setup']).toBe(false);
  });
});
