// AI contribution: Above 50% AI-generated
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn() }));
vi.mock('@/lib/prisma', () => ({ prisma: { gameNso: { findMany } } }));
vi.mock('@/app/(application)/[gameId]/(coc)/dashboard/DashboardClient', () => ({
  default: () => null,
}));
import DashboardPage from '@/app/(application)/[gameId]/(coc)/dashboard/page';

beforeEach(() => {
  vi.resetAllMocks();
  findMany.mockResolvedValue([]);
});

describe('COC dashboard database loading', () => {
  it.each(['game_id_2', '2'])(
    'loads the selected game using route %s',
    async (gameId) => {
      await DashboardPage({ params: Promise.resolve({ gameId }) });
      expect(findMany).toHaveBeenCalledExactlyOnceWith({
        where: { gameId: 2 },
        include: { nso: true, progressTracking: true },
      });
    },
  );

  it('passes every returned NSO and its saved statuses to the dashboard', async () => {
    findMany.mockResolvedValue([
      {
        id: 'pair-a',
        nso: { name: 'NSO A' },
        progressTracking: {
          contactInfo: 'completed',
          teamSize: 'in_progress',
          accreditation: 'submitted',
          estimatedCosts: 'requires_update',
          reviewAndCompletion: 'not_started',
        },
      },
      { id: 'pair-b', nso: { name: 'NSO B' }, progressTracking: null },
    ]);
    const page = await DashboardPage({
      params: Promise.resolve({ gameId: 'game_id_1' }),
    });
    expect(page.props.teams.map((team: { name: string }) => team.name)).toEqual(
      ['NSO A', 'NSO B'],
    );
    expect(page.props.dashboardCharts[0].counts.Completed).toBe(1);
    expect(page.props.dashboardCharts[0].counts['Not Started']).toBe(1);
  });

  it('changes the database filter when switching games', async () => {
    const sameNso = { name: 'NSO A' };
    findMany
      .mockResolvedValueOnce([
        {
          id: 'pair-game-1',
          nso: sameNso,
          progressTracking: {
            contactInfo: 'completed',
            teamSize: 'completed',
            accreditation: 'completed',
            estimatedCosts: 'completed',
            reviewAndCompletion: 'completed',
          },
        },
      ])
      .mockResolvedValueOnce([
        { id: 'pair-game-3', nso: sameNso, progressTracking: null },
      ]);
    const firstGame = await DashboardPage({
      params: Promise.resolve({ gameId: 'game_id_1' }),
    });
    const secondGame = await DashboardPage({
      params: Promise.resolve({ gameId: 'game_id_3' }),
    });
    expect(findMany.mock.calls.map(([query]) => query.where.gameId)).toEqual([
      1, 3,
    ]);
    expect(firstGame.props.teams[0].columns[0].status).toBe('Completed');
    expect(secondGame.props.teams[0].columns[0].status).toBe('Not Started');
    expect(secondGame.props.dashboardCharts[0].counts.Completed).toBe(0);
  });

  it('reads changed database results when the same game page is loaded again', async () => {
    const pairing = { id: 'pair-a', nso: { name: 'NSO A' } };
    findMany
      .mockResolvedValueOnce([{ ...pairing, progressTracking: null }])
      .mockResolvedValueOnce([
        {
          ...pairing,
          progressTracking: {
            contactInfo: 'completed',
            teamSize: 'not_started',
            accreditation: 'not_started',
            estimatedCosts: 'not_started',
            reviewAndCompletion: 'not_started',
          },
        },
      ]);

    const firstLoad = await DashboardPage({
      params: Promise.resolve({ gameId: '1' }),
    });
    const nextLoad = await DashboardPage({
      params: Promise.resolve({ gameId: '1' }),
    });

    expect(findMany).toHaveBeenCalledTimes(2);
    expect(firstLoad.props.teams[0].columns[0].status).toBe('Not Started');
    expect(nextLoad.props.teams[0].columns[0].status).toBe('Completed');
    expect(nextLoad.props.dashboardCharts[0].counts.Completed).toBe(1);
    expect(nextLoad.props.dashboardCharts[0].counts['Not Started']).toBe(0);
  });

  it.each(['2147483647', 'game_id_2147483647'])(
    'accepts the largest PostgreSQL integer game ID in route %s',
    async (gameId) => {
      await DashboardPage({ params: Promise.resolve({ gameId }) });
      expect(findMany).toHaveBeenCalledExactlyOnceWith({
        where: { gameId: 2147483647 },
        include: { nso: true, progressTracking: true },
      });
    },
  );

  it.each([
    '',
    'game_id_x',
    '0',
    '-1',
    '1.5',
    'game_id_0',
    '2147483648',
    '9007199254740993',
    'game_id_2147483648',
    '1abc',
    'game_id_1/extra',
    '1e2',
  ])(
    'shows an empty dashboard without querying the database for invalid ID %s',
    async (gameId) => {
      const page = await DashboardPage({ params: Promise.resolve({ gameId }) });
      expect(findMany).not.toHaveBeenCalled();
      expect(page.props.teams).toEqual([]);
      expect(page.props.dashboardCharts).toHaveLength(5);
    },
  );

  it('shows an empty dashboard when the selected game has no NSOs', async () => {
    const page = await DashboardPage({
      params: Promise.resolve({ gameId: '1' }),
    });
    expect(findMany).toHaveBeenCalledOnce();
    expect(page.props.teams).toEqual([]);
    expect(page.props.dashboardCharts[0].counts['Not Started']).toBe(0);
  });

  it('does not disguise a database failure as an empty game', async () => {
    findMany.mockRejectedValue(new Error('Database unavailable'));
    await expect(
      DashboardPage({ params: Promise.resolve({ gameId: '1' }) }),
    ).rejects.toThrow('Database unavailable');
  });
});
